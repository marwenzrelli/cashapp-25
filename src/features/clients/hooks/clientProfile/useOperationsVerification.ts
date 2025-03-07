
import { useEffect } from "react";
import { Client } from "@/features/clients/types";
import { Operation } from "@/features/operations/types";
import { checkClientOperations } from "../utils/checkClientOperations";

export const useOperationsVerification = (
  client: Client | null, 
  operations: Operation[], 
  clientOperations: Operation[],
  refreshClientBalance: () => Promise<void>
) => {
  // Verify operations if client is loaded but no operations are found
  useEffect(() => {
    const verifyClientOperations = async () => {
      if (client && operations.length > 0 && clientOperations.length === 0) {
        console.log("Client found but no matching operations. Checking operations...");
        const clientFullName = `${client.prenom} ${client.nom}`.trim();
        const opsCheck = await checkClientOperations(clientFullName, client.id);
        
        if (opsCheck.totalCount > 0) {
          console.log(`Found ${opsCheck.totalCount} operations in database, but no matches in memory. 
          This suggests a client name format mismatch.`);
          
          // Refresh client balance to ensure it's up-to-date
          await refreshClientBalance();
        }
      }
    };
    
    verifyClientOperations();
  }, [client, operations, clientOperations, refreshClientBalance]);
};
