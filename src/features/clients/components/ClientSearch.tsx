
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface ClientSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewClient: () => void;
}

export const ClientSearch = ({ searchTerm, onSearchChange, onNewClient }: ClientSearchProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recherche intelligente</CardTitle>
        <CardDescription>
          Trouvez rapidement vos clients avec la recherche contextuelle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={onNewClient}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
