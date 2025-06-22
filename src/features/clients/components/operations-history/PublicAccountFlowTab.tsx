
import { Operation } from "@/features/operations/types";
import { Card } from "@/components/ui/card";
import { AccountFlowMobileView } from "./AccountFlowMobileView";
import { AccountFlowDesktopTable } from "./components/AccountFlowDesktopTable";
import { useAccountFlowCalculations } from "./hooks/useAccountFlowCalculations";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Show loading if we have operations but no processed operations yet and we have a valid client
  const isLoading = operations.length > 0 && processedOperations.length === 0 && client;

  if (isLoading) {
    return (
      <Card className="mt-4 w-full">
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-4 w-full">
      <Card className="w-full">
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
    </div>
  );
};
