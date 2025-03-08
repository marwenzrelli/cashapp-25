
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PublicOperationsTabs } from "./operations-history/PublicOperationsTabs";

interface PublicClientOperationsHistoryProps {
  operations: Operation[];
}

export const PublicClientOperationsHistory = ({ operations }: PublicClientOperationsHistoryProps) => {
  const { currency } = useCurrency();
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Historique des opérations</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <PublicOperationsTabs operations={operations} currency={currency} />
      </CardContent>
    </Card>
  );
};
