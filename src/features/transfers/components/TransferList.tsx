
import { Search, ArrowLeftRight, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Transfer } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface TransferListProps {
  transfers: Transfer[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (transfer: Transfer) => void;
  onDelete: (transfer: Transfer) => void;
}

export const TransferList = ({
  transfers,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}: TransferListProps) => {
  const { currency } = useCurrency();

  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const formatTransferId = (id: string) => {
    return id.slice(0, 8) + "...";
  };

  const filteredTransfers = transfers.filter(
    (transfer) =>
      transfer.fromClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toClient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Historique des virements
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Consultez l'historique détaillé des virements avec horodatage précis
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filteredTransfers.map((transfer) => (
            <div
              key={transfer.id}
              className="group relative rounded-lg border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-16 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowLeftRight className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {transfer.date}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-muted-foreground">De:</span> {transfer.fromClient}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">À:</span> {transfer.toClient}
                    </div>
                    <p className="text-sm text-muted-foreground">{transfer.reason}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <div className={cn(
                      "text-lg font-semibold",
                      getAmountColor(transfer.amount)
                    )}>
                      {transfer.amount.toLocaleString()} {currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {formatTransferId(transfer.id)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(transfer)}
                      className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all duration-300"
                    >
                      <Pencil className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:rotate-[360deg]" />
                      <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(transfer)}
                      className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1" />
                      <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTransfers.length === 0 && (
            <div className="text-center py-12">
              <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Aucun virement trouvé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Modifiez vos critères de recherche pour voir plus de résultats.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
