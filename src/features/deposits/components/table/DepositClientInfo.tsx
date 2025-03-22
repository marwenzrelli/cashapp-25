
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
      // If we have a client ID, we could navigate to the client profile
      console.log("Would navigate to client profile with ID:", clientId);
      // Uncomment the below line to enable navigation when ready
      // navigate(`/clients/${clientId}`);
    } else {
      console.log("Would navigate to client: ", clientName);
    }
  };

  // Format the client ID for display
  const displayClientId = clientId 
    ? (typeof clientId === 'number' ? formatId(clientId) : clientId) 
    : "N/A";
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-200/80 to-gray-300/40 dark:from-gray-700/80 dark:to-gray-600/40 flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-105 border border-gray-200/40 dark:border-gray-700/40">
          <UserCircle className="h-7 w-7 text-gray-600/90 dark:text-gray-300/90 transition-colors group-hover:text-gray-800 dark:group-hover:text-white" />
        </div>
        <div className="absolute inset-0 animate-pulse rounded-full bg-gray-400/5 dark:bg-gray-300/5" />
      </div>
      <div>
        <p 
          className="font-medium cursor-pointer hover:text-gray-800 dark:hover:text-white hover:underline transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-gray-100/90 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/60 shadow-sm hover:shadow border border-gray-200/50 dark:border-gray-700/30"
          onClick={handleClientClick}
        >
          {clientName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 pl-1">
          ID: {displayClientId}
        </p>
      </div>
    </div>
  );
};
