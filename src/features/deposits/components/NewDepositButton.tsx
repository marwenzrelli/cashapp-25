
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface NewDepositButtonProps {
  onClick: () => void;
  isVisible?: boolean;
}

export const NewDepositButton: React.FC<NewDepositButtonProps> = ({ 
  onClick, 
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-center">
      <Button
        onClick={onClick}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        Nouveau versement
      </Button>
    </div>
  );
};
