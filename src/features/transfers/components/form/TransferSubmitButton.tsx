
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransferSubmitButtonProps {
  isLoading: boolean;
}

export const TransferSubmitButton = ({ isLoading }: TransferSubmitButtonProps) => {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Traitement en cours...
        </>
      ) : (
        <>
          Effectuer le virement
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};
