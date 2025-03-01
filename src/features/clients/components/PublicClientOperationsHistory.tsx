
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, Calendar, FileText, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { OperationCard } from "@/features/operations/components/OperationCard";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";

interface PublicClientOperationsHistoryProps {
  operations: Operation[];
}

export const PublicClientOperationsHistory = ({ operations }: PublicClientOperationsHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Historique des opérations</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full flex overflow-x-auto no-scrollbar p-0 rounded-none border-b">
            <TabsTrigger value="all" className="flex-1 text-sm">
              Tout
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex-1 text-sm">
              <ArrowUpCircle className="h-4 w-4 mr-1" />
              Versements
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex-1 text-sm">
              <ArrowDownCircle className="h-4 w-4 mr-1" />
              Retraits
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex-1 text-sm">
              <RefreshCcw className="h-4 w-4 mr-1" />
              Virements
            </TabsTrigger>
          </TabsList>

          <div className="px-2 sm:px-0">
            <TabsContent value="all" className="space-y-2 mt-2">
              {operations.map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                  onEdit={undefined}
                  onDelete={undefined}
                />
              ))}
              {operations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune opération trouvée</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="deposits" className="space-y-2 mt-2">
              {operations.filter(op => op.type === "deposit").map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                  onEdit={undefined}
                  onDelete={undefined}
                />
              ))}
              {operations.filter(op => op.type === "deposit").length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun versement trouvé</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="withdrawals" className="space-y-2 mt-2">
              {operations.filter(op => op.type === "withdrawal").map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                  onEdit={undefined}
                  onDelete={undefined}
                />
              ))}
              {operations.filter(op => op.type === "withdrawal").length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun retrait trouvé</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transfers" className="space-y-2 mt-2">
              {operations.filter(op => op.type === "transfer").map((operation) => (
                <OperationCard
                  key={operation.id}
                  operation={operation}
                  onEdit={undefined}
                  onDelete={undefined}
                />
              ))}
              {operations.filter(op => op.type === "transfer").length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun virement trouvé</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
