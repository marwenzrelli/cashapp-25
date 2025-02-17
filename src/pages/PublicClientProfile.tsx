
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/features/clients/types";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, Calendar } from "lucide-react";

const PublicClientProfile = () => {
  const { token } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        if (!token) return;

        // Récupérer d'abord l'accès QR
        const { data: qrAccess, error: qrError } = await supabase
          .from('qr_access')
          .select('client_id, expires_at')
          .eq('access_token', token)
          .single();

        if (qrError) throw new Error("Token d'accès invalide");
        
        if (qrAccess.expires_at && new Date(qrAccess.expires_at) < new Date()) {
          throw new Error("Le lien a expiré");
        }

        // Récupérer les informations du client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', qrAccess.client_id)
          .single();

        if (clientError) throw clientError;
        setClient(clientData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();

    // Mettre en place la souscription en temps réel
    const subscription = supabase
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

    return () => {
      subscription.unsubscribe();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Informations Client</h1>

        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-950/50">
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

        <Card className="relative overflow-hidden backdrop-blur-xl bg-white/50 dark:bg-gray-950/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
          <CardHeader>
            <CardTitle>Solde actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{client.solde.toLocaleString()} €</div>
            <p className="text-sm text-muted-foreground mt-2">
              Mis à jour le {format(new Date(), 'dd/MM/yyyy HH:mm')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicClientProfile;
