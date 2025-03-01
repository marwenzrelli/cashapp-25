
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, Calendar, FileText, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";

interface PublicClientOperationsHistoryProps {
  operations: Operation[];
}

export const PublicClientOperationsHistory = ({ operations }: PublicClientOperationsHistoryProps) => {
  const { currency } = useCurrency();
  
  const getAmountColor = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "text-green-600 dark:text-green-400";
      case "withdrawal":
        return "text-red-600 dark:text-red-400";
      case "transfer":
        return "text-green-600 dark:text-green-400";
    }
  };

  const renderOperationsTable = (filteredOperations: Operation[]) => {
    if (filteredOperations.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucune opération trouvée</p>
        </div>
      );
    }

    return (
      <>
        {/* Table for desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                        {getTypeIcon(operation.type)}
                      </div>
                      <span>{getTypeLabel(operation.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {operation.formattedDate || operation.date}
                  </TableCell>
                  <TableCell>{operation.description}</TableCell>
                  <TableCell className={cn("font-medium", getAmountColor(operation.type))}>
                    {operation.type === "withdrawal" ? "-" : ""}{operation.amount.toLocaleString()} {currency}
                  </TableCell>
                  <TableCell>
                    {operation.type === "transfer" ? (
                      <div className="flex flex-col">
                        <span className="text-sm">De: {operation.fromClient}</span>
                        <span className="text-sm">À: {operation.toClient}</span>
                      </div>
                    ) : (
                      <span>{operation.fromClient}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Enhanced cards for mobile */}
        <div className="md:hidden space-y-3">
          {filteredOperations.map((operation) => (
            <div key={operation.id} className="bg-white dark:bg-gray-800 rounded-lg border p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                    {getTypeIcon(operation.type)}
                  </div>
                  <div>
                    <div className="font-medium">{getTypeLabel(operation.type)}</div>
                    <div className="text-xs text-muted-foreground">{operation.formattedDate || operation.date}</div>
                  </div>
                </div>
                <div className={cn("font-semibold text-right", getAmountColor(operation.type))}>
                  {operation.type === "withdrawal" ? "-" : ""}{operation.amount.toLocaleString()} {currency}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-1 text-sm border-t pt-2">
                <div className="flex items-start">
                  <FileText className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span className="flex-1">{operation.description}</span>
                </div>
                
                {operation.type === "transfer" ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>De: {operation.fromClient}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>À: {operation.toClient}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{operation.fromClient}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Historique des opérations</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full flex overflow-x-auto no-scrollbar p-0 rounded-none border-b">
            <TabsTrigger value="all" className="flex-1 text-sm">
              Tout
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex-1 text-sm">
              <ArrowUpCircle className="h-4 w-4 mr-1" />
              Versements
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1 text-sm">
              <ArrowDownCircle className="h-4 w-4 mr-1" />
              Retraits
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex-1 text-sm">
              <RefreshCcw className="h-4 w-4 mr-1" />
              Virements
            </TabsTrigger>
          </TabsList>

          <div className="px-2 sm:px-0 py-2">
            <TabsContent value="all" className="mt-0">
              {renderOperationsTable(operations)}
            </TabsContent>

            <TabsContent value="deposits" className="mt-0">
              {renderOperationsTable(operations.filter(op => op.type === "deposit"))}
            </TabsContent>

            <TabsContent value="withdrawals" className="mt-0">
              {renderOperationsTable(operations.filter(op => op.type === "withdrawal"))}
            </TabsContent>

            <TabsContent value="transfers" className="mt-0">
              {renderOperationsTable(operations.filter(op => op.type === "transfer"))}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
