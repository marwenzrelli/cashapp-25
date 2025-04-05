
import { useState } from "react";
import { ClientPersonalInfo } from "./ClientPersonalInfo";
import { Client } from "../types";
import { Operation } from "@/features/operations/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { subMonths } from "date-fns";

interface ClientInfoCardsProps {
  client: Client;
  clientId: number;
  clientOperations: Operation[];
  exportToExcel: () => void;
  exportToPDF: () => void;
  formatAmount: (amount: number) => string;
}

export function ClientInfoCards({
  client,
  clientId,
  clientOperations,
  exportToExcel,
  exportToPDF,
  formatAmount
}: ClientInfoCardsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const [showAllDates, setShowAllDates] = useState(true);

  // Filter operations based on date range
  const filteredOperations = showAllDates 
    ? clientOperations 
    : clientOperations.filter(op => {
        const opDate = new Date(op.operation_date || op.date);
        return dateRange?.from && dateRange?.to 
          ? opDate >= dateRange.from && opDate <= dateRange.to 
          : true;
      });

  // Calculate balances
  const calculateBalances = () => {
    const deposits = filteredOperations
      .filter(op => op.type === "deposit")
      .reduce((sum, op) => sum + op.amount, 0);
    
    const withdrawals = filteredOperations
      .filter(op => op.type === "withdrawal")
      .reduce((sum, op) => sum + op.amount, 0);
    
    const transfers = filteredOperations
      .filter(op => op.type === "transfer")
      .reduce((sum, op) => sum + op.amount, 0);
    
    return { deposits, withdrawals, transfers };
  };

  const balances = calculateBalances();

  return (
    <div className="space-y-6">
      <ClientPersonalInfo 
        client={client} 
        clientId={clientId} 
        formatAmount={formatAmount}
        clientBalance={client.solde}
      />
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Résumé des opérations</span>
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-all-periods" 
                checked={showAllDates} 
                onCheckedChange={setShowAllDates}
              />
              <Label htmlFor="show-all-periods">Toutes les périodes</Label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showAllDates && (
            <div className="mb-4">
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm text-green-700 dark:text-green-400 font-medium">Total des versements</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">{formatAmount(balances.deposits)}</p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h3 className="text-sm text-red-700 dark:text-red-400 font-medium">Total des retraits</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-300">{formatAmount(balances.withdrawals)}</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm text-blue-700 dark:text-blue-400 font-medium">Total des transferts</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{formatAmount(balances.transfers)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
