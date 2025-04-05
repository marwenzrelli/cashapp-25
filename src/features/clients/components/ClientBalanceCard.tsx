
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
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Solde actuel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-3xl font-bold",
            client.solde >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {formatAmount(client.solde)}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Mis à jour le {format(new Date(), "dd/MM/yyyy HH:mm")}
        </p>
        
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={exportToExcel}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={exportToPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
