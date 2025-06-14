
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle } from "lucide-react";

interface NewWithdrawalButtonProps {
  onClick: () => void;
  isVisible?: boolean;
}

export const NewWithdrawalButton: React.FC<NewWithdrawalButtonProps> = ({ 
  onClick, 
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-center">
      <Button
        onClick={onClick}
        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
      >
        <ArrowDownCircle className="mr-2 h-5 w-5" />
        Nouveau retrait
      </Button>
    </div>
  );
};
