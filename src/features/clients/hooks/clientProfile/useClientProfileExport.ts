
import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Operation } from "@/features/operations/types";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format } from "date-fns";
import { toast } from "sonner";
import { Client } from "@/features/clients/types";

export const useClientProfileExport = (
  client: Client | null,
  clientOperations: Operation[],
  qrCodeRef: React.RefObject<HTMLDivElement>
) => {
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
    formatAmount,
    exportToExcel,
    exportToPDF
  };
};
