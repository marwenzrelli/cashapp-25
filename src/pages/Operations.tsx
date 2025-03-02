
import { useState } from "react";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { Button } from "@/components/ui/button";
import { Printer, DownloadIcon, ArrowUpCircle, ArrowDownCircle, RefreshCcw, User, Hash, FileText, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { DateRange } from "react-day-picker";
import { formatDateTime } from "@/features/operations/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getTypeStyle, getTypeIcon, getTypeLabel } from "@/features/operations/utils/operation-helpers";
import { Operation } from "@/features/operations/types";

const Operations = () => {
  const { 
    operations, 
    isLoading, 
    deleteOperation, 
    showDeleteDialog, 
    setShowDeleteDialog, 
    confirmDeleteOperation,
    operationToDelete
  } = useOperations();
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredOperations = operations.filter((op) => {
    const matchesType = !filterType || op.type === filterType;
    const matchesClient =
      !filterClient ||
      op.fromClient?.toLowerCase().includes(filterClient.toLowerCase()) ||
      op.toClient?.toLowerCase().includes(filterClient.toLowerCase());
    const matchesDate =
      (!dateRange?.from ||
        new Date(op.date) >= new Date(dateRange.from)) &&
      (!dateRange?.to ||
        new Date(op.date) <= new Date(dateRange.to));
    return matchesType && matchesClient && matchesDate;
  });

  // Assurons-nous que chaque opération a sa date formatée correctement
  const operationsWithFormattedDates = filteredOperations.map(op => ({
    ...op,
    formattedDate: formatDateTime(op.date)
  }));

  // Function to generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Rapport des opérations", 14, 22);
    
    // Add filters information
    doc.setFontSize(10);
    let filterText = "Filtres appliqués: ";
    filterText += filterType ? `Type: ${filterType}, ` : "";
    filterText += filterClient ? `Client: ${filterClient}, ` : "";
    filterText += dateRange?.from ? `Du: ${dateRange.from.toLocaleDateString()}, ` : "";
    filterText += dateRange?.to ? `Au: ${dateRange.to.toLocaleDateString()}, ` : "";
    filterText = filterText.endsWith(", ") ? filterText.slice(0, -2) : filterText;
    filterText = filterText === "Filtres appliqués: " ? "Aucun filtre appliqué" : filterText;
    
    doc.text(filterText, 14, 30);
    
    // Prepare data for the table
    const tableData = filteredOperations.map(op => [
      new Date(op.date).toLocaleDateString(),
      op.type === "deposit" ? "Versement" : op.type === "withdrawal" ? "Retrait" : "Virement",
      op.fromClient,
      op.toClient || "-",
      op.description,
      `${op.amount.toLocaleString()} TND`
    ]);
    
    // Add table
    (doc as any).autoTable({
      startY: 35,
      head: [['Date', 'Type', 'De', 'Vers', 'Description', 'Montant']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 8 }
    });
    
    // Save the PDF
    doc.save("operations-report.pdf");
  };

  // Wrapper for confirmDeleteOperation to match the expected signature
  const handleDeleteOperation = async (id: string | number) => {
    await confirmDeleteOperation();
    return true; // Return true to indicate successful deletion
  };

  const getAmountColor = (type: Operation["type"]) => {
    switch (type) {
      case "deposit":
        return "text-green-600 dark:text-green-400";
      case "withdrawal":
        return "text-red-600 dark:text-red-400";
      case "transfer":
        return "text-purple-600 dark:text-purple-400";
    }
  };

  // Format transaction ID to 6 digits
  const formatOperationId = (id: string) => {
    // If the ID is numeric or can be converted to a number
    if (!isNaN(Number(id))) {
      // Pad with leading zeros to get 6 digits
      return id.padStart(6, '0');
    }
    
    // For UUID format, take first 6 characters
    return id.slice(0, 6);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Opérations</h1>
          <p className="text-muted-foreground">
            Gérez et visualisez toutes les opérations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={generatePDF} className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter en PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimer</span>
            <span className="sm:hidden">Imprimer</span>
          </Button>
        </div>
      </div>

      <OperationFilters
        type={filterType}
        setType={setFilterType}
        client={filterClient}
        setClient={setFilterClient}
        date={dateRange}
        setDate={setDateRange}
      />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : operationsWithFormattedDates.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Aucune opération trouvée</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des opérations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table pour la vue desktop */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Client(s)</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operationsWithFormattedDates.map((operation) => (
                    <TableRow key={`${operation.type}-${operation.id}`} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                            {getTypeIcon(operation.type)}
                          </div>
                          <span>{getTypeLabel(operation.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{formatOperationId(operation.id)}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {operation.formattedDate}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {operation.description}
                      </TableCell>
                      <TableCell>
                        {operation.type === "transfer" ? (
                          <div className="flex flex-col">
                            <span className="text-sm flex items-center gap-1"><User className="h-3 w-3" /> De: {operation.fromClient}</span>
                            <span className="text-sm flex items-center gap-1"><User className="h-3 w-3" /> À: {operation.toClient}</span>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {operation.fromClient}</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getAmountColor(operation.type)}`}>
                        {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount).toLocaleString()} TND
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteOperation(operation)}
                          className="h-8 w-8 relative hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Liste pour mobile */}
            <div className="md:hidden divide-y">
              {operationsWithFormattedDates.map((operation) => (
                <div key={`${operation.type}-${operation.id}`} className="p-4 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getTypeStyle(operation.type)}`}>
                        {getTypeIcon(operation.type)}
                      </div>
                      <span className="font-medium">{getTypeLabel(operation.type)}</span>
                      <span className="text-xs text-muted-foreground">#{formatOperationId(operation.id)}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {operation.formattedDate}
                    </p>
                    
                    <p className="mb-1 truncate">{operation.description}</p>
                    
                    <div className="text-xs text-muted-foreground">
                      {operation.type === "transfer" ? (
                        <>
                          <div className="flex items-center gap-1"><User className="h-3 w-3" /> De: {operation.fromClient}</div>
                          <div className="flex items-center gap-1"><User className="h-3 w-3" /> À: {operation.toClient}</div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1"><User className="h-3 w-3" /> {operation.fromClient}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`font-semibold whitespace-nowrap ${getAmountColor(operation.type)}`}>
                      {operation.type === "withdrawal" ? "-" : ""}{Math.round(operation.amount).toLocaleString()} TND
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOperation(operation)}
                      className="h-8 w-8 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <DeleteOperationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={handleDeleteOperation}
        operation={operationToDelete}
      />
    </div>
  );
};

export default Operations;

