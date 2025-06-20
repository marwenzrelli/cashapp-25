
import { Operation } from "@/features/operations/types";
import { Card } from "@/components/ui/card";
import { AccountFlowMobileView } from "./AccountFlowMobileView";
import { AccountFlowDesktopTable } from "./components/AccountFlowDesktopTable";
import { useAccountFlowCalculations } from "./hooks/useAccountFlowCalculations";

interface PublicAccountFlowTabProps {
  operations: Operation[];
  client?: any;
}

export const PublicAccountFlowTab = ({
  operations,
  client
}: PublicAccountFlowTabProps) => {
  const processedOperations = useAccountFlowCalculations({ operations, client });
  const clientFullName = client ? `${client.prenom} ${client.nom}`.trim() : '';

  return (
    <Card className="mt-4">
      <AccountFlowMobileView operations={processedOperations} isPublicView={true} />
      <AccountFlowDesktopTable 
        processedOperations={processedOperations} 
        clientFullName={clientFullName} 
      />
    </Card>
  );
};
