
import React from "react";
import { NoUserProfileState } from "@/features/admin/components/administration/NoUserProfileState";

interface AuthRetryButtonProps {
  retryingAuth: boolean;
  onRetry: () => Promise<void>;
}

export const AuthRetryButton: React.FC<AuthRetryButtonProps> = ({
  retryingAuth,
  onRetry
}) => {
  return (
    <NoUserProfileState 
      isRetrying={retryingAuth}
      onRetry={onRetry}
    />
  );
};
