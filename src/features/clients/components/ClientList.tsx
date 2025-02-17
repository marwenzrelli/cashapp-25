
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserCircle, Pencil, Trash2 } from "lucide-react";
import { Client } from "../types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatAmount } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientList = ({ clients, onEdit, onDelete }: ClientListProps) => {
  const { currency } = useCurrency();

  const getBalanceColor = (solde: number) => {
    if (solde > 0) return "text-green-600 dark:text-green-400";
    if (solde < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" />
          Liste des clients ({clients.length})
        </CardTitle>
        <CardDescription>
          Gérez vos clients et accédez à leurs informations détaillées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Solde</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserCircle className="h-10 w-10 text-primary/20 transition-colors group-hover:text-primary/40" />
                        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {client.prenom} {client.nom}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {client.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {client.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {client.telephone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "font-medium tabular-nums transition-colors",
                      getBalanceColor(client.solde)
                    )}>
                      {formatAmount(client.solde, currency)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(client)}
                        className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all duration-300"
                      >
                        <Pencil className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:rotate-[360deg]" />
                        <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(client)}
                        className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1" />
                        <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
