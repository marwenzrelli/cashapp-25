
import { Operation } from "@/features/operations/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AccountFlowMobileViewProps {
  operations: any[];
}

export const AccountFlowMobileView = ({ operations }: AccountFlowMobileViewProps) => {
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  const formatAmount = (amount: number): string => {
    return Math.round(amount).toString();
  };

  const getAmountClass = (type: string) => {
    if (type === "deposit") return "text-green-600";
    if (type === "withdrawal") return "text-red-600";
    if (type === "transfer") return "text-blue-600";
    return "";
  };

  return (
    <div className="md:hidden">
      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {operations.map((op) => (
            <Card key={op.id} className="p-3">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getTypeStyle(op.type)} flex items-center gap-1`}>
                      {getTypeIcon(op.type)}
                      {getTypeLabel(op.type)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(op.operation_date || op.date)}
                    </span>
                  </div>
                  <span className="text-sm font-mono">
                    #{op.id.toString().split('-')[1] || op.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Avant</p>
                    <p className="font-medium">{formatAmount(op.balanceBefore)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Après</p>
                    <p className="font-medium">{formatAmount(op.balanceAfter)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Montant</p>
                  <p className={`font-medium ${getAmountClass(op.type)}`}>
                    {op.type === "withdrawal" ? "- " : ""}{formatAmount(op.amount)}
                  </p>
                </div>

                {op.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm break-words">{op.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
