
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatId } from "@/utils/formatId";

interface DepositClientInfoProps {
  clientName: string;
  depositId: string | number; 
  clientId?: string | number | null;
}

export const DepositClientInfo = ({ 
  clientName,
  depositId,
  clientId = null // Default to null if not provided
}: DepositClientInfoProps) => {
  const navigate = useNavigate();
  
  // Handle click to navigate to client profile
  const handleClientClick = () => {
    if (clientId) {
      navigate(`/clients/${clientId}`);
    } else {
      console.log("No client ID available for navigation:", clientName);
    }
  };

  // Format the client ID for display as 4 digits
  const displayClientId = clientId 
    ? (typeof clientId === 'number' 
        ? formatId(clientId, 4) // Format to 4 digits
        : formatId(parseInt(clientId), 4)) // Parse string to int and format
    : "N/A";
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/10 to-purple-300/40 flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105">
          <UserCircle className="h-7 w-7 text-primary/70 transition-colors group-hover:text-primary" />
        </div>
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
      </div>
      <div>
        <p 
          className="font-medium cursor-pointer hover:text-primary hover:underline transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-purple-50/90 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 shadow-sm hover:shadow border border-purple-100/30 dark:border-purple-900/20"
          onClick={handleClientClick}
        >
          {clientName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 pl-1">
          ID: {displayClientId}
        </p>
      </div>
    </div>
  );
};
