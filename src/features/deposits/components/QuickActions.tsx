
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
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>
          Créez un nouveau versement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={onCreateClick}
          className="w-full"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau versement
        </Button>
      </CardContent>
    </Card>
  );
};
