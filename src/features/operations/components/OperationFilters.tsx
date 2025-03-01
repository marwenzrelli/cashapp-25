
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Operation } from "@/features/operations/types";
import { DateRange } from "react-day-picker";

interface OperationFiltersProps {
  type: string | null;
  setType: (type: string | null) => void;
  client: string;
  setClient: (client: string) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const OperationFilters = ({
  type,
  setType,
  client,
  setClient,
  date,
  setDate,
}: OperationFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <Input
            placeholder="Rechercher par client..."
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={type || ""} onValueChange={(value) => setType(value === "" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type d'opération" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les opérations</SelectItem>
              <SelectItem value="deposit">Versements</SelectItem>
              <SelectItem value="withdrawal">Retraits</SelectItem>
              <SelectItem value="transfer">Virements</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DatePickerWithRange 
          date={date} 
          onDateChange={setDate} 
        />
      </div>
    </div>
  );
};
