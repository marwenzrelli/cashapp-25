
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewTransferButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const NewTransferButton = ({ onClick, isVisible }: NewTransferButtonProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-center">
      <Button 
        onClick={onClick}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
      >
        <Plus className="mr-2 h-5 w-5" />
        Nouveau virement
      </Button>
    </div>
  );
};
