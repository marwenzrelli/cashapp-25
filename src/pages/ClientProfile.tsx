import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { ClientQRCode } from "@/features/clients/components/ClientQRCode";
import { OperationCard } from "@/features/operations/components/OperationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, User, Phone, Mail, Calendar, Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCcw, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { useOperations } from "@/features/operations/hooks/useOperations";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const { operations } = useOperations();
  const [isLoading, setIsLoading] = useState(true);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const clientId = id ? Number(id) : null;

  const clientOperations = operations.filter(op => {
    if (client) {
      const clientFullName = `${client.prenom} ${client.nom}`;
      return op.fromClient === clientFullName || op.toClient === clientFullName;
    }
    return false;
  });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!clientId) return;
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) throw error;
        setClient(data);
      } catch (error) {
        console.error("Erreur lors du chargement du client:", error);
        toast.error("Impossible de charger les informations du client");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client || !clientId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <h2 className="text-2xl font-bold mb-4">Client non trouvé</h2>
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour à la liste des clients
        </Button>
      </div>
    );
  }

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
    doc.text(`Solde: ${client.solde.toLocaleString('fr-FR')} TND`, 15, 25);
    doc.text(`Téléphone: ${client.telephone}`, 15, 32);
    doc.text(`Email: ${client.email}`, 15, 39);
    doc.text(`Date de création: ${format(new Date(client.date_creation || ''), 'dd/MM/yyyy')}`, 15, 46);

    // Ajouter le QR code s'il est disponible
    if (qrCodeRef.current) {
      const canvas = await html2canvas(qrCodeRef.current);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 150, 15, 40, 40);
    }

    // Tableau des opérations
    const operationsData = clientOperations.map(op => [
      op.type === 'deposit' ? 'Versement' : op.type === 'withdrawal' ? 'Retrait' : 'Virement',
      format(new Date(op.date), 'dd/MM/yyyy HH:mm'),
      op.description,
      op.amount.toLocaleString('fr-FR') + ' TND',
      op.fromClient,
      op.toClient || '-'
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['Type', 'Date', 'Description', 'Montant', 'De', 'À']],
      body: operationsData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: { fillColor: [63, 63, 70] }
    });

    doc.save(`profil_${client.prenom}_${client.nom}.pdf`);
    toast.success("Export PDF réussi");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="w-full md:w-2/3 space-y-6">
          <div>
            <Button variant="ghost" onClick={() => navigate('/clients')} className="mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour aux clients
            </Button>
            <h1 className="text-3xl font-bold">Profil Client</h1>
            <p className="text-muted-foreground">
              Détails et historique des opérations
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nom complet</p>
                      <p className="font-medium">{client.prenom} {client.nom}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{client.telephone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date de création</p>
                      <p className="font-medium">{format(new Date(client.date_creation || ''), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des opérations</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 flex flex-wrap gap-2">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    Toutes les opérations
                  </TabsTrigger>
                  <TabsTrigger value="deposits" className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4" />
                    Versements
                  </TabsTrigger>
                  <TabsTrigger value="withdrawals" className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4" />
                    Retraits
                  </TabsTrigger>
                  <TabsTrigger value="transfers" className="flex items-center gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Virements
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {clientOperations.map((operation) => (
                    <OperationCard
                      key={operation.id}
                      operation={{
                        ...operation,
                        id: operation.id.slice(-6)
                      }}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="deposits" className="space-y-4">
                  {clientOperations.filter(op => op.type === "deposit").map((operation) => (
                    <OperationCard
                      key={operation.id}
                      operation={{
                        ...operation,
                        id: operation.id.slice(-6)
                      }}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="withdrawals" className="space-y-4">
                  {clientOperations.filter(op => op.type === "withdrawal").map((operation) => (
                    <OperationCard
                      key={operation.id}
                      operation={{
                        ...operation,
                        id: operation.id.slice(-6)
                      }}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="transfers" className="space-y-4">
                  {clientOperations.filter(op => op.type === "transfer").map((operation) => (
                    <OperationCard
                      key={operation.id}
                      operation={{
                        ...operation,
                        id: operation.id.slice(-6)
                      }}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/3 space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Solde actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{client.solde.toLocaleString('fr-FR')} TND</div>
              <p className="text-sm text-muted-foreground mt-2">
                Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </p>
              <div className="mt-6" ref={qrCodeRef}>
                <ClientQRCode clientId={clientId} clientName={`${client.prenom} ${client.nom}`} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={exportToExcel}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={exportToPDF}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
