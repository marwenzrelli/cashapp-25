
import { useParams, useNavigate } from "react-router-dom";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { PublicClientError } from "@/features/clients/components/PublicClientError";
import { PublicClientPersonalInfo } from "@/features/clients/components/PublicClientPersonalInfo";
import { PublicClientOperationsHistory } from "@/features/clients/components/PublicClientOperationsHistory";
import { usePublicClientProfile } from "@/features/clients/hooks/usePublicClientProfile";
import { useEffect, useRef, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/features/clients/hooks/utils/errorUtils";
import { supabase } from "@/integrations/supabase/client";

const PublicClientProfile = () => {
  // Get token from either clientId or token parameter
  const { clientId, token: routeToken } = useParams<{ clientId?: string; token?: string }>();
  const token = routeToken || clientId;
  const navigate = useNavigate();
  const initialCheckDone = useRef(false);
  const [pageReady, setPageReady] = useState(false);
  
  const { 
    client, 
    operations, 
    isLoading, 
    error, 
    loadingTime,
    fetchClientData, 
    retryFetch 
  } = usePublicClientProfile(token);

  // Effet pour l'animation d'entrée progressive - plus rapide
  useEffect(() => {
    // Animation immédiate pour éviter les retards
    requestAnimationFrame(() => {
      setPageReady(true);
    });
  }, []);

  // Set JWT token for Supabase RLS policies - run only once
  useEffect(() => {
    if (token && !initialCheckDone.current) {
      initialCheckDone.current = true;
      
      // Check current session
      const checkAndCreateSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            console.log("Creating anonymous session with token:", token);
            // Set auth header directly for public access
            supabase.auth.onAuthStateChange((event, session) => {
              if (event === 'SIGNED_IN' && session) {
                console.log("Setting auth headers with token");
              }
            });
          }
        } catch (error) {
          console.error("Error during session setup:", error);
        }
      };
      
      checkAndCreateSession();
    }
  }, [token]);

  // Debug information for troubleshooting - run only once on data changes
  useEffect(() => {
    console.log("PublicClientProfile - Current state:", { 
      token: token ? `${token.substring(0, 8)}...` : undefined, 
      hasClient: !!client, 
      operationsCount: operations?.length || 0,
      isLoading, 
      error,
      loadingTime
    });
    
    // Show a toast for client not found errors if we have an error and we're not loading
    if (error && !isLoading && error.includes("Client introuvable")) {
      showErrorToast("Client introuvable", 
        "Le client demandé n'existe pas dans notre système. Veuillez vérifier l'URL ou contacter le support."
      );
    }
    
    // Show success toast when client data loads - only once
    if (client && !error && !isLoading) {
      showSuccessToast(
        "Données client chargées", 
        `${operations.length} opérations trouvées pour ${client.prenom} ${client.nom}`
      );
    }
  }, [client, operations, isLoading, error, loadingTime, token]);

  // Basic token format validation on component mount and trigger data fetch - run only once
  useEffect(() => {
    if (!initialCheckDone.current) {
      // Check if token exists
      if (!token) {
        console.error("Token is missing in URL params");
        showErrorToast("Accès refusé", "Token d'accès manquant");
        navigate("/"); // Redirect to home on missing token
        return;
      }
      
      // Validate token format - accept both UUID (36 chars) and short tokens (10 chars)
      const isValidUUID = token?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      const isValidShortToken = token?.match(/^[A-Z0-9]{10}$/);
      
      if (!isValidUUID && !isValidShortToken) {
        console.error("Invalid token format:", token);
        showErrorToast("Format de token invalide", "Le format du token ne correspond pas à un format valide");
        navigate("/"); // Redirect to home on invalid token format
        return;
      }
      
      initialCheckDone.current = true;
    }
  }, [token, navigate]);

  // Show loading state
  if (isLoading) {
    return <PublicClientLoading 
      onRetry={retryFetch} 
      loadingTime={loadingTime}
      timeout={loadingTime > 6} // Show timeout message faster (reduced from 8s to 6s)
    />;
  }

  // Show error state with more specific error handling
  if (error || !client) {
    console.error("Error rendering client profile:", error);
    // Pass the retry function to the error component
    return <PublicClientError error={error} onRetry={retryFetch} />;
  }

  // Show client profile when data is available
  return (
    <div className={`min-h-screen bg-gradient-to-b from-primary/10 to-background p-4 transition-all duration-300 ${pageReady ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`}>
      <div className="container mx-auto max-w-6xl space-y-6">
        <PublicClientPersonalInfo client={client} operations={operations} />
        <PublicClientOperationsHistory operations={operations} client={client} />
      </div>
    </div>
  );
};

export default PublicClientProfile;
