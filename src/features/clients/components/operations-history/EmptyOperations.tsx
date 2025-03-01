
import React from "react";

interface EmptyOperationsProps {
  type?: "deposit" | "withdrawal" | "transfer" | "all";
}

export const EmptyOperations = ({ type = "all" }: EmptyOperationsProps) => {
  const getMessage = () => {
    switch (type) {
      case "deposit":
        return "Aucun versement trouvé";
      case "withdrawal":
        return "Aucun retrait trouvé";
      case "transfer":
        return "Aucun virement trouvé";
      default:
        return "Aucune opération trouvée";
    }
  };

  return (
    <div className="text-center py-6">
      <p className="text-muted-foreground">{getMessage()}</p>
    </div>
  );
};
