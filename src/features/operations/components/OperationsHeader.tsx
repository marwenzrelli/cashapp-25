
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Printer,
  RefreshCcw,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";

interface OperationsHeaderProps {
  onExportPDF: () => void;
  onPrint: () => void;
  onRefresh: () => void;
}

export const OperationsHeader = ({ 
  onExportPDF, 
  onPrint,
  onRefresh
}: OperationsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Opérations</h1>
        <p className="text-muted-foreground">
          Consultez et gérez toutes les opérations financières
        </p>
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={onRefresh}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={onExportPDF}
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter PDF
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={onPrint}
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="h-9"
          asChild
        >
          <Link to="/search">
            <Search className="h-4 w-4 mr-2" />
            Recherche avancée
          </Link>
        </Button>
      </div>
    </div>
  );
};
