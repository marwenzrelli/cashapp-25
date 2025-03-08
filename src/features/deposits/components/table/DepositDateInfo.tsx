
import { Deposit } from "@/features/deposits/types";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";

interface DepositDateInfoProps {
  deposit: Deposit;
}

export const DepositDateInfo = ({ deposit }: DepositDateInfoProps) => {
  const formatDateDisplay = (dateString: string | undefined) => {
    if (!dateString) return "Date inconnue";
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return "Date invalide";
      
      return format(date, "d MMM yyyy à HH:mm", { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Erreur de date";
    }
  };

  // Prioritize operation_date if available, otherwise use created_at date
  const dateToShow = deposit.operation_date || deposit.created_at;
  const formattedDate = formatDateDisplay(dateToShow);
  
  // If using operation_date, show a note that it's a custom date
  const isCustomDate = !!deposit.operation_date;

  return (
    <div className="space-y-1">
      <span>{formattedDate}</span>
      {deposit.last_modified_at && (
        <div className="text-xs text-amber-600">
          Modifié le {formatDateDisplay(deposit.last_modified_at)}
        </div>
      )}
      {isCustomDate && (
        <div className="text-xs text-blue-600">
          Date d'opération personnalisée
        </div>
      )}
    </div>
  );
};
