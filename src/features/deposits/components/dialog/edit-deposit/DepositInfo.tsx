
import React from "react";
import { Calendar, Clock, InfoIcon } from "lucide-react";
import { DialogDescription } from "@/components/ui/dialog";

interface DepositInfoProps {
  creationDate: string;
  operationDate: string | null;
  lastModified: string | null;
}

export const DepositInfo: React.FC<DepositInfoProps> = ({
  creationDate,
  operationDate,
  lastModified
}) => {
  return (
    <DialogDescription className="text-base text-gray-500">
      Versement créé le {creationDate}
      
      {operationDate && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-600">
          <Calendar className="h-3.5 w-3.5" />
          Date d'opération personnalisée: {operationDate}
        </div>
      )}
      
      {lastModified && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600">
          <InfoIcon className="h-3.5 w-3.5" />
          Dernière modification le {lastModified}
        </div>
      )}
    </DialogDescription>
  );
};
