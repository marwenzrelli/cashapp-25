
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface DialogFooterButtonsProps {
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const DialogFooterButtons: React.FC<DialogFooterButtonsProps> = ({
  onOpenChange,
  onConfirm,
  isLoading
}) => {
  return (
    <DialogFooter className="mt-4 sm:justify-between">
      <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-base">
        Annuler
      </Button>
      <Button
        onClick={onConfirm}
        className="bg-green-600 hover:bg-green-700 text-white gap-2 px-6 py-2 rounded-full text-base"
        disabled={isLoading}
      >
        <Pencil className="h-4 w-4" />
        {isLoading ? "En cours..." : "Modifier le versement"}
      </Button>
    </DialogFooter>
  );
};
