
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/features/operations/types";

interface OperationsDetailCardsProps {
  clientOperations: Operation[];
  formatAmount: (amount: number) => string;
}

export const OperationsDetailCards = ({ 
  clientOperations, 
  formatAmount 
}: OperationsDetailCardsProps) => {
  return (
    <>
      {/* Versements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-green-600" />
            Versements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm">Date</th>
                  <th className="text-left p-4 font-medium text-sm">Description</th>
                  <th className="text-right p-4 font-medium text-sm">Montant</th>
                </tr>
              </thead>
              <tbody>
                {clientOperations
                  .filter(op => op.type === "deposit")
                  .map((operation) => (
                    <tr key={operation.id} className="border-b last:border-0">
                      <td className="p-4">{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</td>
                      <td className="p-4">{operation.description}</td>
                      <td className="p-4 text-right font-medium text-green-600">{formatAmount(operation.amount)}</td>
                    </tr>
                ))}
                {clientOperations.filter(op => op.type === "deposit").length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center p-4 text-muted-foreground">Aucun versement</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Retraits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
            Retraits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm">Date</th>
                  <th className="text-left p-4 font-medium text-sm">Description</th>
                  <th className="text-right p-4 font-medium text-sm">Montant</th>
                </tr>
              </thead>
              <tbody>
                {clientOperations
                  .filter(op => op.type === "withdrawal")
                  .map((operation) => (
                    <tr key={operation.id} className="border-b last:border-0">
                      <td className="p-4">{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</td>
                      <td className="p-4">{operation.description}</td>
                      <td className="p-4 text-right font-medium text-red-600">{formatAmount(operation.amount)}</td>
                    </tr>
                ))}
                {clientOperations.filter(op => op.type === "withdrawal").length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center p-4 text-muted-foreground">Aucun retrait</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Virements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-purple-600" />
            Virements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm">Date</th>
                  <th className="text-left p-4 font-medium text-sm">Description</th>
                  <th className="text-right p-4 font-medium text-sm">Montant</th>
                  <th className="text-left p-4 font-medium text-sm">De</th>
                  <th className="text-left p-4 font-medium text-sm">À</th>
                </tr>
              </thead>
              <tbody>
                {clientOperations
                  .filter(op => op.type === "transfer")
                  .map((operation) => (
                    <tr key={operation.id} className="border-b last:border-0">
                      <td className="p-4">{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</td>
                      <td className="p-4">{operation.description}</td>
                      <td className="p-4 text-right font-medium text-purple-600">{formatAmount(operation.amount)}</td>
                      <td className="p-4">{operation.fromClient}</td>
                      <td className="p-4">{operation.toClient}</td>
                    </tr>
                ))}
                {clientOperations.filter(op => op.type === "transfer").length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-muted-foreground">Aucun virement</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
