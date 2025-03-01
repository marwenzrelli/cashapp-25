import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Withdrawal } from "../types";
import { UserCircle, ArrowDownCircle, Pencil, Trash2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Client } from "@/features/clients/types";

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
  itemsPerPage: string;
  onEdit: (withdrawal: Withdrawal) => void;
  onDelete: (withdrawal: Withdrawal) => void;
  findClientById: (clientFullName: string) => (Client & { dateCreation: string }) | null;
}

export const WithdrawalTable: React.FC<WithdrawalTableProps> = ({
  withdrawals,
  itemsPerPage,
  onEdit,
  onDelete,
  findClientById,
}) => {
  const { currency } = useCurrency();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Liste des retraits</CardTitle>
          <div className="text-sm text-muted-foreground">
            Affichage de {Math.min(parseInt(itemsPerPage), withdrawals.length)} sur{" "}
            {withdrawals.length} retraits
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3">Client</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Date</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.slice(0, parseInt(itemsPerPage)).map((withdrawal) => {
                const client = findClientById(withdrawal.client_name);

                return (
                  <tr
                    key={withdrawal.id}
                    className="group border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserCircle className="h-8 w-8 text-primary/20 transition-colors group-hover:text-primary/40" />
                          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
                        </div>
                        <div>
                          <p className="font-medium">{withdrawal.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {client ? client.id : "Non trouvé"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-danger">
                        <ArrowDownCircle className="h-4 w-4" />
                        <span className="font-medium">
                          {withdrawal.amount.toLocaleString()} {currency}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {withdrawal.date}
                    </td>
                    <td className="p-3 text-muted-foreground">{withdrawal.notes}</td>
                    <td className="p-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(withdrawal)}
                          className="relative hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 hover:text-blue-600 transition-all duration-300"
                        >
                          <Pencil className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:rotate-[360deg]" />
                          <span className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(withdrawal)}
                          className="relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-translate-y-1" />
                          <span className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 opacity-0 group-hover:opacity-100 animate-ping" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
