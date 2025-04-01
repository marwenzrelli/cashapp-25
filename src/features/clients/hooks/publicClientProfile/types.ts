
export interface ClientOperation {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  date: string;
  amount: number;
  description: string;
  status?: string;
  fromClient?: string;
  toClient?: string;
}

export interface PublicClientData {
  client: Client | null;
  operations: ClientOperation[];
  isLoading: boolean;
  error: string | null;
  loadingTime: number;
  isConnected: boolean; // Added this property
  fetchClientData: () => Promise<void>;
  retryFetch: () => void;
}

export interface TokenData {
  client_id: number;
  expires_at: string | null;
  created_at: string;
}
