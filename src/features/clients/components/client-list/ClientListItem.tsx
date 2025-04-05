
import { Button } from "@/components/ui/button";
import { Hash, MoreHorizontal } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatId } from "@/utils/formatId";
import { Client } from "../../types";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { ClientListActions } from "./ClientListActions";
import { ClientBalanceDisplay } from "./ClientBalanceDisplay";
import { ClientExpandedView } from "./ClientExpandedView";

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
  onDelete 
}: ClientListItemProps) => {
  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Actif' : 
           status === 'inactive' ? 'Inactif' : 
           status;
  };

  // FIX: Simplified click handler to avoid propagation issues
  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView(client.id);
  };

  return (
    <div className={`p-4 md:p-5 transition-colors w-full ${isExpanded ? 'bg-muted/50' : 'hover:bg-muted/30'}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {client.prenom.charAt(0)}{client.nom.charAt(0)}
          </div>
          <div className="flex-grow">
            <h3 
              className="font-medium text-base cursor-pointer hover:text-primary hover:underline"
              onClick={handleView}
            >
              {client.prenom} {client.nom}
            </h3>
            <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {formatId(client.id)}
              </span>
              <span>•</span>
              <span className="truncate">{client.telephone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 w-full md:w-auto">
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Move balance to the left of status on desktop */}
            <div className="hidden md:block">
              <ClientBalanceDisplay solde={client.solde} />
            </div>
            
            <ClientStatusBadge status={client.status}>
              {getStatusLabel(client.status)}
            </ClientStatusBadge>
            
            {/* Mobile actions */}
            <div className="md:hidden">
              <ClientListActions 
                client={client} 
                onView={onView} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                isMobile={true} 
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between md:gap-8 w-full md:w-auto">
            {/* Show balance on mobile but not on desktop (moved it above) */}
            <div className="md:hidden">
              <ClientBalanceDisplay solde={client.solde} />
            </div>
            
            <div className="hidden md:flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onToggleExpand(client.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Plus d'informations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Desktop actions */}
              <ClientListActions 
                client={client} 
                onView={onView} 
                onEdit={onEdit} 
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && <ClientExpandedView client={client} onView={onView} />}
    </div>
  );
};
