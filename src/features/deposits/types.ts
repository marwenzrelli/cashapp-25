
import { Client } from "../clients/types";

export interface Deposit {
  id: number;
  amount: number;
  date: string;
  client_name: string;
  description?: string;
  status?: string;
  created_at?: string;
  created_by?: string | null;
  operation_date?: string;
  last_modified_at?: string | null;
}

export interface EditFormData {
  clientName: string;
  amount: string;
  notes: string;
  date: string;
  time: string;
}

export interface DeleteDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeposit: Deposit | null;
  onConfirm: () => Promise<boolean>;
}

export interface DepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onConfirm: (deposit: Deposit) => Promise<void>;
}
