
import { useEffect } from "react";
import { Operation } from "@/features/operations/types";
import { useParams } from "react-router-dom";

/**
 * A hook for debugging operations-related issues
 */
export const useOperationsLogs = (operations: Operation[]) => {
  const { id } = useParams();
  const clientId = id ? parseInt(id, 10) : null;
  
  useEffect(() => {
    // Only log for client with ID 4 (the one with issues)
    if (clientId === 4 && operations) {
      console.log(`Client ID 4: Loaded ${operations.length} operations`);
      
      // Check for specific operation IDs that were reported missing
      const missingIds = ['72', '73', '74', '75', '76', '77', '78'];
      
      // Find operations with these IDs
      const foundOperations = operations.filter(op => 
        missingIds.includes(op.id.toString())
      );
      
      console.log(`Found ${foundOperations.length} of the previously missing operations: ${foundOperations.map(op => op.id).join(', ')}`);
      
      if (foundOperations.length > 0) {
        foundOperations.forEach(op => {
          console.log(`Found operation ${op.id}: ${op.type}, ${op.fromClient} -> ${op.toClient || 'N/A'}, Amount: ${op.amount}, Date: ${op.operation_date || op.date}`);
        });
      } else {
        console.log("Missing operations still not found in the current data set");
        
        // Additional logging to understand filtering issues
        console.log("Operations with IDs in the 70s range:", operations.filter(op => {
          const numId = parseInt(op.id.toString(), 10);
          return numId >= 70 && numId < 80;
        }).map(op => `${op.id} (${op.type})`));
      }
      
      // Check what types of operations we have
      const depositCount = operations.filter(op => op.type === "deposit").length;
      const withdrawalCount = operations.filter(op => op.type === "withdrawal").length;
      const transferCount = operations.filter(op => op.type === "transfer").length;
      
      console.log(`Types breakdown: ${depositCount} deposits, ${withdrawalCount} withdrawals, ${transferCount} transfers`);
    }
  }, [operations, clientId]);
};
