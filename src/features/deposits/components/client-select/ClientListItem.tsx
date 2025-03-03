
import React from "react";
import { Check } from "lucide-react";
import { type Client } from "@/features/clients/types";

interface ClientListItemProps {
  client: Client;
  isSelected: boolean;
  onClick: (clientId: string, e: React.MouseEvent | React.TouchEvent) => void;
  onRemove?: (clientId: string) => void;
}

export const ClientListItem = ({ 
  client, 
  isSelected, 
  onClick,
  onRemove
}: ClientListItemProps) => {
  
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    onClick(client.id.toString(), e);
  };

  const handleRemove = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onRemove) {
      onRemove(client.id.toString());
    }
  };

  return (
    <div 
      className={`
        px-3 py-2 cursor-pointer hover:bg-muted/50
        ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : ''}
      `}
      onClick={handleClick}
      onTouchStart={handleClick}
      data-client-id={client.id}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="font-medium">
            {client.prenom} {client.nom}
          </div>
          <div className="text-sm text-muted-foreground">
            {client.email || client.telephone || ''}
          </div>
        </div>
        
        {isSelected && (
          <button
            className="ml-2 h-6 w-6 flex items-center justify-center rounded-full bg-blue-500 text-white"
            onClick={handleRemove}
            onTouchStart={handleRemove}
          >
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
