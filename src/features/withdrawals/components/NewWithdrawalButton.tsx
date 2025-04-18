
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle } from "lucide-react";

interface NewWithdrawalButtonProps {
  onClick: () => void;
}

export const NewWithdrawalButton: React.FC<NewWithdrawalButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="bg-red-600 hover:bg-red-700 text-white gap-2 w-full sm:w-auto"
    >
      <ArrowDownCircle className="h-4 w-4" />
      Nouveau retrait
    </Button>
  );
};
