
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatId } from "@/utils/formatId";

interface DepositClientInfoProps {
  clientName: string;
  depositId: string | number; // Update to accept both string and number
  clientId?: string | number | null; // Update to accept both string and number and null
}

export const DepositClientInfo = ({ 
  clientName,
  depositId,
  clientId = "N/A" // Default to "N/A" if not provided
}: DepositClientInfoProps) => {
  const navigate = useNavigate();
  
  // Handle click to navigate to client profile
  const handleClientClick = () => {
    // This is a placeholder - we would need to get the actual client ID
    // For now, we just prevent the default action
    console.log("Would navigate to client: ", clientName);
  };

  // Format the client ID for display
  const displayClientId = clientId && clientId !== "N/A" 
    ? (typeof clientId === 'number' ? formatId(clientId) : clientId) 
    : "N/A";
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <UserCircle className="h-8 w-8 text-primary/20 transition-colors group-hover:text-primary/40" />
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
      </div>
      <div>
        <p 
          className="font-medium cursor-pointer hover:text-primary hover:underline transition-colors flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20"
          onClick={handleClientClick}
        >
          {clientName}
        </p>
        <p className="text-sm text-muted-foreground">
          ID: {displayClientId}
        </p>
      </div>
    </div>
  );
};
