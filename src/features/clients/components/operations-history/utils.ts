
import { Operation } from "@/features/operations/types";
import { Badge } from "@/components/ui/badge";

export const getAmountColor = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "text-green-600 dark:text-green-400";
    case "withdrawal":
      return "text-red-600 dark:text-red-400";
    case "transfer":
      return "text-green-600 dark:text-green-400";
    default:
      return "";
  }
};

// Add the missing function to generate status badges
export const getOperationStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Complété</Badge>;
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
    case "failed":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Échoué</Badge>;
    case "processing":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En traitement</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};
