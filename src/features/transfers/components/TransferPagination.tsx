
import { FC } from "react";
import { ListFilter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TransferPaginationProps {
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  label?: string;
}

export const TransferPagination: FC<TransferPaginationProps> = ({
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  currentPage,
  setCurrentPage,
  label = "virements"
}) => {
  const totalPages = Math.ceil(totalItems / parseInt(itemsPerPage));
  const start = (currentPage - 1) * parseInt(itemsPerPage) + 1;
  const end = Math.min(currentPage * parseInt(itemsPerPage), totalItems);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="text-sm text-muted-foreground">
        Affichage de {totalItems > 0 ? `${start}-${end}` : '0'} sur {totalItems} {label}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="mx-2 text-sm">
            Page {currentPage} sur {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Select
          value={itemsPerPage}
          onValueChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
        >
          <SelectTrigger className="w-[150px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
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
  );
};
