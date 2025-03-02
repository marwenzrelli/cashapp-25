
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { Operation } from "../types";
import { DateRange } from "react-day-picker";

export const generatePDF = (
  filteredOperations: Operation[],
  filterType: string | null,
  filterClient: string,
  dateRange: DateRange | undefined
) => {
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
