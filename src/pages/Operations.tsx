
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter, Search, ListFilter } from "lucide-react";
import { toast } from "sonner";
import { format, isWithinInterval, parseISO, subDays, startOfDay, endOfDay } from "date-fns";
import { Operation } from "@/features/operations/types";
import { mockOperations } from "@/features/operations/data/mock-operations";
import { OperationCard } from "@/features/operations/components/OperationCard";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { EditOperationDialog } from "@/features/operations/components/EditOperationDialog";
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Operations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<Operation["type"] | "all">("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [operations, setOperations] = useState<Operation[]>(mockOperations);

  const handleEdit = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!selectedOperation) return;
    
    setOperations(prev => prev.map(op => 
      op.id === selectedOperation.id ? selectedOperation : op
    ));
    
    setIsEditDialogOpen(false);
    toast.success("Opération modifiée avec succès");
  };

  const handleConfirmDelete = () => {
    if (!selectedOperation) return;
    
    setOperations(prev => prev.filter(op => op.id !== selectedOperation.id));
    setIsDeleteDialogOpen(false);
    toast.success("Opération supprimée avec succès");
  };

  const filteredOperations = operations.filter(operation => {
    const operationDate = parseISO(operation.date);
    const matchesSearch = 
      operation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.fromClient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.toClient?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" ? true : operation.type === selectedType;
    
    const matchesDate = isWithinInterval(operationDate, {
      start: startOfDay(date.from),
      end: endOfDay(date.to)
    });

    return matchesSearch && matchesType && matchesDate;
  });

  const visibleOperations = filteredOperations.slice(0, parseInt(itemsPerPage));

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Recherche d'opérations</h1>
        <p className="text-muted-foreground">
          Consultez et gérez l'historique des versements, retraits et virements
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtres de recherche
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {Math.min(parseInt(itemsPerPage), filteredOperations.length)} sur {filteredOperations.length} opérations
              </div>
              <Select
                value={itemsPerPage}
                onValueChange={setItemsPerPage}
              >
                <SelectTrigger className="w-[180px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                  <ListFilter className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue placeholder="Nombre d'éléments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 éléments</SelectItem>
                  <SelectItem value="25">25 éléments</SelectItem>
                  <SelectItem value="50">50 éléments</SelectItem>
                  <SelectItem value="100">100 éléments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <OperationFilters
            selectedType={selectedType}
            searchTerm={searchTerm}
            date={date}
            isCustomRange={isCustomRange}
            onTypeSelect={setSelectedType}
            onSearch={setSearchTerm}
            onDateChange={setDate}
            onCustomRangeChange={setIsCustomRange}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleOperations.map((operation) => (
              <OperationCard
                key={operation.id}
                operation={operation}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {filteredOperations.length === 0 && (
              <div className="text-center py-12">
                <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Aucune opération trouvée</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Modifiez vos critères de recherche pour voir plus de résultats.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditOperationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        operation={selectedOperation}
        onOperationChange={setSelectedOperation}
        onConfirm={handleConfirmEdit}
      />

      <DeleteOperationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Operations;
