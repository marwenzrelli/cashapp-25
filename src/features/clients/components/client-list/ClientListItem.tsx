
import { Button } from "@/components/ui/button";
import { Hash, MoreHorizontal, Phone, Mail, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatId } from "@/utils/formatId";
import { Client } from "../../types";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { ClientListActions } from "./ClientListActions";
import { ClientBalanceDisplay } from "./ClientBalanceDisplay";
import { ClientExpandedView } from "./ClientExpandedView";
import { format } from "date-fns";

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

  // Simplified click handler to avoid propagation issues
  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView(client.id);
  };

  return (
    <div className={`p-4 md:p-5 transition-colors w-full ${isExpanded ? 'bg-muted/50' : 'hover:bg-muted/30'}`}>
      <div className="flex flex-col gap-4">
        {/* Client name and avatar - prominent header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {client.prenom.charAt(0)}{client.nom.charAt(0)}
            </div>
            <div>
              <h3 
                className="text-lg font-semibold cursor-pointer hover:text-primary hover:underline"
                onClick={handleView}
              >
                {client.prenom} {client.nom}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {formatId(client.id)}
                </span>
                <ClientStatusBadge status={client.status}>
                  {getStatusLabel(client.status)}
                </ClientStatusBadge>
              </div>
            </div>
          </div>
          
          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <ClientBalanceDisplay solde={client.solde} />
            
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
            
            <ClientListActions 
              client={client} 
              onView={onView} 
              onEdit={onEdit} 
              onDelete={onDelete}
            />
          </div>
        </div>
        
        {/* Client details - organized in card format */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/20 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary/70" />
            <div>
              <p className="text-xs text-muted-foreground">Téléphone</p>
              <p className="text-sm font-medium">{client.telephone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary/70" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {client.email || "Non renseigné"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary/70" />
            <div>
              <p className="text-xs text-muted-foreground">Date de création</p>
              <p className="text-sm font-medium">
                {client.date_creation ? format(new Date(client.date_creation), "dd/MM/yyyy") : "Non disponible"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Mobile actions row */}
        <div className="md:hidden flex items-center justify-between mt-2">
          <ClientBalanceDisplay solde={client.solde} />
          
          <ClientListActions 
            client={client} 
            onView={onView} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            isMobile={true} 
          />
        </div>
      </div>
      
      {isExpanded && <ClientExpandedView client={client} onView={onView} />}
    </div>
  );
};
