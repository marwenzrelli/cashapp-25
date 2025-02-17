import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";
import { ClientQRCode } from "@/features/clients/components/ClientQRCode";
import { OperationCard } from "@/features/operations/components/OperationCard";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
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
  const [selectedType, setSelectedType] = useState<Operation["type"] | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
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

  const getTypeStyle = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "bg-green-50 text-green-600 dark:bg-green-950/50";
      case "withdrawal":
        return "bg-red-50 text-red-600 dark:bg-red-950/50";
      case "transfer":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/50";
    }
  };

  const getTypeIcon = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowUpCircle className="h-4 w-4" />;
      case "withdrawal":
        return <ArrowDownCircle className="h-4 w-4" />;
      case "transfer":
        return <RefreshCcw className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "Versement";
      case "withdrawal":
        return "Retrait";
      case "transfer":
        return "Virement";
    }
  };

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
              <div className="mb-6">
                <OperationFilters
                  selectedType={selectedType}
                  searchTerm={searchTerm}
                  date={dateRange}
                  isCustomRange={isCustomRange}
                  onTypeSelect={setSelectedType}
                  onSearch={setSearchTerm}
                  onDateChange={setDateRange}
                  onCustomRangeChange={setIsCustomRange}
                />
              </div>

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

                <TabsContent value="all">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
                      <div>Type</div>
                      <div>Date</div>
                      <div>Description</div>
                      <div className="text-right">Montant</div>
                      <div>Client</div>
                    </div>
                    {filteredOperations.map((operation) => (
                      <div key={operation.id} className="grid grid-cols-5 gap-4 p-4 border-t">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                            {getTypeIcon(operation.type)}
                          </div>
                          <span>{getTypeLabel(operation.type)}</span>
                        </div>
                        <div>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</div>
                        <div className="truncate">{operation.description}</div>
                        <div className="text-right font-medium">{Math.round(operation.amount)} TND</div>
                        <div className="truncate">
                          {operation.type === "transfer" ? (
                            <>{operation.fromClient} → {operation.toClient}</>
                          ) : (
                            operation.fromClient
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="deposits">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
                      <div>Date</div>
                      <div>Description</div>
                      <div className="text-right">Montant</div>
                      <div>Client</div>
                    </div>
                    {filteredOperations.filter(op => op.type === "deposit").map((operation) => (
                      <div key={operation.id} className="grid grid-cols-4 gap-4 p-4 border-t">
                        <div>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</div>
                        <div className="truncate">{operation.description}</div>
                        <div className="text-right font-medium">{Math.round(operation.amount)} TND</div>
                        <div className="truncate">{operation.fromClient}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="withdrawals">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
                      <div>Date</div>
                      <div>Description</div>
                      <div className="text-right">Montant</div>
                      <div>Client</div>
                    </div>
                    {filteredOperations.filter(op => op.type === "withdrawal").map((operation) => (
                      <div key={operation.id} className="grid grid-cols-4 gap-4 p-4 border-t">
                        <div>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</div>
                        <div className="truncate">{operation.description}</div>
                        <div className="text-right font-medium">{Math.round(operation.amount)} TND</div>
                        <div className="truncate">{operation.fromClient}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="transfers">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
                      <div>Date</div>
                      <div>Description</div>
                      <div className="text-right">Montant</div>
                      <div>De</div>
                      <div>À</div>
                    </div>
                    {filteredOperations.filter(op => op.type === "transfer").map((operation) => (
                      <div key={operation.id} className="grid grid-cols-5 gap-4 p-4 border-t">
                        <div>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</div>
                        <div className="truncate">{operation.description}</div>
                        <div className="text-right font-medium">{Math.round(operation.amount)} TND</div>
                        <div className="truncate">{operation.fromClient}</div>
                        <div className="truncate">{operation.toClient}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Versements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-green-600" />
                Versements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium text-sm">Date</th>
                      <th className="text-left p-4 font-medium text-sm">Description</th>
                      <th className="text-right p-4 font-medium text-sm">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientOperations
                      .filter(op => op.type === "deposit")
                      .map((operation) => (
                        <tr key={operation.id} className="border-b last:border-0">
                          <td className="p-4">{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</td>
                          <td className="p-4">{operation.description}</td>
                          <td className="p-4 text-right font-medium text-green-600">{formatAmount(operation.amount)}</td>
                        </tr>
                    ))}
                    {clientOperations.filter(op => op.type === "deposit").length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center p-4 text-muted-foreground">Aucun versement</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Retraits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-red-600" />
                Retraits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium text-sm">Date</th>
                      <th className="text-left p-4 font-medium text-sm">Description</th>
                      <th className="text-right p-4 font-medium text-sm">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientOperations
                      .filter(op => op.type === "withdrawal")
                      .map((operation) => (
                        <tr key={operation.id} className="border-b last:border-0">
                          <td className="p-4">{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</td>
                          <td className="p-4">{operation.description}</td>
                          <td className="p-4 text-right font-medium text-red-600">{formatAmount(operation.amount)}</td>
                        </tr>
                    ))}
                    {clientOperations.filter(op => op.type === "withdrawal").length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center p-4 text-muted-foreground">Aucun retrait</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Virements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCcw className="h-5 w-5 text-purple-600" />
                Virements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium text-sm">Date</th>
                      <th className="text-left p-4 font-medium text-sm">Description</th>
                      <th className="text-right p-4 font-medium text-sm">Montant</th>
                      <th className="text-left p-4 font-medium text-sm">De</th>
                      <th className="text-left p-4 font-medium text-sm">À</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientOperations
                      .filter(op => op.type === "transfer")
                      .map((operation) => (
                        <tr key={operation.id} className="border-b last:border-0">
                          <td className="p-4">{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</td>
                          <td className="p-4">{operation.description}</td>
                          <td className="p-4 text-right font-medium text-purple-600">{formatAmount(operation.amount)}</td>
                          <td className="p-4">{operation.fromClient}</td>
                          <td className="p-4">{operation.toClient}</td>
                        </tr>
                    ))}
                    {clientOperations.filter(op => op.type === "transfer").length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-4 text-muted-foreground">Aucun virement</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
              <div className="text-3xl font-bold">
                {formatAmount(client.solde)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </p>
              <div className="mt-6" ref={qrCodeRef}>
                <ClientQRCode clientId={clientId} clientName={`${client.prenom} ${client.nom}`} />
              </div>
              <div className="flex gap-2 mt-6">
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
