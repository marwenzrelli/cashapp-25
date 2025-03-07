
import React from "react";
import { LoadingState } from "@/features/admin/components/administration/LoadingState";
import { AuthRetryButton } from "./AuthRetryButton";

interface WithdrawalAuthStateProps {
  authChecking: boolean;
  isAuthenticated: boolean | null;
  retryingAuth: boolean;
  onRetry: () => Promise<void>;
}

export const WithdrawalAuthState: React.FC<WithdrawalAuthStateProps> = ({
  authChecking,
  isAuthenticated,
  retryingAuth,
  onRetry
}) => {
  // If still checking auth status, show loading state
  if (authChecking && !isAuthenticated) {
    return <LoadingState message="Vérification de l'authentification..." variant="minimal" />;
  }

  // If not authenticated
  if (isAuthenticated === false) {
    return (
      <AuthRetryButton 
        retryingAuth={retryingAuth}
        onRetry={onRetry}
      />
    );
  }

  return null;
};
