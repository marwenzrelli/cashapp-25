
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FilterSectionProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  clientFilter: string;
  setClientFilter: (filter: string) => void;
  transactionType: "all" | "deposits" | "withdrawals" | "transfers";
  setTransactionType: (type: "all" | "deposits" | "withdrawals" | "transfers") => void;
}

export const FilterSection = ({
  dateRange,
  setDateRange,
  clientFilter,
  setClientFilter,
  transactionType,
  setTransactionType
}: FilterSectionProps) => {
  const [showDatePicker, setShowDatePicker] = useState(true);

  const handlePeriodChange = (value: string) => {
    if (value === "all") {
      setDateRange(undefined);
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Période</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {showDatePicker ? "Période spécifique" : "Toute la période"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => handlePeriodChange("specific")}>
                    Période spécifique
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handlePeriodChange("all")}>
                    Toute la période
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {showDatePicker && (
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <Input
              placeholder="Rechercher un client..."
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de transaction</label>
            <Select 
              value={transactionType} 
              onValueChange={(value: "all" | "deposits" | "withdrawals" | "transfers") => 
                setTransactionType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les transactions</SelectItem>
                <SelectItem value="deposits">Versements</SelectItem>
                <SelectItem value="withdrawals">Retraits</SelectItem>
                <SelectItem value="transfers">Virements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
