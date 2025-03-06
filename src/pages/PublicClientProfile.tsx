
import { useParams, useNavigate } from "react-router-dom";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { PublicClientError } from "@/features/clients/components/PublicClientError";
import { PublicClientPersonalInfo } from "@/features/clients/components/PublicClientPersonalInfo";
import { PublicClientOperationsHistory } from "@/features/clients/components/PublicClientOperationsHistory";
import { usePublicClientProfile } from "@/features/clients/hooks/usePublicClientProfile";
import { useEffect } from "react";
import { showErrorToast } from "@/features/clients/hooks/utils/errorUtils";

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
      currentURL: window.location.href
    });
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

  // Show error state
  if (error || !client) {
    console.error("Error rendering client profile:", error);
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
