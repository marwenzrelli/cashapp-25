
import { useParams, useNavigate } from "react-router-dom";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { PublicClientError } from "@/features/clients/components/PublicClientError";
import { PublicClientPersonalInfo } from "@/features/clients/components/PublicClientPersonalInfo";
import { PublicClientOperationsHistory } from "@/features/clients/components/PublicClientOperationsHistory";
import { usePublicClientProfile } from "@/features/clients/hooks/usePublicClientProfile";
import { useEffect } from "react";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PublicClientProfile = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { 
    client, 
    operations, 
    isLoading, 
    error, 
    loadingTime,
    fetchClientData, 
    retryFetch 
  } = usePublicClientProfile(token);

  // Set JWT token for Supabase RLS policies
  useEffect(() => {
    if (token) {
      // Set a custom claim in the JWT to use with RLS policies
      const jwt = supabase.auth.session()?.access_token || null;
      
      if (!jwt) {
        // If there's no existing session, we create an anonymous session with our custom claims
        supabase.auth.signIn({
          email: `anonymous-${Date.now()}@example.com`,
          password: `anonymous-${Date.now()}`,
        }, {
          data: {
            public_token: token
          }
        }).catch(error => {
          console.error("Error setting anonymous auth:", error);
        });
      }
    }
  }, [token]);

  // Debug information for troubleshooting
  useEffect(() => {
    console.log("PublicClientProfile - Current state:", { 
      token, 
      hasClient: !!client, 
      clientData: client,
      operationsCount: operations?.length || 0,
      isLoading, 
      error,
      loadingTime,
      currentURL: window.location.href,
      currentRoute: window.location.pathname
    });
    
    // Show a toast for client not found errors if we have an error and we're not loading
    if (error && !isLoading && error.includes("Client introuvable")) {
      showErrorToast("Client introuvable", { 
        message: "Le client demandé n'existe pas dans notre système. Veuillez vérifier l'URL ou contacter le support." 
      });
    }
    
    // Show success toast when client data loads
    if (client && operations && !error && !isLoading) {
      toast.success("Données client chargées", {
        description: `${operations.length} opérations trouvées pour ${client.prenom} ${client.nom}`
      });
    }
  }, [token, client, operations, isLoading, error, loadingTime]);

  // Basic token format validation on component mount and trigger data fetch
  useEffect(() => {
    // Check if token exists
    if (!token) {
      console.error("Token is missing in URL params");
      showErrorToast("Accès refusé", { message: "Token d'accès manquant" });
      navigate("/"); // Redirect to home on missing token
      return;
    }
    
    // Basic UUID format validation
    const isValidUUID = token?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    if (!isValidUUID) {
      console.error("Invalid token format:", token);
      showErrorToast("Format de token invalide", { message: "Le format du token ne correspond pas à un UUID valide" });
      navigate("/"); // Redirect to home on invalid token format
      return;
    }
    
    console.log("PublicClientProfile - URL token verified, fetching data with token:", token);
  }, [token, navigate, fetchClientData]);

  // Show loading state
  if (isLoading) {
    return <PublicClientLoading onRetry={retryFetch} loadingTime={loadingTime} />;
  }

  // Show error state with more specific error handling
  if (error || !client) {
    console.error("Error rendering client profile:", error);
    // Pass the retry function to the error component
    return <PublicClientError error={error} onRetry={retryFetch} />;
  }

  // Show client profile when data is available
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        <PublicClientPersonalInfo client={client} />
        <PublicClientOperationsHistory operations={operations} />
      </div>
    </div>
  );
};

export default PublicClientProfile;
