
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";
import { toast } from "sonner";
import { useOperations } from "@/features/operations/hooks/useOperations";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";

export const useClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const { operations } = useOperations();
  const [isLoading, setIsLoading] = useState(true);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<Operation["type"] | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date(new Date().setDate(new Date().getDate() - 30))),
    to: endOfDay(new Date())
  });
  const [isCustomRange, setIsCustomRange] = useState(false);

  const clientId = id ? Number(id) : null;

  const clientOperations = operations.filter(op => {
    if (client) {
      const clientFullName = `${client.prenom} ${client.nom}`;
      return op.fromClient === clientFullName || op.toClient === clientFullName;
    }
    return false;
  });

  const filteredOperations = clientOperations
    .filter(op => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const operationDate = parseISO(op.date);
      return isWithinInterval(operationDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    })
    .filter(op => {
      if (selectedType === "all") return true;
      return op.type === selectedType;
    })
    .filter(op => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        op.description.toLowerCase().includes(searchLower) ||
        op.fromClient?.toLowerCase().includes(searchLower) ||
        op.toClient?.toLowerCase().includes(searchLower) ||
        op.amount.toString().includes(searchLower)
      );
    });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!clientId) {
          console.error("Client ID manquant dans l'URL");
          setIsLoading(false);
          return;
        }
        
        console.log("Tentative de récupération du client avec ID:", clientId);
        
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) {
          console.error("Erreur lors du chargement du client:", error);
          toast.error("Impossible de charger les informations du client");
          throw error;
        }

        console.log("Client récupéré avec succès:", data);
        setClient(data);
      } catch (error) {
        console.error("Erreur lors du chargement du client:", error);
        toast.error("Impossible de charger les informations du client");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();

    const clientSubscription = supabase
      .channel('public_client_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`,
      }, (payload) => {
        console.log("Mise à jour client reçue:", payload);
        setClient(payload.new as Client);
      })
      .subscribe();

    const depositsSubscription = supabase
      .channel('deposits_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deposits',
      }, () => {
        fetchClient();
      })
      .subscribe();

    const withdrawalsSubscription = supabase
      .channel('withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawals',
      }, () => {
        fetchClient();
      })
      .subscribe();

    const transfersSubscription = supabase
      .channel('transfers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transfers',
      }, () => {
        fetchClient();
      })
      .subscribe();

    return () => {
      clientSubscription.unsubscribe();
      depositsSubscription.unsubscribe();
      withdrawalsSubscription.unsubscribe();
      transfersSubscription.unsubscribe();
    };
  }, [clientId]);

  const formatAmount = (amount: number) => {
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "")} TND`;
  };

  const exportToExcel = () => {
    if (!client || !clientOperations.length) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    const operationsData = clientOperations.map(op => ({
      'Type': op.type === 'deposit' ? 'Versement' : op.type === 'withdrawal' ? 'Retrait' : 'Virement',
      'Date': format(new Date(op.date), 'dd/MM/yyyy HH:mm'),
      'Description': op.description,
      'Montant': op.amount,
      'De': op.fromClient,
      'À': op.toClient || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(operationsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Opérations");
    
    const clientInfo = [
      ['Client:', `${client.prenom} ${client.nom}`],
      ['Solde:', `${client.solde.toLocaleString('fr-FR')} TND`],
      ['Téléphone:', client.telephone],
      ['Email:', client.email],
      ['Date de création:', format(new Date(client.date_creation || ''), 'dd/MM/yyyy')]
    ];
    
    const wsClient = XLSX.utils.aoa_to_sheet(clientInfo);
    XLSX.utils.book_append_sheet(wb, wsClient, "Informations Client");

    XLSX.writeFile(wb, `operations_${client.prenom}_${client.nom}.xlsx`);
    toast.success("Export Excel réussi");
  };

  const exportToPDF = async () => {
    if (!client || !clientOperations.length) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    const doc = new jsPDF();
    
    // Ajouter le titre
    doc.setFontSize(20);
    doc.text(`Profil de ${client.prenom} ${client.nom}`, 15, 15);
    
    // Informations client
    doc.setFontSize(12);
    doc.text(`Solde: ${formatAmount(client.solde)}`, 15, 25);
    doc.text(`Téléphone: ${client.telephone}`, 15, 32);
    doc.text(`Email: ${client.email}`, 15, 39);
    doc.text(`Date de création: ${format(new Date(client.date_creation || ''), 'dd/MM/yyyy')}`, 15, 46);

    // Ajouter le QR code s'il est disponible
    if (qrCodeRef.current) {
      const canvas = await html2canvas(qrCodeRef.current);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 150, 15, 40, 40);
    }

    let yPosition = 60;

    // Versements
    const deposits = clientOperations.filter(op => op.type === "deposit");
    if (deposits.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94); // text-green-600
      doc.text("Versements", 15, yPosition);
      yPosition += 10;

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Description', 'Montant']],
        body: deposits.map(op => [
          format(new Date(op.date), 'dd/MM/yyyy HH:mm'),
          op.description,
          formatAmount(op.amount)
        ]),
        theme: 'grid',
        headStyles: { 
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontSize: 10
        },
        styles: { 
          fontSize: 9,
          cellPadding: 2,
          textColor: [0, 0, 0]
        },
        columnStyles: {
          2: { halign: 'right' }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Retraits
    const withdrawals = clientOperations.filter(op => op.type === "withdrawal");
    if (withdrawals.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(239, 68, 68); // text-red-600
      doc.text("Retraits", 15, yPosition);
      yPosition += 10;

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Description', 'Montant']],
        body: withdrawals.map(op => [
          format(new Date(op.date), 'dd/MM/yyyy HH:mm'),
          op.description,
          formatAmount(op.amount)
        ]),
        theme: 'grid',
        headStyles: { 
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontSize: 10
        },
        styles: { 
          fontSize: 9,
          cellPadding: 2,
          textColor: [0, 0, 0]
        },
        columnStyles: {
          2: { halign: 'right' }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Virements
    const transfers = clientOperations.filter(op => op.type === "transfer");
    if (transfers.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(147, 51, 234); // text-purple-600
      doc.text("Virements", 15, yPosition);
      yPosition += 10;

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Description', 'Montant', 'De', 'À']],
        body: transfers.map(op => [
          format(new Date(op.date), 'dd/MM/yyyy HH:mm'),
          op.description,
          formatAmount(op.amount),
          op.fromClient,
          op.toClient || '-'
        ]),
        theme: 'grid',
        headStyles: { 
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontSize: 10
        },
        styles: { 
          fontSize: 9,
          cellPadding: 2,
          textColor: [0, 0, 0]
        },
        columnStyles: {
          2: { halign: 'right' }
        }
      });
    }

    doc.save(`profil_${client.prenom}_${client.nom}.pdf`);
    toast.success("Export PDF réussi");
  };

  return {
    client,
    clientId,
    clientOperations,
    filteredOperations,
    isLoading,
    navigate,
    qrCodeRef,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange,
    formatAmount,
    exportToExcel,
    exportToPDF
  };
};
