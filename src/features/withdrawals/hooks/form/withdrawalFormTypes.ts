
import { Client } from "@/features/clients/types";
import { Withdrawal } from "@/features/withdrawals/types";

export interface ExtendedClient extends Client {
  dateCreation: string;
}

export interface UseWithdrawalFormStateProps {
  isOpen: boolean;
  clients: ExtendedClient[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  isEditing: boolean;
  selectedWithdrawal: Withdrawal | null;
}

export interface WithdrawalFormState {
  clientId: string;
  amount: string;
  notes: string;
  date: string;
}
