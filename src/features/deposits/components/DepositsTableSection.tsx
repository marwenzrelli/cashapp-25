
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DepositsTable } from "@/features/deposits/components/DepositsTable";
import { type Deposit } from "@/components/deposits/types";

interface DepositsTableSectionProps {
  filteredDeposits: Deposit[];
  itemsPerPage: string;
  onEdit: (deposit: Deposit) => void;
  onDelete: (deposit: Deposit) => void;
}

export const DepositsTableSection = ({
  filteredDeposits,
  itemsPerPage,
  onEdit,
  onDelete
}: DepositsTableSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-primary" />
            Liste des versements
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Affichage de {Math.min(parseInt(itemsPerPage), filteredDeposits.length)} sur {filteredDeposits.length} versements
            </span>
          </div>
        </div>
        <CardDescription>
          Gérez les versements et accédez à leurs informations détaillées avec horodatage précis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DepositsTable
          deposits={filteredDeposits}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
};
