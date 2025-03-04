
import { UserCircle, Check } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { type Client } from "@/features/clients/types";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  const { currency } = useCurrency();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onRemove) {
      onRemove(client.id.toString());
    }
  };

  return (
    <div 
      onClick={e => onClick(client.id.toString(), e)} 
      onTouchEnd={e => onClick(client.id.toString(), e)} 
      data-client-id={client.id.toString()} 
      className={`
        rounded-lg my-0.5 mx-1.5 py-1 px-1.5 transition-all relative
        ${isSelected 
          ? 'bg-primary/15 border-l-4 border-primary shadow-sm' 
          : 'hover:bg-muted/50 active:bg-muted/70'}
      `}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UserCircle className="h-7 w-7 text-primary/80 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {client.prenom} {client.nom}
            </span>
            {/* No more duplicate client name here */}
          </div>
        </div>
        <span className={`font-mono text-sm font-semibold ${client.solde >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {client.solde.toLocaleString()} {currency}
        </span>
      </div>
      
      {isSelected && (
        <div 
          className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/80"
          onClick={handleRemove}
        >
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
      
      {/* This SelectItem is crucial for Radix UI Select to work properly */}
      <SelectItem value={client.id.toString()} className="sr-only">
        {client.prenom} {client.nom}
      </SelectItem>
    </div>
  );
};
