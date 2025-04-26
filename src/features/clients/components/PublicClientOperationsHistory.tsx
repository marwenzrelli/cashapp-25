import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PublicOperationsTabs } from "./operations-history/PublicOperationsTabs";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicAccountFlowTab } from "./operations-history/PublicAccountFlowTab";
import { FileText, List } from "lucide-react";

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
  }, [operations, isPepsiMen, clientId, showAllOperations]);
  
  const displayedOperations = showAllOperations 
    ? operations 
    : operations.filter(op => {
        const opDate = new Date(op.operation_date || op.date);
        if (dateRange?.from && dateRange?.to) {
          const from = new Date(dateRange.from);
          const to = new Date(dateRange.to);
          to.setHours(23, 59, 59, 999);
          return opDate >= from && opDate <= to;
        } else {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return opDate >= thirtyDaysAgo;
        }
      });
  
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!showAllOperations && (
          <div className="px-4 sm:px-0 mb-4 w-full">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full"
            />
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
          
          <TabsContent value="list" className="p-0 sm:p-6">
            <PublicOperationsTabs operations={operations} currency={currency} />
          </TabsContent>
          
          <TabsContent value="flow" className="p-0 sm:p-6">
            <PublicAccountFlowTab operations={operations} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
