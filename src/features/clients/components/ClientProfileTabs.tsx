
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientOperationsHistory } from "./ClientOperationsHistory";
import { ClientInsights } from "./ClientInsights";
import { ClientPublicPreview } from "./ClientPublicPreview";
import { Client } from "../types";
import { Operation } from "@/features/operations/types";
import { DateRange } from "react-day-picker";

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
  refreshClientOperations: () => void;
  isPepsiMen: boolean;
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
  isPepsiMen
}: ClientProfileTabsProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none bg-muted/50 p-0">
          <TabsTrigger value="operations" className="rounded-none py-3 data-[state=active]:bg-background">Opérations</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-none py-3 data-[state=active]:bg-background">Insights</TabsTrigger>
          <TabsTrigger value="public-preview" className="rounded-none py-3 data-[state=active]:bg-background">Aperçu public</TabsTrigger>
        </TabsList>
        
        <div className="p-6">
          <TabsContent value="operations" className="space-y-6 mt-0">
            <ClientOperationsHistory
              operations={clientOperations}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              dateRange={dateRange}
              setDateRange={setDateRange}
              isCustomRange={isCustomRange}
              setIsCustomRange={setIsCustomRange}
              filteredOperations={filteredOperations}
              refreshOperations={refreshClientOperations}
              showAllDates={showAllDates}
              setShowAllDates={setShowAllDates}
              clientId={clientId}
              isPepsiMen={isPepsiMen}
            />
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6 mt-0">
            <ClientInsights 
              suggestions={[]} 
              client={client}
              operations={clientOperations}
            />
          </TabsContent>
          
          <TabsContent value="public-preview" className="space-y-6 mt-0">
            <ClientPublicPreview 
              client={client} 
              operations={clientOperations} 
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
