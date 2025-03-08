
import { User } from "lucide-react";
import { formatId } from "@/utils/formatId";

interface DepositClientInfoProps {
  clientName: string;
  depositId: number;
}

export const DepositClientInfo = ({ 
  clientName, 
  depositId 
}: DepositClientInfoProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-primary/10 p-1.5">
        <User className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="font-medium">{clientName}</div>
        <div className="text-xs text-muted-foreground">
          ID: {formatId(depositId)}
        </div>
      </div>
    </div>
  );
};
