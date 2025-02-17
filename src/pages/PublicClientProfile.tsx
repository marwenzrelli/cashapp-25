import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, Calendar, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { OperationCard } from "@/features/operations/components/OperationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PublicClientProfile = () => {
  const { token } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        if (!token) return;

        console.log("Début de la récupération des données avec le token:", token);

        // Récupérer d'abord l'accès QR
        const { data: qrAccess, error: qrError } = await supabase
          .from('qr_access')
          .select('client_id, expires_at')
          .eq('access_token', token)
          .single();

        if (qrError) {
          console.error("Erreur QR Access:", qrError);
          throw new Error("Token d'accès invalide");
        }
        
        console.log("QR Access trouvé:", qrAccess);
        
        if (qrAccess.expires_at && new Date(qrAccess.expires_at) < new Date()) {
          throw new Error("Le lien a expiré");
        }

        // Récupérer les informations du client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', qrAccess.client_id)
          .single();

        if (clientError) {
          console.error("Erreur Client:", clientError);
          throw clientError;
        }

        console.log("Client trouvé:", clientData);
        setClient(clientData);

        // Récupérer toutes les opérations
        const clientFullName = `${clientData.prenom} ${clientData.nom}`;
        console.log("Recherche des opérations pour:", clientFullName);

        // Récupérer les versements
        const { data: deposits, error: depositsError } = await supabase
          .from('deposits')
          .select('*')
          .eq('client_name', clientFullName)
          .eq('status', 'completed')
          .order('operation_date', { ascending: false });

        if (depositsError) {
          console.error("Erreur lors de la récupération des versements:", depositsError);
        } else {
          console.log("Versements trouvés:", deposits);
        }

        // Récupérer les retraits
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('client_name', clientFullName)
          .eq('status', 'completed')
          .order('operation_date', { ascending: false });

        if (withdrawalsError) {
          console.error("Erreur lors de la récupération des retraits:", withdrawalsError);
        } else {
          console.log("Retraits trouvés:", withdrawals);
        }

        // Récupérer les virements
        const { data: transfers, error: transfersError } = await supabase
          .from('transfers')
          .select('*')
          .or(`from_client.eq."${clientFullName}",to_client.eq."${clientFullName}"`)
          .eq('status', 'completed')
          .order('operation_date', { ascending: false });

        if (transfersError) {
          console.error("Erreur lors de la récupération des virements:", transfersError);
        } else {
          console.log("Virements trouvés:", transfers);
        }

        // Transformer les données en format unifié
        const allOperations: Operation[] = [
          ...(deposits || []).map((d): Operation => ({
            id: d.id.toString().slice(-6),
            type: "deposit",
            amount: d.amount,
            date: d.operation_date,
            description: `Versement de ${d.client_name}`,
            fromClient: d.client_name
          })),
          ...(withdrawals || []).map((w): Operation => ({
            id: w.id.toString().slice(-6),
            type: "withdrawal",
            amount: w.amount,
            date: w.operation_date,
            description: `Retrait par ${w.client_name}`,
            fromClient: w.client_name
          })),
          ...(transfers || []).map((t): Operation => ({
            id: t.id.toString().slice(-6),
            type: "transfer",
            amount: t.amount,
            date: t.operation_date,
            description: t.reason || "Virement",
            fromClient: t.from_client,
            toClient: t.to_client
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log("Opérations transformées:", allOperations);
        setOperations(allOperations);
      } catch (err) {
        console.error("Erreur complète:", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();

    // Mettre en place la souscription en temps réel
    const clientSubscription = supabase
      .channel('public_client_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${client?.id}`,
      }, (payload) => {
        setClient(payload.new as Client);
      })
      .subscribe();

    // Souscriptions pour les opérations
    const depositsSubscription = supabase
      .channel('deposits_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deposits',
      }, () => {
        fetchClientData();
      })
      .subscribe();

    const withdrawalsSubscription = supabase
      .channel('withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawals',
      }, () => {
        fetchClientData();
      })
      .subscribe();

    const transfersSubscription = supabase
      .channel('transfers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transfers',
      }, () => {
        fetchClientData();
      })
      .subscribe();

    return () => {
      clientSubscription.unsubscribe();
      depositsSubscription.unsubscribe();
      withdrawalsSubscription.unsubscribe();
      transfersSubscription.unsubscribe();
    };
  }, [token, client?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-destructive">{error || "Client non trouvé"}</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 p-2 sm:p-8">
      <div className="max-w-md mx-auto space-y-4">
        {client && (
          <>
            {/* Solde */}
            <Card className="relative overflow-hidden backdrop-blur-xl bg-white/50 dark:bg-gray-950/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-2xl">Solde actuel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{client.solde.toLocaleString()} €</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </p>
              </CardContent>
            </Card>

            {/* Informations personnelles */}
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-950/50">
              <CardHeader>
                <CardTitle className="text-lg">Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Historique des opérations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Historique des opérations</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full flex overflow-x-auto no-scrollbar p-0 rounded-none border-b">
                    <TabsTrigger value="all" className="flex-1 text-sm">
                      Tout
                    </TabsTrigger>
                    <TabsTrigger value="deposits" className="flex-1 text-sm">
                      <ArrowUpCircle className="h-4 w-4 mr-1" />
                      Versements
                    </TabsTrigger>
                    <TabsTrigger value="withdrawals" className="flex-1 text-sm">
                      <ArrowDownCircle className="h-4 w-4 mr-1" />
                      Retraits
                    </TabsTrigger>
                    <TabsTrigger value="transfers" className="flex-1 text-sm">
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Virements
                    </TabsTrigger>
                  </TabsList>

                  <div className="px-2 sm:px-0">
                    <TabsContent value="all" className="space-y-2 mt-2">
                      {operations.map((operation) => (
                        <OperationCard
                          key={operation.id}
                          operation={operation}
                          onEdit={undefined}
                          onDelete={undefined}
                        />
                      ))}
                      {operations.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Aucune opération trouvée</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="deposits" className="space-y-2 mt-2">
                      {operations.filter(op => op.type === "deposit").map((operation) => (
                        <OperationCard
                          key={operation.id}
                          operation={operation}
                          onEdit={undefined}
                          onDelete={undefined}
                        />
                      ))}
                      {operations.filter(op => op.type === "deposit").length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Aucun versement trouvé</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="withdrawals" className="space-y-2 mt-2">
                      {operations.filter(op => op.type === "withdrawal").map((operation) => (
                        <OperationCard
                          key={operation.id}
                          operation={operation}
                          onEdit={undefined}
                          onDelete={undefined}
                        />
                      ))}
                      {operations.filter(op => op.type === "withdrawal").length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Aucun retrait trouvé</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="transfers" className="space-y-2 mt-2">
                      {operations.filter(op => op.type === "transfer").map((operation) => (
                        <OperationCard
                          key={operation.id}
                          operation={operation}
                          onEdit={undefined}
                          onDelete={undefined}
                        />
                      ))}
                      {operations.filter(op => op.type === "transfer").length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Aucun virement trouvé</p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-xl font-bold mb-4 text-destructive text-center">{error}</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicClientProfile;
