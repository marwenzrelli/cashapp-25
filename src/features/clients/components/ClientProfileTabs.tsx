import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientOperationsHistory } from "./ClientOperationsHistory";
import { ClientPublicPreview } from "./ClientPublicPreview";
import { AccountFlowTab } from "./operations-history/AccountFlowTab";
import { Client } from "../types";
import { Operation } from "@/features/operations/types";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import { Smartphone, Monitor, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { OperationsDetailCards } from "./OperationsDetailCards";
interface ClientProfileTabsProps {
  client: Client;
  clientId: number;
  clientOperations: Operation[];
  filteredOperations: Operation[];
  selectedType: "all" | "deposit" | "withdrawal" | "transfer";
  setSelectedType: (type: "all" | "deposit" | "withdrawal" | "transfer") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  isCustomRange: boolean;
  setIsCustomRange: (isCustom: boolean) => void;
  showAllDates: boolean;
  setShowAllDates: (showAll: boolean) => void;
  refreshClientOperations: () => Promise<void>;
  isPepsiMen: boolean;
  updateOperation?: (operation: Operation) => Promise<void>;
}
export function ClientProfileTabs({
  client,
  clientId,
  clientOperations,
  filteredOperations,
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
  refreshClientOperations,
  isPepsiMen,
  updateOperation
}: ClientProfileTabsProps) {
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Function to format amounts for the operations detail cards
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  };

  // Ensure refreshClientOperations is properly wrapped to return a Promise
  const handleRefreshOperations = async (): Promise<void> => {
    try {
      await refreshClientOperations();
    } catch (error) {
      console.error("Error refreshing operations in tabs:", error);
    }
  };

  // Get client full name for totals calculation
  const clientFullName = `${client.prenom} ${client.nom}`.trim();
  return <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-md">
        <Tabs defaultValue="operations" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none bg-muted/50 p-0">
            <TabsTrigger value="operations" className="rounded-none py-3 data-[state=active]:bg-background">Opérations</TabsTrigger>
            <TabsTrigger value="flux" className="rounded-none py-3 data-[state=active]:bg-background">
              <FileText className="h-4 w-4 mr-2" />
              Flux de compte
            </TabsTrigger>
            <TabsTrigger value="public-preview" className="rounded-none py-3 data-[state=active]:bg-background">Aperçu public</TabsTrigger>
          </TabsList>
          
          <div className="p-6 px-0 py-[4px]">
            <TabsContent value="operations" className="space-y-6 mt-0">
              <ClientOperationsHistory operations={clientOperations} selectedType={selectedType} setSelectedType={setSelectedType} searchTerm={searchTerm} setSearchTerm={setSearchTerm} dateRange={dateRange} setDateRange={setDateRange} isCustomRange={isCustomRange} setIsCustomRange={setIsCustomRange} filteredOperations={filteredOperations} refreshOperations={handleRefreshOperations} showAllDates={showAllDates} setShowAllDates={setShowAllDates} clientId={clientId} isPepsiMen={isPepsiMen} clientName={clientFullName} updateOperation={updateOperation} />
            </TabsContent>
            
            <TabsContent value="flux" className="space-y-6 mt-0">
              <AccountFlowTab operations={clientOperations} clientId={clientId} updateOperation={updateOperation} />
            </TabsContent>
            
            <TabsContent value="public-preview" className="space-y-6 mt-0">
              {/* Mobile preview toggle */}
              

              <ClientPublicPreview client={client} operations={clientOperations} isMobilePreview={showMobilePreview} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Operations Detail Cards moved here at the bottom */}
      <OperationsDetailCards clientOperations={clientOperations} formatAmount={formatAmount} />
    </div>;
}