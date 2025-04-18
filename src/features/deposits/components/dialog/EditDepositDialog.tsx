
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EditFormData } from "@/components/deposits/types";
import { formatDateTime, formatISODateTime } from "@/features/deposits/hooks/utils/dateUtils";
import { Client } from "@/features/clients/types";
import { DialogHeader } from "./edit-deposit/DialogHeader";
import { EditDateTimeSection } from "./edit-deposit/EditDateTimeSection";
import { EditClientSection } from "./edit-deposit/EditClientSection";
import { EditAmountSection } from "./edit-deposit/EditAmountSection";
import { EditDescriptionSection } from "./edit-deposit/EditDescriptionSection";
import { DialogFooterButtons } from "./edit-deposit/DialogFooterButtons";

export interface EditDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: EditFormData;
  onEditFormChange: (field: keyof EditFormData, value: string) => void;
  onConfirm: () => Promise<boolean | void>; // Updated return type
  isLoading?: boolean;
  selectedDeposit?: any;
  clients?: Client[];
}

export const EditDepositDialog: React.FC<EditDepositDialogProps> = ({
  isOpen,
  onOpenChange,
  editForm,
  onEditFormChange,
  onConfirm,
  isLoading = false,
  selectedDeposit,
  clients = []
}) => {
  // Effect to set the date/time from either operation_date (if exists) or created_at
  useEffect(() => {
    if (!selectedDeposit) return;
    
    console.log("Setting date/time for deposit editing:", selectedDeposit);
    
    // Prioritize operation_date if it exists
    if (selectedDeposit.operation_date) {
      const formattedDateTime = formatISODateTime(selectedDeposit.operation_date);
      
      if (!editForm.date) {
        onEditFormChange('date', formattedDateTime.date);
      }
      
      if (!editForm.time) {
        onEditFormChange('time', formattedDateTime.time);
      }
    } 
    // Fall back to created_at
    else if (selectedDeposit.created_at) {
      const formattedDateTime = formatISODateTime(selectedDeposit.created_at);
      
      if (!editForm.date) {
        onEditFormChange('date', formattedDateTime.date);
      }
      
      if (!editForm.time) {
        onEditFormChange('time', formattedDateTime.time);
      }
    }
  }, [selectedDeposit, editForm.date, editForm.time, onEditFormChange]);

  // Creation date (this is what will be shown in the list)
  const creationDate = selectedDeposit ? formatDateTime(selectedDeposit.created_at) : '';
  
  // Custom operation date info (if it exists) - displayed in local time
  const operationDate = selectedDeposit?.operation_date ? 
    formatDateTime(selectedDeposit.operation_date) : null;

  // Last modification info
  const lastModified = selectedDeposit?.last_modified_at ? 
    formatDateTime(selectedDeposit.last_modified_at) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-4 overflow-y-auto max-h-[90vh]">
        <DialogHeader 
          creationDate={creationDate}
          operationDate={operationDate}
          lastModified={lastModified}
        />

        <div className="space-y-3">
          <EditDateTimeSection 
            editForm={editForm}
            onEditFormChange={onEditFormChange}
          />
          
          <EditClientSection 
            editForm={editForm}
            onEditFormChange={onEditFormChange}
            clients={clients}
          />
          
          <EditAmountSection 
            editForm={editForm}
            onEditFormChange={onEditFormChange}
          />
          
          <EditDescriptionSection 
            editForm={editForm}
            onEditFormChange={onEditFormChange}
          />
        </div>

        <hr className="mt-2 mb-2" />

        <DialogFooterButtons 
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

