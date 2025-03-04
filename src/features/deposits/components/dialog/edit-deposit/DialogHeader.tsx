
import React from "react";
import { DialogHeader as UIDialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { DepositInfo } from "./DepositInfo";

interface DialogHeaderProps {
  creationDate: string;
  operationDate: string | null;
  lastModified: string | null;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  creationDate,
  operationDate,
  lastModified
}) => {
  return (
    <UIDialogHeader>
      <DialogTitle className="flex items-center gap-2 text-2xl">
        <div className="rounded-xl bg-blue-100 dark:bg-blue-900/20 p-2">
          <Pencil className="h-6 w-6 text-blue-600" />
        </div>
        Modifier le versement
      </DialogTitle>
      <DepositInfo 
        creationDate={creationDate}
        operationDate={operationDate}
        lastModified={lastModified}
      />
    </UIDialogHeader>
  );
};
