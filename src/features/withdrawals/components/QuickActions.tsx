
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ListFilter, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuickActionsProps {
  itemsPerPage?: string;
  setItemsPerPage?: (value: string) => void;
  withdrawalsCount?: number;
  onCreateClick: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  itemsPerPage = "10",
  setItemsPerPage = () => {},
  withdrawalsCount = 0,
  onCreateClick,
  searchQuery = "",
  setSearchQuery = () => {},
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un retrait..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={onCreateClick}
              size="sm"
              className="whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Nouveau
            </Button>
            <Select
              value={itemsPerPage}
              onValueChange={setItemsPerPage}
            >
              <SelectTrigger className="w-[110px] bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                <ListFilter className="h-3.5 w-3.5 mr-1.5 text-primary" />
                <SelectValue placeholder="Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 éléments</SelectItem>
                <SelectItem value="25">25 éléments</SelectItem>
                <SelectItem value="50">50 éléments</SelectItem>
                <SelectItem value="100">100 éléments</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground hidden md:block">
              {withdrawalsCount} résultats
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2 md:hidden">
          {withdrawalsCount} résultats trouvés
        </div>
      </CardContent>
    </Card>
  );
};
