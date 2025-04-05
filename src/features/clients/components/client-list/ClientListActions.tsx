
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Pencil, Trash } from "lucide-react";
import { Client } from "../../types";

interface ClientListActionsProps {
  client: Client;
  onView: (clientId: number) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  isMobile?: boolean;
}

export const ClientListActions = ({ client, onView, onEdit, onDelete, isMobile }: ClientListActionsProps) => {
  // If the client has no ID, we shouldn't allow viewing their profile
  const handleView = () => {
    if (!client || !client.id) {
      console.error("Client invalide ou sans ID:", client);
      return;
    }
    onView(client.id);
  };

  // If on mobile view, don't render the actions with tooltips
  if (isMobile) {
    return (
      <div className="flex space-x-2 justify-end md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleView}
          className="h-10 w-10 text-primary"
          disabled={!client || !client.id}
        >
          <Eye className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(client)}
          className="h-10 w-10 text-amber-500"
        >
          <Pencil className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(client)}
          className="h-10 w-10 text-destructive"
        >
          <Trash className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Standard desktop view with tooltips
  return (
    <div className="flex space-x-2 justify-end">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleView}
              className="h-8 w-8 text-primary"
              disabled={!client || !client.id}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voir le profil</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(client)}
              className="h-8 w-8 text-amber-500"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Modifier</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(client)}
              className="h-8 w-8 text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Supprimer</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
