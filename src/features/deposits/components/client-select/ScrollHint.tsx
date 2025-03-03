
import { ChevronDown } from "lucide-react";

interface ScrollHintProps {
  show: boolean;
}

export const ScrollHint = ({ show }: ScrollHintProps) => {
  if (!show) return null;
  
  return (
    <div className="flex justify-center items-center py-3 text-xs text-muted-foreground">
      <ChevronDown className="h-4 w-4 mr-1" />
      <span>Glisser pour voir tous les clients</span>
    </div>
  );
};
