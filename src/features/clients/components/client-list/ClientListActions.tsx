
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Client } from "../../types";

interface ClientListActionsProps {
  client: Client;
  onView: (clientId: number) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  isMobile?: boolean;
}

export const ClientListActions = ({ 
  client, 
  onView, 
  onEdit, 
  onDelete, 
  isMobile = false 
}: ClientListActionsProps) => {
  if (isMobile) {
    return (
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-600"
          onClick={() => onView(client.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-amber-600"
          onClick={() => onEdit(client)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600"
          onClick={() => onDelete(client)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="hidden md:flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            onClick={() => onView(client.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voir le profil</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            onClick={() => onEdit(client)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Modifier</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => onDelete(client)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Supprimer</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
