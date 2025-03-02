
import { Button } from "@/components/ui/button";
import { Printer, DownloadIcon } from "lucide-react";

interface OperationsHeaderProps {
  onExportPDF: () => void;
  onPrint: () => void;
}

export const OperationsHeader = ({ onExportPDF, onPrint }: OperationsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Opérations</h1>
        <p className="text-muted-foreground">
          Gérez et visualisez toutes les opérations
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={onExportPDF} className="flex items-center gap-2">
          <DownloadIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Exporter en PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
        <Button variant="outline" onClick={onPrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Imprimer</span>
          <span className="sm:hidden">Imprimer</span>
        </Button>
      </div>
    </div>
  );
};
