import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientProfileHeader } from "@/features/clients/components/ClientProfileHeader";
import { ClientInfoCards } from "@/features/clients/components/ClientInfoCards";
import { ClientProfileTabs } from "@/features/clients/components/ClientProfileTabs";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { DepositDialog } from "@/features/clients/components/dialogs/DepositDialog";
import { WithdrawalDialog } from "@/features/clients/components/dialogs/WithdrawalDialog";
import { useClientOperations } from "@/features/clients/hooks/useClientOperations";
import { useState } from "react";
export default function ClientProfile() {
  const {
    client,
    clientId,
    clientOperations,
    filteredOperations,
    isLoading,
    error,
    navigate,
    qrCodeRef,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange,
    showAllDates,
    setShowAllDates,
    formatAmount,
    exportToExcel,
    exportToPDF,
    refetchClient,
    refreshClientBalance,
    refreshClientOperations,
    clientBalance,
    isPepsiMen,
    updateOperation
  } = useClientProfile();
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const {
    handleDeposit,
    handleWithdrawal
  } = useClientOperations(client, clientId, refetchClient);
  const navigateToClients = () => navigate("/clients");

  // Process the error to ensure it's either null or an Error object
  const processedError = error ? typeof error === 'string' ? new Error(error) : error as Error : null;
  const handleDepositSuccess = async (deposit: any) => {
    const result = await handleDeposit(deposit);
    if (result) {
      await refreshClientOperations();
      return true;
    }
    return false;
  };
  const handleWithdrawalSuccess = async (withdrawal: any) => {
    const result = await handleWithdrawal(withdrawal);
    if (result) {
      await refreshClientOperations();
      return true;
    }
    return false;
  };

  // Wrapper function to match the expected return type for ClientProfileTabs
  const refreshClientOperationsForTabs = async (): Promise<void> => {
    try {
      await refreshClientOperations();
    } catch (error) {
      console.error("Error refreshing client operations:", error);
    }
  };

  // Wrapper function to match the expected return type for dialogs
  const refreshClientBalanceForDialogs = async (): Promise<boolean> => {
    try {
      await refreshClientBalance();
      return true;
    } catch (error) {
      console.error("Error refreshing client balance:", error);
      return false;
    }
  };
  return <div className="flex justify-center w-full">
      <div className="space-y-6 w-full max-w-none md:px-6 px-0">
        <ClientProfileHeader client={client} clientId={clientId} clientBalance={clientBalance} isLoading={isLoading} formatAmount={formatAmount} refreshClientBalance={refreshClientBalance} navigateToClients={navigateToClients} error={processedError} />

        {client && !isLoading && !error && <div className="space-y-6 w-full">
            <ClientInfoCards client={client} clientId={clientId} clientOperations={clientOperations} exportToExcel={exportToExcel} exportToPDF={exportToPDF} formatAmount={formatAmount} onDepositClick={() => setIsDepositDialogOpen(true)} onWithdrawalClick={() => setIsWithdrawalDialogOpen(true)} />

            <ClientProfileTabs client={client} clientId={clientId} clientOperations={clientOperations} filteredOperations={filteredOperations} selectedType={selectedType} setSelectedType={setSelectedType} searchTerm={searchTerm} setSearchTerm={setSearchTerm} dateRange={dateRange} setDateRange={setDateRange} isCustomRange={isCustomRange} setIsCustomRange={setIsCustomRange} showAllDates={showAllDates} setShowAllDates={setShowAllDates} refreshClientOperations={refreshClientOperationsForTabs} isPepsiMen={isPepsiMen} updateOperation={updateOperation} />
          </div>}

        {/* Dialogs */}
        {client && clientId && <>
            <DepositDialog client={client} open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen} onConfirm={handleDepositSuccess} refreshClientBalance={refreshClientBalanceForDialogs} />

            <WithdrawalDialog client={client} open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen} onConfirm={handleWithdrawalSuccess} refreshClientBalance={refreshClientBalanceForDialogs} />
          </>}
        
        <ScrollToTop />
      </div>
    </div>;
}