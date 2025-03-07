import { useParams, useNavigate } from "react-router-dom";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { PublicClientError } from "@/features/clients/components/PublicClientError";
import { PublicClientPersonalInfo } from "@/features/clients/components/PublicClientPersonalInfo";
import { PublicClientOperationsHistory } from "@/features/clients/components/PublicClientOperationsHistory";
import { usePublicClientProfile } from "@/features/clients/hooks/usePublicClientProfile";
import { useEffect, useRef } from "react";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PublicClientProfile = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const initialCheckDone = useRef(false);
  const { 
    client, 
    operations, 
    isLoading, 
    error, 
    loadingTime,
    fetchClientData, 
    retryFetch 
  } = usePublicClientProfile(token);

  // Set JWT token for Supabase RLS policies - run only once
  useEffect(() => {
    if (token && !initialCheckDone.current) {
      initialCheckDone.current = true;
      
      // Check current session
      const checkAndCreateSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          try {
            // If there's no existing session, create an anonymous session with our custom claims
            console.log("Creating anonymous session with token:", token);
            // Use the correct structure for signInWithPassword
            const anonymousEmail = `anonymous-${Date.now()}@example.com`;
            const anonymousPassword = `anonymous-${Date.now()}`;
            
            // This is only for testing purposes and won't actually create a real user
            // since we've disabled RLS, but keeping for compatibility
            const { error } = await supabase.auth.signInWithPassword({
              email: anonymousEmail,
              password: anonymousPassword
            });
            
            if (error) {
              console.error("Error setting anonymous auth:", error);
            } else {
              // After sign in, set the session data with the token
              const { error: updateError } = await supabase.auth.updateUser({
                data: { public_token: token }
              });
              
              if (updateError) {
                console.error("Error updating user with public token:", updateError);
              }
            }
          } catch (error) {
            console.error("Error creating anonymous session:", error);
          }
        }
      };
      
      checkAndCreateSession();
    }
  }, [token]);

  // Debug information for troubleshooting - run only once on data changes
  useEffect(() => {
    console.log("PublicClientProfile - Current state:", { 
      token, 
      hasClient: !!client, 
      operationsCount: operations?.length || 0,
      isLoading, 
      error,
      loadingTime
    });
    
    // Show a toast for client not found errors if we have an error and we're not loading
    if (error && !isLoading && error.includes("Client introuvable")) {
      showErrorToast("Client introuvable", { 
        message: "Le client demandé n'existe pas dans notre système. Veuillez vérifier l'URL ou contacter le support." 
      });
    }
    
    // Show success toast when client data loads - only once
    if (client && operations && !error && !isLoading) {
      toast.success("Données client chargées", {
        description: `${operations.length} opérations trouvées pour ${client.prenom} ${client.nom}`
      });
    }
  }, [client, operations, isLoading, error, loadingTime]);

  // Basic token format validation on component mount and trigger data fetch - run only once
  useEffect(() => {
    if (!initialCheckDone.current) {
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
      
      initialCheckDone.current = true;
    }
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
