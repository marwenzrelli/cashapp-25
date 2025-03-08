
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface OperationsFilterButtonsProps {
  selectedType: "all" | "deposits" | "withdrawals" | "transfers";
  setSelectedType: (type: "all" | "deposits" | "withdrawals" | "transfers") => void;
}

export const OperationsFilterButtons = ({
  selectedType,
  setSelectedType
}: OperationsFilterButtonsProps) => {
  useEffect(() => {
    console.log("Selected type changed to:", selectedType);
  }, [selectedType]);

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 w-full">
      <Button
        variant={selectedType === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedType("all")}
        className="whitespace-nowrap"
      >
        Toutes les opérations
      </Button>
      <Button
        variant={selectedType === "deposits" ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedType("deposits")}
        className="whitespace-nowrap"
      >
        Versements
      </Button>
      <Button
        variant={selectedType === "withdrawals" ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedType("withdrawals")}
        className="whitespace-nowrap"
      >
        Retraits
      </Button>
      <Button
        variant={selectedType === "transfers" ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedType("transfers")}
        className="whitespace-nowrap"
      >
        Virements
      </Button>
    </div>
  );
};
