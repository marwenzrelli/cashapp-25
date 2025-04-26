
import { Operation } from "@/features/operations/types";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AccountFlowMobileView } from "./AccountFlowMobileView";

interface PublicAccountFlowTabProps {
  operations: Operation[];
}

export const PublicAccountFlowTab = ({ operations }: PublicAccountFlowTabProps) => {
  const { currency } = useCurrency();
  
  // Sort operations by date and calculate running balance
  const sortedOperations = useMemo(() => {
    return [...operations].sort((a, b) => {
      const dateA = new Date(a.operation_date || a.date);
      const dateB = new Date(b.operation_date || b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [operations]);

  return (
    <Card className="mt-4">
      <ScrollArea className="h-[600px] w-full rounded-md">
        <AccountFlowMobileView operations={sortedOperations} />
      </ScrollArea>
    </Card>
  );
};
