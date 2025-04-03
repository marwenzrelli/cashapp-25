
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
      const missingIds = [72, 73, 74, 75, 76, 77, 78];
      
      // Find operations with these IDs - enhance to check for the numeric ID within string IDs too
      const foundOperations = operations.filter(op => {
        if (typeof op.id === 'string' && op.id.includes('-')) {
          // For composite IDs like "withdrawal-72", extract the number
          const numericPart = op.id.split('-')[1];
          return numericPart && missingIds.includes(parseInt(numericPart, 10));
        }
        return missingIds.includes(parseInt(op.id.toString(), 10));
      });
      
      console.log(`Found ${foundOperations.length} of the previously missing operations: ${foundOperations.map(op => op.id).join(', ')}`);
      
      if (foundOperations.length > 0) {
        console.log("Found missing operations details:");
        foundOperations.forEach(op => {
          console.log(`Found operation ${op.id}: ${op.type}, client=${op.fromClient}, Amount: ${op.amount}, Date: ${op.operation_date || op.date}`);
        });
      } else {
        console.log("Missing operations still not found in the current data set");
        
        // Additional logging to understand filtering issues
        console.log("All operation IDs:", operations.map(op => op.id).join(", "));
        
        // Check operations in the 70s range - expand to check numeric parts of composite IDs
        console.log("Operations with IDs in the 70s range:", operations.filter(op => {
          let numId;
          if (typeof op.id === 'string' && op.id.includes('-')) {
            // Extract numeric part from composite IDs
            numId = parseInt(op.id.split('-')[1], 10);
          } else {
            numId = parseInt(op.id.toString(), 10);
          }
          return numId >= 70 && numId < 80;
        }).map(op => `${op.id} (${op.type})`));
        
        // Check withdrawals specifically
        const withdrawals = operations.filter(op => op.type === "withdrawal");
        console.log(`Total withdrawals: ${withdrawals.length}`);
        if (withdrawals.length > 0) {
          console.log("First 5 withdrawals:", withdrawals.slice(0, 5).map(w => 
            `${w.id} (${w.fromClient}, ${w.amount})`
          ));
        }
        
        // Log all withdrawals to see their client names
        console.log("All withdrawals client names:", withdrawals.map(w => w.fromClient));
        
        // Additional check for partial matching in case the client name is different
        const clientNameLower = "pepsi men".toLowerCase();
        const partialMatches = operations.filter(op => {
          const fromClientLower = (op.fromClient || "").toLowerCase();
          return op.type === "withdrawal" && 
                 (fromClientLower.includes("pepsi") || fromClientLower.includes("men"));
        });
        
        console.log(`Withdrawals with partial client name match: ${partialMatches.length}`, 
          partialMatches.map(op => `${op.id}: ${op.fromClient}`));
      }
      
      // Check what types of operations we have
      const depositCount = operations.filter(op => op.type === "deposit").length;
      const withdrawalCount = operations.filter(op => op.type === "withdrawal").length;
      const transferCount = operations.filter(op => op.type === "transfer").length;
      
      console.log(`Types breakdown: ${depositCount} deposits, ${withdrawalCount} withdrawals, ${transferCount} transfers`);
    }
  }, [operations, clientId]);
};
