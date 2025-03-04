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
  return <Card>
      
      
    </Card>;
};