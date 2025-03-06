
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
  const { client, operations, isLoading, error } = usePublicClientProfile(token);

  // Basic token format validation on component mount
  useEffect(() => {
    // Basic UUID format validation
    const isValidUUID = token?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    
    if (token && !isValidUUID) {
      console.error("Invalid token format:", token);
      showErrorToast("Format de token invalide", { message: "Le format du token ne correspond pas à un UUID valide" });
      navigate("/"); // Redirect to home on invalid token format
    }
  }, [token, navigate]);

  console.log("PublicClientProfile rendering with:", { token, isLoading, hasClient: !!client, error });

  // Show loading state
  if (isLoading) {
    return <PublicClientLoading />;
  }

  // Show error state
  if (error || !client) {
    return <PublicClientError error={error} />;
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
