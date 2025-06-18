
import { Client } from "@/features/clients/types";

export interface TokenData {
  client_id: number;
  access_token: string;
  expires_at?: string;
}

export interface ClientOperation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | "direct_transfer";
  date: string;
  amount: number;
  description: string;
  status?: string;
  fromClient?: string;
  toClient?: string;
  operation_date?: string;
}

export interface PublicClientData {
  client: Client | null;
  operations: ClientOperation[];
  isLoading: boolean;
  error: string | null;
  loadingTime: number;
  fetchClientData: () => Promise<void>;
  retryFetch: () => void;
}
