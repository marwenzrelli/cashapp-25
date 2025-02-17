
import { FC } from "react";
import { ListFilter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransferPaginationProps {
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  totalTransfers: number;
}

export const TransferPagination: FC<TransferPaginationProps> = ({
  itemsPerPage,
  setItemsPerPage,
  totalTransfers,
}) => {
  return (
    <div className="flex items-center justify-end gap-4 mb-4">
      <div className="text-sm text-muted-foreground">
        Affichage de {Math.min(parseInt(itemsPerPage), totalTransfers)} sur {totalTransfers} virements
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
  );
};
