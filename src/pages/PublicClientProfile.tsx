
import { useParams } from "react-router-dom";
import { usePublicClientProfile } from "@/features/clients/hooks/usePublicClientProfile";
import { PublicClientPersonalInfo } from "@/features/clients/components/PublicClientPersonalInfo";
import { PublicClientOperationsHistory } from "@/features/clients/components/PublicClientOperationsHistory";
import { PublicClientLoading } from "@/features/clients/components/PublicClientLoading";
import { PublicClientError } from "@/features/clients/components/PublicClientError";

const PublicClientProfile = () => {
  const { token } = useParams();
  const { client, operations, isLoading, error } = usePublicClientProfile(token);

  if (isLoading) {
    return <PublicClientLoading />;
  }

  if (error || !client) {
    return <PublicClientError error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 p-2 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <PublicClientPersonalInfo client={client} />
        <PublicClientOperationsHistory operations={operations} />
      </div>
    </div>
  );
};

export default PublicClientProfile;
