import { format } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw, Calendar, FileText, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Operation } from "@/features/operations/types";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";

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
  const getAmountColor = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "text-green-600 dark:text-green-400";
      case "withdrawal":
        return "text-red-600 dark:text-red-400";
      case "transfer":
        return "text-green-600 dark:text-green-400";
      default:
        return "";
    }
  };

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
            {/* Desktop version */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Client</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                            {getTypeIcon(operation.type)}
                          </div>
                          <span>{getTypeLabel(operation.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                      <TableCell className={`text-right font-medium ${getAmountColor(operation.type)}`}>
                        {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount)} TND
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {operation.type === "transfer" ? (
                          <>{operation.fromClient} → {operation.toClient}</>
                        ) : (
                          operation.fromClient
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile version */}
            <div className="md:hidden space-y-3">
              {filteredOperations.map((operation) => (
                <div key={operation.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                        {getTypeIcon(operation.type)}
                      </div>
                      <span className="font-medium">{getTypeLabel(operation.type)}</span>
                    </div>
                    <span className="font-semibold">{Math.round(operation.amount)} TND</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {operation.type === "transfer" ? (
                        <span className="truncate">{operation.fromClient} → {operation.toClient}</span>
                      ) : (
                        <span className="truncate">{operation.fromClient}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{operation.description}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredOperations.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Aucune opération trouvée</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deposits">
            {/* Desktop version */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Client</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperations.filter(op => op.type === "deposit").map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                      <TableCell className="text-right font-medium text-green-600 dark:text-green-400">{Math.round(operation.amount)} TND</TableCell>
                      <TableCell className="max-w-[200px] truncate">{operation.fromClient}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile version */}
            <div className="md:hidden space-y-3">
              {filteredOperations.filter(op => op.type === "deposit").map((operation) => (
                <div key={operation.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                        {getTypeIcon(operation.type)}
                      </div>
                      <span className="font-medium">Versement</span>
                    </div>
                    <span className="font-semibold text-green-600">{Math.round(operation.amount)} TND</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span className="truncate">{operation.fromClient}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{operation.description}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredOperations.filter(op => op.type === "deposit").length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Aucun versement trouvé</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="withdrawals">
            {/* Desktop version */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Client</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperations.filter(op => op.type === "withdrawal").map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                      <TableCell className="text-right font-medium">{Math.round(operation.amount)} TND</TableCell>
                      <TableCell className="max-w-[200px] truncate">{operation.fromClient}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile version */}
            <div className="md:hidden space-y-3">
              {filteredOperations.filter(op => op.type === "withdrawal").map((operation) => (
                <div key={operation.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                        {getTypeIcon(operation.type)}
                      </div>
                      <span className="font-medium">Retrait</span>
                    </div>
                    <span className="font-semibold text-red-600">-{Math.round(operation.amount)} TND</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span className="truncate">{operation.fromClient}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{operation.description}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredOperations.filter(op => op.type === "withdrawal").length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Aucun retrait trouvé</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transfers">
            {/* Desktop version */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>À</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOperations.filter(op => op.type === "transfer").map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{operation.description}</TableCell>
                      <TableCell className="text-right font-medium">{Math.round(operation.amount)} TND</TableCell>
                      <TableCell className="max-w-[200px] truncate">{operation.fromClient}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{operation.toClient}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile version */}
            <div className="md:hidden space-y-3">
              {filteredOperations.filter(op => op.type === "transfer").map((operation) => (
                <div key={operation.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                        {getTypeIcon(operation.type)}
                      </div>
                      <span className="font-medium">Virement</span>
                    </div>
                    <span className="font-semibold text-purple-600">{Math.round(operation.amount)} TND</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(new Date(operation.date), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                      <User className="h-3.5 w-3.5" />
                      <span className="truncate">De: {operation.fromClient} • À: {operation.toClient}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{operation.description}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredOperations.filter(op => op.type === "transfer").length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Aucun virement trouvé</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
