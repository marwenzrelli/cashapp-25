import { useEffect, useState } from "react";
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
import { ChevronLeft, User, Phone, Mail, Calendar, Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useOperations } from "@/features/operations/hooks/useOperations";

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const { operations } = useOperations();
  const [isLoading, setIsLoading] = useState(true);

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
        if (!id) return;
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
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
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client) {
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

  return (
    <div className="space-y-8 pb-8 animate-in">
      <div className="flex items-center justify-between">
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
        <ClientQRCode clientId={parseInt(id!)} clientName={`${client.prenom} ${client.nom}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
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

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Solde actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{client.solde.toLocaleString()} €</div>
            <p className="text-sm text-muted-foreground mt-2">
              Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des opérations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
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
                  operation={operation}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
              {clientOperations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune opération trouvée</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="deposits" className="space-y-4">
              {clientOperations.filter(op => op.type === "deposit").map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </TabsContent>

            <TabsContent value="withdrawals" className="space-y-4">
              {clientOperations.filter(op => op.type === "withdrawal").map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </TabsContent>

            <TabsContent value="transfers" className="space-y-4">
              {clientOperations.filter(op => op.type === "transfer").map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProfile;
