
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ListFilter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SearchBarProps } from "../types";

export const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  onNewDeposit,
  totalDeposits 
}: SearchBarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recherche intelligente</CardTitle>
        <CardDescription>
          Trouvez rapidement un versement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom du client..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <Select
                value={itemsPerPage}
                onValueChange={onItemsPerPageChange}
              >
                <SelectTrigger className="w-full md:w-[180px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
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
              <div className="text-sm text-muted-foreground text-center md:text-left">
                {totalDeposits} résultats
              </div>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={onNewDeposit}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau versement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
