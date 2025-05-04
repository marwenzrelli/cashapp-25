
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicAccountFlowTab } from "./operations-history/PublicAccountFlowTab";
import { FileText, List, Search } from "lucide-react";
import { ClientOperationsHistoryTabs } from "./operations-history/ClientOperationsHistoryTabs";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PublicClientOperationsHistoryProps {
  operations: Operation[];
  clientId?: number;
}

export const PublicClientOperationsHistory = ({ operations, clientId }: PublicClientOperationsHistoryProps) => {
  const { currency } = useCurrency();
  const isPepsiMen = clientId === 4;
  const [showAllOperations, setShowAllOperations] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [pendingDateRange, setPendingDateRange] = useState<DateRange | undefined>(dateRange);
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>(operations);
  
  useEffect(() => {
    if (isPepsiMen && !showAllOperations) {
      setShowAllOperations(true);
    }
  }, [isPepsiMen, showAllOperations]);
  
  useEffect(() => {
    console.log(`PublicClientOperationsHistory - Total operations: ${operations.length}`);
    console.log(`PublicClientOperationsHistory - Client ID: ${clientId}`);
    console.log(`PublicClientOperationsHistory - Is pepsi men: ${isPepsiMen}`);
    console.log(`PublicClientOperationsHistory - Show all operations: ${showAllOperations}`);
    
    if (isPepsiMen) {
      const allWithdrawals = operations.filter(op => op.type === 'withdrawal');
      console.log(`PublicClientOperationsHistory - Total withdrawals for pepsi men: ${allWithdrawals.length}`);
      console.log(`Withdrawal IDs: ${allWithdrawals.map(w => w.id).join(', ')}`);
    }

    // Filter operations based on date range when not showing all
    if (showAllOperations) {
      setFilteredOperations(operations);
    } else {
      filterOperationsByDate();
    }
  }, [operations, isPepsiMen, clientId, showAllOperations, dateRange]);
  
  const filterOperationsByDate = () => {
    if (!dateRange?.from || !dateRange?.to) {
      setFilteredOperations(operations);
      return;
    }
    
    const filtered = operations.filter(op => {
      const opDate = new Date(op.operation_date || op.date);
      const from = new Date(dateRange.from!);
      const to = new Date(dateRange.to!);
      to.setHours(23, 59, 59, 999);
      return opDate >= from && opDate <= to;
    });
    
    setFilteredOperations(filtered);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setPendingDateRange(range);
  };

  const applyDateFilter = () => {
    setDateRange(pendingDateRange);
  };
  
  return (
    <Card className="shadow-sm max-w-full w-full overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-xl">Historique des opérations</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-all-operations"
              checked={showAllOperations}
              onCheckedChange={setShowAllOperations}
              disabled={isPepsiMen}
            />
            <span className="text-sm text-muted-foreground">Afficher toutes les opérations</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!showAllOperations && (
          <div className="px-4 sm:px-6 mb-4 w-full">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-grow">
                <DatePickerWithRange
                  date={pendingDateRange}
                  onDateChange={handleDateRangeChange}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={applyDateFilter} 
                className="w-full sm:w-auto"
                disabled={!pendingDateRange?.from || !pendingDateRange?.to}
              >
                <Search className="h-4 w-4 mr-2" />
                Appliquer
              </Button>
            </div>
          </div>
        )}
        
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Flux
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="p-0">
            <Card className="shadow-sm border border-border/50 rounded-md">
              <CardContent className="p-0 sm:p-0">
                <ClientOperationsHistoryTabs 
                  filteredOperations={filteredOperations}
                  currency={currency}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="flow" className="p-0">
            <PublicAccountFlowTab operations={filteredOperations} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
