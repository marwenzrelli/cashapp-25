
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, ArrowRightLeft, Shuffle } from "lucide-react";

export const getTypeStyle = (type: string): string => {
  switch (type) {
    case 'deposit':
      return "bg-green-100 hover:bg-green-200 text-green-800";
    case 'withdrawal':
      return "bg-red-100 hover:bg-red-200 text-red-800";
    case 'transfer':
      return "bg-blue-100 hover:bg-blue-200 text-blue-800";
    case 'direct_transfer':
      return "bg-purple-100 hover:bg-purple-200 text-purple-800";
    default:
      return "bg-gray-100 hover:bg-gray-200 text-gray-800";
  }
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'deposit':
      return <ArrowDown className="h-3 w-3" />;
    case 'withdrawal':
      return <ArrowUp className="h-3 w-3" />;
    case 'transfer':
      return <ArrowRightLeft className="h-3 w-3" />;
    case 'direct_transfer':
      return <Shuffle className="h-3 w-3" />;
    default:
      return null;
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'deposit':
      return "Versement";
    case 'withdrawal':
      return "Retrait";
    case 'transfer':
      return "Virement";
    case 'direct_transfer':
      return "Opération Directe";
    default:
      return type;
  }
};
