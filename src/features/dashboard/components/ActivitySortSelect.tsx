
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SortOption } from "../types";
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpAZ, ArrowUpWideNarrow, Calendar, Clock, Users } from "lucide-react";

interface ActivitySortSelectProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
}

export const ActivitySortSelect = ({ value, onValueChange }: ActivitySortSelectProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Trier par:</span>
      <Select value={value} onValueChange={(val) => onValueChange(val as SortOption)}>
        <SelectTrigger className="w-[160px] h-8">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc" className="flex items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Plus récent</span>
            </div>
          </SelectItem>
          <SelectItem value="date-asc">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Plus ancien</span>
            </div>
          </SelectItem>
          <SelectItem value="amount-desc">
            <div className="flex items-center gap-2">
              <ArrowDownWideNarrow className="h-4 w-4" />
              <span>Montant (↓)</span>
            </div>
          </SelectItem>
          <SelectItem value="amount-asc">
            <div className="flex items-center gap-2">
              <ArrowUpWideNarrow className="h-4 w-4" />
              <span>Montant (↑)</span>
            </div>
          </SelectItem>
          <SelectItem value="type">
            <div className="flex items-center gap-2">
              <ArrowDownAZ className="h-4 w-4" />
              <span>Type</span>
            </div>
          </SelectItem>
          <SelectItem value="client">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Client</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
