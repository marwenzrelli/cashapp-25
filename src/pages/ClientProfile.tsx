import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Client } from "@/features/clients/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Operation } from "@/features/operations/types";
import { OperationCard } from "@/features/operations/components/OperationCard";
import { formatAmount } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCcw,
  User,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ClientProfile = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        if (!clientId || isNaN(Number(clientId))) {
          setError("ID client invalide");
          setIsLoading(false);
          return;
        }

        console.log("Fetching client data for ID:", clientId);
        
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("id", Number(clientId))
          .maybeSingle();

        if (clientError) {
          console.error("Error fetching client:", clientError);
          setError("Erreur lors du chargement des données client.");
          setIsLoading(false);
          return;
        }

        if (!clientData) {
          console.error("No client found with ID:", clientId);
          setError("Client non trouvé.");
          setIsLoading(false);
          return;
        }

        console.log("Client data received:", clientData);
        setClient(clientData);

        // Récupérer les opérations
        const clientFullName = `${clientData.prenom} ${clientData.nom}`;
        console.log("Recherche des opérations pour:", clientFullName);

        // Récupérer toutes les opérations
        const { data: deposits, error: depositsError } = await supabase
          .from("deposits")
          .select("*")
          .eq("client_name", clientFullName)
          .eq("status", "completed")
          .order("operation_date", { ascending: false });

        if (depositsError) {
          console.error("Erreur lors de la récupération des versements:", depositsError);
        } else {
          console.log("Versements trouvés:", deposits);
        }

        // Récupérer les retraits
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from("withdrawals")
          .select("*")
          .eq("client_name", clientFullName)
          .eq("status", "completed")
          .order("operation_date", { ascending: false });

        if (withdrawalsError) {
          console.error("Erreur lors de la récupération des retraits:", withdrawalsError);
        } else {
          console.log("Retraits trouvés:", withdrawals);
        }

        // Récupérer les virements
        const { data: transfers, error: transfersError } = await supabase
          .from("transfers")
          .select("*")
          .or(`from_client.eq.${clientFullName},to_client.eq.${clientFullName}`)
          .eq("status", "completed")
          .order("operation_date", { ascending: false });

        if (transfersError) {
          console.error("Erreur lors de la récupération des virements:", transfersError);
        } else {
          console.log("Virements trouvés:", transfers);
        }

        // Transformer les données en format unifié
        const allOperations: Operation[] = [
          ...(deposits || []).map((d): Operation => ({
            id: d.id.toString(),
            type: "deposit",
            amount: d.amount,
            date: d.operation_date,
            description: `Versement de ${d.client_name}`,
            fromClient: d.client_name,
          })),
          ...(withdrawals || []).map((w): Operation => ({
            id: w.id.toString(),
            type: "withdrawal",
            amount: w.amount,
            date: w.operation_date,
            description: `Retrait par ${w.client_name}`,
            fromClient: w.client_name,
          })),
          ...(transfers || []).map((t): Operation => ({
            id: t.id.toString(),
            type: "transfer",
            amount: t.amount,
            date: t.operation_date,
            description: t.reason || "Virement",
            fromClient: t.from_client,
            toClient: t.to_client,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log("Opérations transformées:", allOperations);
        setOperations(allOperations);
      } catch (err) {
        console.error("Error in fetchClientData:", err);
        setError("Une erreur est survenue lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();

    // Mettre en place la souscription en temps réel
    const clientSubscription = supabase
      .channel("public_client_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clients",
          filter: `id=eq.${client?.id}`,
        },
        (payload) => {
          setClient(payload.new as Client);
        }
      )
      .subscribe();

    // Souscriptions pour les opérations
    const depositsSubscription = supabase
      .channel("deposits_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deposits",
        },
        () => {
          fetchClientData();
        }
      )
      .subscribe();

    const withdrawalsSubscription = supabase
      .channel("withdrawals_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "withdrawals",
        },
        () => {
          fetchClientData();
        }
      )
      .subscribe();

    const transfersSubscription = supabase
      .channel("transfers_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transfers",
        },
        () => {
          fetchClientData();
        }
      )
      .subscribe();

    return () => {
      clientSubscription.unsubscribe();
      depositsSubscription.unsubscribe();
      withdrawalsSubscription.unsubscribe();
      transfersSubscription.unsubscribe();
    };
  }, [clientId]);

  const handleDelete = async () => {
    if (!clientId) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', parseInt(clientId));

      if (error) throw error;

      toast.success("Client supprimé avec succès.");
      navigate("/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Échec de la suppression du client.");
    }
  };

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
        <h2 className="text-2xl font-bold mb-4 text-destructive">
          {error || "Client non trouvé"}
        </h2>
        <Button
          variant="outline"
          onClick={() => navigate("/clients")}
          className="mt-4"
        >
          Retour à la liste des clients
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {client && (
        <div className="space-y-4">
          {/* En-tête avec solde */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted">
            <CardHeader>
              <CardTitle className="text-2xl">Solde actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold",
                client.solde < 0 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-green-600 dark:text-green-400"
              )}>
                {formatAmount(client.solde)}
              </div>
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Détails sur le client.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">
                    {client.prenom} {client.nom}
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Date de création
                  </p>
                  <p className="font-medium">
                    {format(new Date(client.date_creation || ""), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => navigate(`/clients/edit/${clientId}`)}
            >
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          </div>

          <Separator />

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
                        <p className="text-muted-foreground">
                          Aucune opération trouvée
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="deposits" className="space-y-2 mt-2">
                    {operations
                      .filter((op) => op.type === "deposit")
                      .map((operation) => (
                        <OperationCard
                          key={operation.id}
                          operation={operation}
                          onEdit={undefined}
                          onDelete={undefined}
                        />
                      ))}
                    {operations.filter((op) => op.type === "deposit").length ===
                      0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Aucun versement trouvé
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="withdrawals" className="space-y-2 mt-2">
                    {operations
                      .filter((op) => op.type === "withdrawal")
                      .map((operation) => (
                        <OperationCard
                          key={operation.id}
                          operation={operation}
                          onEdit={undefined}
                          onDelete={undefined}
                        />
                      ))}
                    {operations.filter((op) => op.type === "withdrawal")
                      .length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Aucun retrait trouvé
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="transfers" className="space-y-2 mt-2">
                    {operations
                      .filter((op) => op.type === "transfer")
                      .map((operation) => (
                        <OperationCard
                          key={operation.id}
                          operation={operation}
                          onEdit={undefined}
                          onDelete={undefined}
                        />
                      ))}
                    {operations.filter((op) => op.type === "transfer").length ===
                      0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Aucun virement trouvé
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
