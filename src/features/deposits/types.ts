
export interface Deposit {
  id: number;
  amount: number;
  date: string;
  description: string;
  client_name: string;
  status: string;
  created_at: string;
  created_by: string | null;
  operation_date?: string;
  last_modified_at?: string; // New field to track modifications
}

export interface AISuggestion {
  id: string;
  message: string;
  amount: number;
  clientName: string;
}

export interface EditFormData {
  clientName: string;
  amount: string;
  notes: string;
  date?: string;
  time?: string;
  clientBalance?: string;
}

export interface DeleteDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeposit: Deposit | null;
  onConfirm: () => Promise<boolean | void>;
}

// Add the missing types that were referenced in the error messages
export interface DepositDialogProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<boolean | void>;
  refreshClientBalance: () => Promise<boolean | void>;
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  itemsPerPage: string;
  onItemsPerPageChange: (value: string) => void;
  totalDeposits: number;
}

export interface StatsCardProps {
  deposits: Deposit[];
}
