
import { useState } from "react";
import { OperationCard } from "@/features/operations/components/OperationCard";
import { OperationFilters } from "@/features/operations/components/OperationFilters";
import { useOperations } from "@/features/operations/hooks/useOperations";
import { Button } from "@/components/ui/button";
import { Printer, DownloadIcon } from "lucide-react";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { DeleteOperationDialog } from "@/features/operations/components/DeleteOperationDialog";
import { DateRange } from "react-day-picker";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({});

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
      ) : filteredOperations.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Aucune opération trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
          {filteredOperations.map((operation) => (
            <OperationCard 
              key={`${operation.type}-${operation.id}`} 
              operation={operation}
              onDelete={() => deleteOperation(operation)}
            />
          ))}
        </div>
      )}
      
      <DeleteOperationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteOperation}
        operation={operationToDelete}
      />
    </div>
  );
};

export default Operations;
