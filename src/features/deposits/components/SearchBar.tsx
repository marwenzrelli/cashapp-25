import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ListFilter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type SearchBarProps } from "../types";
export const SearchBar = ({
  searchTerm,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalDeposits
}: SearchBarProps) => {
  return <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Rechercher un versement</CardTitle>
        <CardDescription>
          {totalDeposits} versement(s) trouvé(s)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom de client..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="pl-8" />
          </div>
        </div>
        
      </CardContent>
    </Card>;
};