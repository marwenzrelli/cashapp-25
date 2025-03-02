
import { useState, useEffect } from "react";
import { useClients } from "@/features/clients/hooks/useClients";
import { useWithdrawals } from "@/features/withdrawals/hooks/useWithdrawals";
import { useClientSubscription } from "@/features/withdrawals/components/useClientSubscription";
import { WithdrawalsContent } from "@/features/withdrawals/components/WithdrawalsContent";
import { containsPartialText } from "@/features/operations/utils/display-helpers";

const Withdrawals = () => {
  const { 
    withdrawals, 
    isLoading,
    fetchWithdrawals, 
    deleteWithdrawal,
    confirmDeleteWithdrawal,
    showDeleteDialog,
    setShowDeleteDialog
  } = useWithdrawals();

  const [searchTerm, setSearchTerm] = useState("");

  const { clients, fetchClients, refreshClientBalance } = useClients();

  // Create a wrapper function to handle the type mismatch
  const handleRefreshClientBalance = async (clientId: string): Promise<boolean> => {
    try {
      await refreshClientBalance(parseInt(clientId, 10));
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
    fetchWithdrawals();
  }, []);

  useClientSubscription({ fetchClients });

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (!searchTerm.trim()) return true;
    
    const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
    
    return searchTerms.some(term => {
      // Recherche sur le nom du client
      if (containsPartialText(withdrawal.client_name, term)) return true;
      
      // Recherche sur les notes
      if (withdrawal.notes && containsPartialText(withdrawal.notes, term)) return true;
      
      // Recherche sur l'ID
      if (withdrawal.id.toString().includes(term)) return true;
      
      // Recherche sur le montant
      if (withdrawal.amount.toString().includes(term)) return true;
      
      return false;
    });
  });

  return (
    <WithdrawalsContent
      withdrawals={filteredWithdrawals}
      clients={clients}
      fetchWithdrawals={fetchWithdrawals}
      fetchClients={fetchClients}
      refreshClientBalance={handleRefreshClientBalance}
      deleteWithdrawal={deleteWithdrawal}
      showDeleteDialog={showDeleteDialog}
      setShowDeleteDialog={setShowDeleteDialog}
      confirmDeleteWithdrawal={confirmDeleteWithdrawal}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
};

export default Withdrawals;
