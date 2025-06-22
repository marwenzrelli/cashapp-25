
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
  console.log("PublicAccountFlowTab - Processing operations for client:", client?.prenom, client?.nom);
  console.log("PublicAccountFlowTab - Total operations received:", operations?.length || 0);

  // Use the same unified calculation logic as the main AccountFlowTab
  const processedOperations = useAccountFlowCalculations({ operations, client });
  
  console.log("PublicAccountFlowTab - Processed operations with balances:", processedOperations?.length || 0);
  
  const clientFullName = client ? `${client.prenom} ${client.nom}`.trim() : '';

  return (
    <Card className="mt-4">
      <AccountFlowMobileView 
        operations={processedOperations} 
        isPublicView={true} 
      />
      <AccountFlowDesktopTable 
        processedOperations={processedOperations} 
        clientFullName={clientFullName}
        isPublicView={true}
      />
    </Card>
  );
};
