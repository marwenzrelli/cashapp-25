
import { Hash } from "lucide-react";
import { formatId } from "@/utils/formatId";
import { cn } from "@/lib/utils";

interface ClientIdBadgeProps {
  clientId: number;
  className?: string;
}

export const ClientIdBadge = ({ clientId, className }: ClientIdBadgeProps) => {
  return (
    <div className={cn("flex items-center gap-2 text-sm bg-muted/70 px-3 py-1 rounded-full ml-2 border border-muted", className)}>
      <Hash className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">ID: {formatId(clientId)}</span>
    </div>
  );
};
