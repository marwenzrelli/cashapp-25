
export interface DirectOperation {
  id: number;
  from_client_id: number;
  to_client_id: number;
  from_client_name: string;
  to_client_name: string;
  amount: number;
  operation_date: string;
  created_at: string;
  created_by?: string;
  notes?: string;
  status: string;
  operation_type: string;
}

export interface CreateDirectOperationData {
  from_client_id: number;
  to_client_id: number;
  from_client_name: string;
  to_client_name: string;
  amount: number;
  operation_date?: string;
  notes?: string;
}
