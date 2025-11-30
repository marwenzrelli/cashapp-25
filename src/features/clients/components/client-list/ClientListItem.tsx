
import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Client } from "../../types";
import { ClientBalanceDisplay } from "./ClientBalanceDisplay";
import { ClientExpandedView } from "./ClientExpandedView";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { ClientIdBadge } from "../ClientIdBadge";
import { ClientShortLink } from "./ClientShortLink";

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
    <div className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
      {/* Main row */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(clientId)}
            className="p-1 h-8 w-8 shrink-0 mt-0.5 sm:mt-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Client Info - Mobile Optimized */}
          <div className="flex-1 min-w-0">
            {/* Main Line: Name */}
            <div className="mb-1.5">
              <h3 
                className="font-semibold text-base leading-tight cursor-pointer hover:text-primary transition-colors"
                onClick={() => onView(clientId)}
              >
                {clientName}
              </h3>
            </div>

            {/* Info Line: ID + Access Code */}
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground">
                <span className="font-medium">#{clientId}</span> • ID: {String(clientId).padStart(6, '0')}
              </span>
              <ClientShortLink clientId={clientId} />
            </div>

            {/* Balance & Status - Mobile */}
            <div className="flex items-center gap-2 mb-2 sm:hidden flex-wrap">
              <ClientBalanceDisplay 
                solde={client.solde} 
                clientId={clientId}
                clientName={clientName}
              />
              <ClientStatusBadge status={client.status}>
                {client.status === 'active' ? 'Actif' : 
                 client.status === 'inactive' ? 'Inactif' : 
                 client.status === 'pending' ? 'En attente' : 
                 client.status}
              </ClientStatusBadge>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
              <span className="truncate">{client.telephone}</span>
              {client.email && <span className="truncate">{client.email}</span>}
            </div>

            {/* Desktop View - Status */}
            <div className="hidden sm:flex sm:items-center sm:gap-2 sm:mt-1.5">
              <ClientStatusBadge status={client.status}>
                {client.status === 'active' ? 'Actif' : 
                 client.status === 'inactive' ? 'Inactif' : 
                 client.status === 'pending' ? 'En attente' : 
                 client.status}
              </ClientStatusBadge>
            </div>
          </div>

          {/* Balance - Desktop Only */}
          <div className="hidden sm:block shrink-0">
            <ClientBalanceDisplay 
              solde={client.solde} 
              clientId={clientId}
              clientName={clientName}
            />
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
