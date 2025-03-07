
import React from "react";
import { LoadingState } from "@/features/admin/components/administration/LoadingState";

interface WithdrawalLoadingStateProps {
  isLoading: boolean;
  error: string | null;
  retrying: boolean;
  withdrawalsCount: number;
}

export const WithdrawalLoadingState: React.FC<WithdrawalLoadingStateProps> = ({
  isLoading,
  error,
  retrying,
  withdrawalsCount
}) => {
  // Show loading state while fetching data
  if (isLoading && !error && withdrawalsCount === 0) {
    return <LoadingState message="Chargement des retraits..." retrying={retrying} />;
  }

  return null;
};
