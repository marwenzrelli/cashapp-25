
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicOperationsTabs } from "./operations-history/PublicOperationsTabs";
import { Client } from "../types";

interface PublicClientOperationsHistoryProps {
  operations: any[];
  client: Client; // Add client prop
}

export const PublicClientOperationsHistory = ({ 
  operations, 
  client 
}: PublicClientOperationsHistoryProps) => {
  console.log("PublicClientOperationsHistory - Total operations:", operations?.length || 0);
  console.log("PublicClientOperationsHistory - Client ID:", client?.id);
  console.log("PublicClientOperationsHistory - Is pepsi men:", client?.nom?.toLowerCase().includes('pepsi'));
  
  // Pour "pepsi men", on ne montre que ses propres opérations
  const shouldShowAllOperations = !client?.nom?.toLowerCase().includes('pepsi') || client?.id !== 2;
  console.log("PublicClientOperationsHistory - Show all operations:", shouldShowAllOperations);

  return (
    <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-950/50">
      <CardHeader>
        <CardTitle className="text-lg">Historique des opérations</CardTitle>
      </CardHeader>
      <CardContent>
        <PublicOperationsTabs operations={operations} client={client} />
      </CardContent>
    </Card>
  );
};
