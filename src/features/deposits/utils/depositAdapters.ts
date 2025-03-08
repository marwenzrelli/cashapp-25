
import { Deposit } from "@/features/deposits/types";

/**
 * Adapts deposits from any source to ensure all required fields are present
 */
export const adaptDepositsForUI = (deposits: Deposit[] | any[]): Deposit[] => {
  if (!deposits || !Array.isArray(deposits)) {
    console.warn("Invalid deposits data passed to adapter:", deposits);
    return [];
  }
  
  return deposits.map(deposit => ({
    ...deposit,
    // Ensure description is always present
    description: deposit.description || deposit.notes || "",
    // Make sure all other required fields exist
    amount: typeof deposit.amount === 'number' ? deposit.amount : Number(deposit.amount) || 0,
    date: deposit.date || deposit.created_at || new Date().toISOString(),
    id: deposit.id || 0,
    client_name: deposit.client_name || "Unknown Client",
    status: deposit.status || "pending",
    created_at: deposit.created_at || new Date().toISOString(),
    created_by: deposit.created_by || null,
    operation_date: deposit.operation_date || null,
    last_modified_at: deposit.last_modified_at || null
  }));
};
