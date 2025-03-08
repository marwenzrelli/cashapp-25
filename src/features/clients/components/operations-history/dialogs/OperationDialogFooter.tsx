
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface OperationDialogFooterProps {
  mode: 'edit' | 'delete';
  loading: boolean;
  onClose: () => void;
}

export const OperationDialogFooter = ({
  mode,
  loading,
  onClose
}: OperationDialogFooterProps) => {
  return (
    <DialogFooter className="flex space-x-2 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={loading}
      >
        Annuler
      </Button>
      
      <Button
        type="submit"
        variant={mode === 'delete' ? "destructive" : "default"}
        disabled={loading}
      >
        {loading ? "Traitement..." : mode === 'delete' ? "Supprimer" : "Enregistrer"}
      </Button>
    </DialogFooter>
  );
};
