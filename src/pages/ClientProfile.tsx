
import { useClientProfile } from "@/features/clients/hooks/useClientProfile";
import { ClientProfileHeader } from "@/features/clients/components/ClientProfileHeader";
import { ClientInfoCards } from "@/features/clients/components/ClientInfoCards";
import { ClientProfileTabs } from "@/features/clients/components/ClientProfileTabs";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Monitor } from "lucide-react";

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
    isPepsiMen
  } = useClientProfile();

  // Add mobile preview state at the page level
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Apply mobile preview styles to the entire page when enabled
  useEffect(() => {
    if (showMobilePreview) {
      document.body.classList.add('mobile-preview-enabled');
    } else {
      document.body.classList.remove('mobile-preview-enabled');
    }
    
    return () => {
      document.body.classList.remove('mobile-preview-enabled');
    };
  }, [showMobilePreview]);

  const navigateToClients = () => navigate("/clients");

  // Process the error to ensure it's either null or an Error object
  const processedError = error ? (typeof error === 'object' ? error : new Error(String(error))) : null;

  return (
    <div className={`p-4 md:p-6 space-y-6 max-w-7xl mx-auto ${showMobilePreview ? 'mobile-viewport' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <ClientProfileHeader
          client={client}
          clientId={clientId}
          clientBalance={clientBalance}
          isLoading={isLoading}
          formatAmount={formatAmount}
          refreshClientBalance={refreshClientBalance}
          navigateToClients={navigateToClients}
          error={processedError}
        />
        
        {/* Mobile preview toggle */}
        <div className="flex items-center gap-2 md:justify-end">
          <Label htmlFor="global-mobile-preview" className="flex items-center gap-1 text-sm text-muted-foreground">
            <Monitor className="h-4 w-4" />
          </Label>
          <Switch 
            id="global-mobile-preview" 
            checked={showMobilePreview} 
            onCheckedChange={setShowMobilePreview} 
          />
          <Label htmlFor="global-mobile-preview" className="flex items-center gap-1 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            Mode mobile
          </Label>
        </div>
      </div>

      {client && !isLoading && !error && (
        <div className="space-y-6">
          <ClientInfoCards
            client={client}
            clientId={clientId}
            clientOperations={clientOperations}
            exportToExcel={exportToExcel}
            exportToPDF={exportToPDF}
            formatAmount={formatAmount}
            isMobilePreview={showMobilePreview}
          />

          <ClientProfileTabs
            client={client}
            clientId={clientId}
            clientOperations={clientOperations}
            filteredOperations={filteredOperations}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dateRange={dateRange}
            setDateRange={setDateRange}
            isCustomRange={isCustomRange}
            setIsCustomRange={setIsCustomRange}
            showAllDates={showAllDates}
            setShowAllDates={setShowAllDates}
            refreshClientOperations={refreshClientOperations}
            isPepsiMen={isPepsiMen}
            showMobilePreview={showMobilePreview}
          />
        </div>
      )}
      
      {/* Hidden buttons to trigger dialogs */}
      <div className="hidden">
        <button id="depositDialog" onClick={() => document.querySelector<HTMLElement>('[data-deposit-dialog-trigger]')?.click()}>Open Deposit</button>
        <button id="withdrawalDialog" onClick={() => document.querySelector<HTMLElement>('[data-withdrawal-dialog-trigger]')?.click()}>Open Withdrawal</button>
        <button id="exportExcel" onClick={exportToExcel}>Export to Excel</button>
        <button id="exportPDF" onClick={exportToPDF}>Export to PDF</button>
      </div>
    </div>
  );
}
