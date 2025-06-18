
import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Client } from "../../types";
import { ClientBalanceDisplay } from "./ClientBalanceDisplay";
import { ClientExpandedView } from "./ClientExpandedView";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { ClientIdBadge } from "../ClientIdBadge";

interface ClientListItemProps {
  client: Client;
  isExpanded: boolean;
  onToggleExpand: (clientId: number) => void;
  onView: (clientId: number) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientListItem = ({
  client,
  isExpanded,
  onToggleExpand,
  onView,
  onEdit,
  onDelete,
}: ClientListItemProps) => {
  const clientName = `${client.prenom} ${client.nom}`;
  const clientId = typeof client.id === 'string' ? parseInt(client.id, 10) : client.id;

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      {/* Main row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(clientId)}
            className="p-1 h-8 w-8 shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Client Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex flex-col space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 
                  className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onView(clientId)}
                >
                  {clientName}
                </h3>
                <ClientIdBadge clientId={clientId} />
                <ClientStatusBadge status={client.status}>
                  {client.status === 'active' ? 'Actif' : 
                   client.status === 'inactive' ? 'Inactif' : 
                   client.status === 'pending' ? 'En attente' : 
                   client.status}
                </ClientStatusBadge>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                <span className="truncate">{client.telephone}</span>
                <span className="truncate">{client.email || "Pas d'email"}</span>
              </div>
            </div>

            {/* Balance - Hidden on small screens when expanded */}
            <div className={`${isExpanded ? 'hidden sm:block' : 'block'} shrink-0`}>
              <ClientBalanceDisplay 
                solde={client.solde} 
                clientId={clientId}
                clientName={clientName}
              />
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(clientId)}>
              <Eye className="mr-2 h-4 w-4" />
              Voir le profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(client)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(client)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pl-12">
          <ClientExpandedView client={client} onView={onView} />
        </div>
      )}
    </div>
  );
};
