
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, FileSpreadsheet, FileText, RefreshCw } from "lucide-react";
import { Operation } from "@/features/operations/types";
import { ClientOperationsHistoryTabs } from "./operations-history/ClientOperationsHistoryTabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicClientPersonalInfo } from "./PublicClientPersonalInfo";
import { useParams } from "react-router-dom";
import { useClientData } from "../hooks/clientProfile/useClientData";
import { DateRange } from "react-day-picker";

interface ClientOperationsHistoryProps {
  operations: Operation[];
  selectedType: string;
  setSelectedType: (type: string) => void; // Accept any string, parent component will validate
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  isCustomRange: boolean;
  setIsCustomRange: (isCustom: boolean) => void;
  filteredOperations: Operation[];
  refreshOperations: () => Promise<void>;
}

export const ClientOperationsHistory = ({
  operations,
  selectedType,
  setSelectedType,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  isCustomRange,
  setIsCustomRange,
  filteredOperations,
  refreshOperations
}: ClientOperationsHistoryProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { id } = useParams();
  const clientId = id ? Number(id) : null;
  const { client } = useClientData(clientId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOperations();
    setIsRefreshing(false);
  };

  return (
    <Tabs defaultValue="operations" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="operations">Opérations</TabsTrigger>
        <TabsTrigger value="public">Page publique client</TabsTrigger>
      </TabsList>
      
      <TabsContent value="operations">
        <Card>
          <CardHeader className="pb-0 pt-4 sm:pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Historique des opérations</CardTitle>
                <CardDescription>
                  Consultez l'historique complet des opérations liées à ce client.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end mb-6">
              <div className="relative w-full md:w-auto md:min-w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input
                  type="search"
                  placeholder="Rechercher par description..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-auto">
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
              
              <div className="flex items-center w-full md:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:hidden w-full"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ClientOperationsHistoryTabs filteredOperations={filteredOperations} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="public">
        {client && <PublicClientPersonalInfo client={client} />}
      </TabsContent>
    </Tabs>
  );
};
