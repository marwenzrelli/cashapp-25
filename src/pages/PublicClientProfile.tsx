
import { useParams } from "react-router-dom";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { PublicClientError } from "@/features/clients/components/PublicClientError";
import { PublicClientPersonalInfo } from "@/features/clients/components/PublicClientPersonalInfo";
import { PublicClientOperationsHistory } from "@/features/clients/components/PublicClientOperationsHistory";
import { usePublicClientProfile } from "@/features/clients/hooks/usePublicClientProfile";

const PublicClientProfile = () => {
  const { token } = useParams<{ token: string }>();
  const { client, operations, isLoading, error } = usePublicClientProfile(token);

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
