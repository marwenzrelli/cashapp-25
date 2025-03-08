
import { Deposit as ComponentDeposit } from "@/components/deposits/types";
import { Deposit as FeatureDeposit } from "@/features/deposits/types";

/**
 * Adapts deposits from the feature type to the component type
 * ensuring all required fields are present
 */
export const adaptDepositsForUI = (deposits: FeatureDeposit[] | any[]): ComponentDeposit[] => {
  return deposits.map(deposit => ({
    ...deposit,
    // Ensure description is always present (required in ComponentDeposit)
    description: deposit.description || deposit.notes || "",
    // Make sure all other required fields exist
    amount: typeof deposit.amount === 'number' ? deposit.amount : Number(deposit.amount) || 0,
    date: deposit.date || deposit.created_at || new Date().toISOString(),
    id: deposit.id || 0,
    client_name: deposit.client_name || "Unknown Client",
  }));
};
