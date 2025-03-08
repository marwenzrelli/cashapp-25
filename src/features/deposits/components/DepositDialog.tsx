
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client } from "../../clients/types";
import { StandaloneDepositForm } from "./DepositForm";
import { Deposit } from "../types";

export const DepositDialog = ({
  clients,
  isOpen,
  onOpenChange,
  onConfirm
}: DepositDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau versement</DialogTitle>
        </DialogHeader>
        
        <StandaloneDepositForm 
          clients={clients}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
};
