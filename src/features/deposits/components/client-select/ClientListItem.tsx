import { UserCircle, Check } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
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
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove(client.id.toString());
    }
  };

  return (
    <div 
      onClick={e => onClick(client.id.toString(), e)} 
      onTouchStart={e => e.stopPropagation()} 
      onTouchEnd={e => onClick(client.id.toString(), e)} 
      data-client-id={client.id.toString()} 
      className={`
        rounded-lg mx-1 py-1.5 px-2 transition-all relative
        ${isSelected 
          ? 'bg-primary/15 border-l-4 border-primary shadow-sm' 
          : 'hover:bg-muted/50 active:bg-muted/70'}
        ${isSelected 
          ? 'pl-2' 
          : 'pl-3'}
        cursor-pointer select-none touch-manipulation
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserCircle className="h-7 w-7 text-primary/80 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-sm leading-tight">
              {client.prenom} {client.nom}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {client.telephone}
            </span>
          </div>
        </div>
        {isSelected && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
      
      {/* Hidden SelectItem with hidden class to keep the value state but hide it from view */}
      <SelectItem value={client.id.toString()} className="hidden" />
    </div>
  );
};
