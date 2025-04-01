import { useParams, useNavigate } from "react-router-dom";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { PublicClientError } from "@/features/clients/components/PublicClientError";
import { PublicClientPersonalInfo } from "@/features/clients/components/PublicClientPersonalInfo";
import { PublicClientOperationsHistory } from "@/features/clients/components/PublicClientOperationsHistory";
import { usePublicClientProfile } from "@/features/clients/hooks/usePublicClientProfile";
import { useEffect, useRef, useState } from "react";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validateToken } from "@/features/clients/hooks/publicClientProfile/validation";

const PublicClientProfile = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const initialCheckDone = useRef(false);
  const [pageReady, setPageReady] = useState(false);
  const [validToken, setValidToken] = useState(true);
  
  useEffect(() => {
    if (token && !initialCheckDone.current) {
      const { isValid, error } = validateToken(token);
      setValidToken(isValid);
      
      if (!isValid) {
        showErrorToast("Token invalide", { message: error || "Format de token invalide" });
        console.error("Token validation failed:", error);
      }
      
      initialCheckDone.current = true;
    } else if (!token && !initialCheckDone.current) {
      setValidToken(false);
      showErrorToast("Accès refusé", { message: "Token d'accès manquant" });
      initialCheckDone.current = true;
    }
  }, [token]);
  
  const { 
    client, 
    operations, 
    isLoading, 
    error, 
    loadingTime,
    fetchClientData, 
    retryFetch 
  } = usePublicClientProfile(validToken ? token : undefined);

  useEffect(() => {
    requestAnimationFrame(() => {
      setPageReady(true);
    });
  }, []);

  useEffect(() => {
    if (token && validToken && !initialCheckDone.current) {
      initialCheckDone.current = true;
      
      const checkAndCreateSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          try {
            const anonymousEmail = `anonymous-${Date.now()}@example.com`;
            const anonymousPassword = `anonymous-${Date.now()}`;
            
            const { error } = await supabase.auth.signInWithPassword({
              email: anonymousEmail,
              password: anonymousPassword
            });
            
            if (error) {
              console.error("Error setting anonymous auth:", error);
            } else {
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
  }, [token, validToken]);

  useEffect(() => {
    console.log("PublicClientProfile - Current state:", { 
      token, 
      hasClient: !!client, 
      operationsCount: operations?.length || 0,
      isLoading, 
      error,
      loadingTime,
      validToken
    });
    
    if (client && operations && !error && !isLoading) {
      toast.success("Données client chargées", {
        description: `${operations.length} opérations trouvées pour ${client.prenom} ${client.nom}`
      });
    }
  }, [client, operations, isLoading, error, loadingTime, validToken]);

  if (isLoading) {
    return <PublicClientLoading 
      onRetry={retryFetch} 
      loadingTime={loadingTime}
      timeout={loadingTime > 8} // Automatically show timeout after 8 seconds
    />;
  }

  if (error || !client || !validToken) {
    console.error("Error rendering client profile:", error);
    return <PublicClientError error={error || "Token d'accès invalide"} onRetry={retryFetch} />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-primary/10 to-background p-4 transition-all duration-300 ${pageReady ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'}`}>
      <div className="container mx-auto max-w-6xl space-y-6">
        <PublicClientPersonalInfo client={client} />
        <PublicClientOperationsHistory operations={operations} />
      </div>
    </div>
  );
};

export default PublicClientProfile;
