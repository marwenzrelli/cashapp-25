
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatId } from "@/utils/formatId";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DepositClientInfoProps {
  clientName: string;
  depositId: string | number; 
  clientId?: string | number | null;
  clientBalance?: number | null;
}

export const DepositClientInfo = ({ 
  clientName,
  depositId,
  clientId = null,
  clientBalance = null
}: DepositClientInfoProps) => {
  const navigate = useNavigate();
  const { currency } = useCurrency();

  // Handle click to navigate to client profile
  const handleClientClick = () => {
    if (
      clientId !== undefined &&
      clientId !== null &&
      !isNaN(Number(clientId)) &&
      Number(clientId) > 0 // ID positif (d'après la structure table Supabase)
    ) {
      navigate(`/clients/${clientId}`);
    } else {
      console.log("Aucun ID client valide pour la navigation:", clientName, clientId);
    }
  };

  // Format robustly the client ID (always display 4 chiffres or N/A)
  let displayClientId = "N/A";
  if (
    clientId !== undefined &&
    clientId !== null &&
    !isNaN(Number(clientId)) &&
    Number(clientId) > 0 // ID positif
  ) {
    displayClientId = formatId(clientId, 4);
  }

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
          title={displayClientId === "N/A" ? "Aucun client ID n’est relié à ce versement" : undefined}
          onClick={handleClientClick}
        >
          {clientName}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground pl-1">
            ID client : <span className={displayClientId === "N/A" ? "text-red-400" : "font-semibold text-primary"}>{displayClientId}</span>
          </p>
          {clientBalance !== null && (
            <span className={`text-xs px-2 py-0.5 rounded-md border ${
              clientBalance >= 0
                ? "text-green-600 dark:text-green-400 border-green-200 bg-green-50 dark:bg-green-900/20"
                : "text-red-600 dark:text-red-400 border-red-200 bg-red-50 dark:bg-red-900/20"
            }`}>
              Solde: {clientBalance.toLocaleString()} {currency}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
