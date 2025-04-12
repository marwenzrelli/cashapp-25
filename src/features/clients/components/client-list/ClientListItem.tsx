
import { Button } from "@/components/ui/button";
import { Hash, MoreHorizontal, Phone } from "lucide-react";
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

  // Handle click to view client profile without propagation issues
  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView(client.id);
  };

  return (
    <div className={`p-4 md:p-5 transition-colors w-full border-b last:border-b-0 ${isExpanded ? 'bg-muted/50' : 'hover:bg-muted/30'}`}>
      {/* Main content container */}
      <div className="flex flex-col space-y-4">
        {/* Top row - Client name and balance on desktop */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          {/* Client name and ID section */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {client.prenom.charAt(0)}{client.nom.charAt(0)}
            </div>
            
            <div className="flex-grow">
              <h3 
                className="font-semibold text-lg cursor-pointer hover:text-primary hover:underline"
                onClick={handleView}
              >
                {client.prenom} {client.nom}
              </h3>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {formatId(client.id)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Desktop balance display */}
          <div className="hidden md:block">
            <ClientBalanceDisplay solde={client.solde} />
          </div>
        </div>
        
        {/* Middle row - Contact and status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
          {/* Contact info */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span className="text-sm">{client.telephone}</span>
          </div>
          
          {/* Status and actions row */}
          <div className="flex items-center justify-between md:justify-end gap-4">
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
        </div>
        
        {/* Bottom row - Mobile balance and desktop actions */}
        <div className="flex items-center justify-between md:mt-2">
          {/* Mobile balance display */}
          <div className="md:hidden">
            <ClientBalanceDisplay solde={client.solde} />
          </div>
          
          {/* Desktop actions and more info */}
          <div className="hidden md:flex items-center ml-auto">
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
      
      {/* Expanded information section */}
      {isExpanded && <ClientExpandedView client={client} onView={onView} />}
    </div>
  );
};
