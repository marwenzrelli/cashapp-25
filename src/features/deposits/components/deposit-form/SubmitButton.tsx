
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
}

export const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-green-600 hover:bg-green-700 text-white" 
      disabled={isLoading}
    >
      {isLoading ? "En cours..." : "Enregistrer le versement"}
    </Button>
  );
};
