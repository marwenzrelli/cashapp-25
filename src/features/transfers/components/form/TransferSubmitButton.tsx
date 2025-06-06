
import { Loader2, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransferSubmitButtonProps {
  isLoading: boolean;
}

export const TransferSubmitButton = ({ isLoading }: TransferSubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      disabled={isLoading} 
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="text-blue-100">Traitement en cours...</span>
        </>
      ) : (
        <>
          <Send className="mr-2 h-5 w-5" />
          <span>Effectuer le virement</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  );
};
