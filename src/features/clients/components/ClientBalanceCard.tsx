
import { format } from "date-fns";
import { FileSpreadsheet, FileText, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Client } from "../types";

interface ClientBalanceCardProps {
  client: Client;
  clientId: number;
  exportToExcel: () => void;
  exportToPDF: () => void;
  formatAmount: (amount: number) => string;
  showQRCode?: boolean;
}

export const ClientBalanceCard = ({
  client,
  clientId,
  exportToExcel,
  exportToPDF,
  formatAmount,
  showQRCode = true,
}: ClientBalanceCardProps) => {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wallet className="h-5 w-5 text-primary" />
          Solde actuel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "text-4xl font-bold py-4",
              client.solde >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {formatAmount(client.solde)}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Mis à jour le {format(new Date(), "dd/MM/yyyy HH:mm")}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={exportToExcel}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={exportToPDF}
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
