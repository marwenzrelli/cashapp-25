
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface QuickActionsProps {
  onCreateClick: () => void;
  itemsPerPage: string;
  setItemsPerPage: (value: string) => void;
  depositsCount: number;
}

export const QuickActions = ({
  onCreateClick,
  itemsPerPage,
  setItemsPerPage,
  depositsCount
}: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actions rapides</CardTitle>
        <CardDescription>
          Créez un nouveau versement rapidement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onCreateClick} 
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau versement
        </Button>
      </CardContent>
    </Card>
  );
};
