
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface NewDepositButtonProps {
  onClick: () => void;
}

export const NewDepositButton: React.FC<NewDepositButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="bg-green-600 hover:bg-green-700 text-white gap-2"
    >
      <PlusCircle className="h-4 w-4" />
      Nouveau versement
    </Button>
  );
};
