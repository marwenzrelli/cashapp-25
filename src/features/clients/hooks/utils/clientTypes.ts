
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// Types pour les enregistrements de la base de données
export type DepositRecord = {
  client_name: string;
  amount: number;
  created_at: string;
  id: number;
  notes?: string;
  status: string;
};

export type WithdrawalRecord = {
  client_name: string;
  amount: number;
  created_at: string;
  id: string;
  notes?: string;
  status: string;
};

export type TransferRecord = {
  from_client: string;
  to_client: string;
  amount: number;
  created_at: string;
  id: string;
  reason: string;
  status: string;
};

// Types spécifiques pour les payloads de changement
export type DepositPayload = RealtimePostgresChangesPayload<DepositRecord>;
export type WithdrawalPayload = RealtimePostgresChangesPayload<WithdrawalRecord>;
export type TransferPayload = RealtimePostgresChangesPayload<TransferRecord>;
