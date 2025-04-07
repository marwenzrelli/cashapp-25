
import { Info } from "lucide-react";

export const OperationsEmptyState = () => {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
      <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-muted-foreground">
        No operations found. Create deposits, withdrawals, or transfers to see them here.
      </p>
    </div>
  );
};
