
import { useState } from "react";
import { useClientDeposit } from "./operations/useClientDeposit";
import { useClientWithdrawal } from "./operations/useClientWithdrawal";
import { useClientBalanceRefresh } from "./operations/useClientBalanceRefresh";
import { Client } from "../types";
import { Deposit } from "@/features/deposits/types";

export function useClientOperations(client: Client, clientId?: number, refetchClient?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the refactored hooks
  const { handleDeposit } = useClientDeposit(clientId, refetchClient);
  const { handleWithdrawal } = useClientWithdrawal(clientId, refetchClient);
  const { refreshClientBalance } = useClientBalanceRefresh();
  
  // Helper function to pass client ID to refreshBalance
  const handleBalanceRefresh = async (id: number | string): Promise<boolean> => {
    const clientIdToRefresh = client?.id || clientId || id;
    if (clientIdToRefresh) {
      return await refreshClientBalance(clientIdToRefresh);
    }
    return false;
  };
  
  return {
    isProcessing,
    handleDeposit,
    handleWithdrawal,
    refreshClientBalance: handleBalanceRefresh
  };
}
