
import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { DateRange } from "react-day-picker";

interface ClientOperationsHistoryProps {
  operations: Operation[];
  selectedType: Operation["type"] | "all";
  setSelectedType: (type: Operation["type"] | "all") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  filteredOperations: Operation[];
}

export const ClientOperationsHistory = ({
  operations,
  selectedType,
  setSelectedType,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  filteredOperations,
}: ClientOperationsHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des opérations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <OperationFilters
            type={selectedType as any}
            setType={setSelectedType as any}
            client={searchTerm}
            setClient={setSearchTerm}
            date={dateRange}
            setDate={setDateRange}
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 flex flex-wrap gap-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              Toutes les opérations
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Versements
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              Retraits
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Virements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="rounded-md border">
              <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
                <div>Type</div>
                <div>Date</div>
                <div>Description</div>
                <div className="text-right">Montant</div>
                <div>Client</div>
              </div>
              {filteredOperations.map((operation) => (
                <div key={operation.id} className="grid grid-cols-5 gap-4 p-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                      {getTypeIcon(operation.type)}
                    </div>
                    <span>{getTypeLabel(operation.type)}</span>
                  </div>
                  <div>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</div>
                  <div className="truncate">{operation.description}</div>
                  <div className="text-right font-medium">{Math.round(operation.amount)} TND</div>
                  <div className="truncate">
                    {operation.type === "transfer" ? (
                      <>{operation.fromClient} → {operation.toClient}</>
                    ) : (
                      operation.fromClient
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deposits">
            <div className="rounded-md border">
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
                <div>Date</div>
                <div>Description</div>
                <div className="text-right">Montant</div>
                <div>Client</div>
              </div>
              {filteredOperations.filter(op => op.type === "deposit").map((operation) => (
                <div key={operation.id} className="grid grid-cols-4 gap-4 p-4 border-t">
                  <div>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</div>
                  <div className="truncate">{operation.description}</div>
                  <div className="text-right font-medium">{Math.round(operation.amount)} TND</div>
                  <div className="truncate">{operation.fromClient}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="withdrawals">
            <div className="rounded-md border">
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
                <div>Date</div>
                <div>Description</div>
                <div className="text-right">Montant</div>
                <div>Client</div>
              </div>
              {filteredOperations.filter(op => op.type === "withdrawal").map((operation) => (
                <div key={operation.id} className="grid grid-cols-4 gap-4 p-4 border-t">
                  <div>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</div>
                  <div className="truncate">{operation.description}</div>
                  <div className="text-right font-medium">{Math.round(operation.amount)} TND</div>
                  <div className="truncate">{operation.fromClient}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transfers">
            <div className="rounded-md border">
              <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
                <div>Date</div>
                <div>Description</div>
                <div className="text-right">Montant</div>
                <div>De</div>
                <div>À</div>
              </div>
              {filteredOperations.filter(op => op.type === "transfer").map((operation) => (
                <div key={operation.id} className="grid grid-cols-5 gap-4 p-4 border-t">
                  <div>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</div>
                  <div className="truncate">{operation.description}</div>
                  <div className="text-right font-medium">{Math.round(operation.amount)} TND</div>
                  <div className="truncate">{operation.fromClient}</div>
                  <div className="truncate">{operation.toClient}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Helper functions for operation types
export const getTypeStyle = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "bg-green-50 text-green-600 dark:bg-green-950/50";
    case "withdrawal":
      return "bg-red-50 text-red-600 dark:bg-red-950/50";
    case "transfer":
      return "bg-purple-50 text-purple-600 dark:bg-purple-950/50";
  }
};

export const getTypeIcon = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return <ArrowUpCircle className="h-4 w-4" />;
    case "withdrawal":
      return <ArrowDownCircle className="h-4 w-4" />;
    case "transfer":
      return <RefreshCcw className="h-4 w-4" />;
  }
};

export const getTypeLabel = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "Versement";
    case "withdrawal":
      return "Retrait";
    case "transfer":
      return "Virement";
  }
};
