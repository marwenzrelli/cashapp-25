
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Client } from "../types";
import { PencilIcon, TrashIcon, EyeIcon, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientList = ({ clients, onEdit, onDelete }: ClientListProps) => {
  const [hoveredClient, setHoveredClient] = useState<number | null>(null);
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const formatAmount = (amount: number) => `${amount.toLocaleString()} ${currency}`;

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-3 px-4 text-left font-medium">Nom</th>
            <th className="py-3 px-4 text-left font-medium">Email</th>
            <th className="py-3 px-4 text-left font-medium">Téléphone</th>
            <th className="py-3 px-4 text-left font-medium">Solde</th>
            <th className="py-3 px-4 text-left font-medium">Status</th>
            <th className="py-3 px-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="border-b hover:bg-muted/50 transition-colors"
              onMouseEnter={() => setHoveredClient(client.id)}
              onMouseLeave={() => setHoveredClient(null)}
            >
              <td className="py-3 px-4 align-middle">
                <div className="font-medium">
                  {client.prenom} {client.nom}
                </div>
              </td>
              <td className="py-3 px-4 align-middle">{client.email}</td>
              <td className="py-3 px-4 align-middle">{client.telephone}</td>
              <td className="py-3 px-4 align-middle">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className={cn(
                    client.solde >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                    "font-medium"
                  )}>
                    {formatAmount(client.solde)}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 align-middle">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    client.status === "active"
                      ? "border-green-500 text-green-500"
                      : "border-red-500 text-red-500"
                  )}
                >
                  {client.status}
                </Badge>
              </td>
              <td className="py-3 px-4 align-middle">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/client/${client.id}`)}
                    className="ml-auto"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(client)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(client)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
