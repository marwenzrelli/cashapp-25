
import { Hash, User } from "lucide-react";
import { formatId } from "@/utils/formatId";

interface DepositClientInfoProps {
  clientName: string;
  depositId: string | number;
}

export const DepositClientInfo = ({ 
  clientName, 
  depositId 
}: DepositClientInfoProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <User className="h-4 w-4 text-purple-500" />
        <span className="font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
          {clientName}
        </span>
      </div>
      <div className="flex items-center text-xs text-muted-foreground">
        <Hash className="h-3 w-3 mr-1" />
        <span className="font-mono">{formatId(depositId.toString())}</span>
      </div>
    </div>
  );
};
