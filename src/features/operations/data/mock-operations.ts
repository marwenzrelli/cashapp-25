
// Mock data for operations when Supabase is unavailable

export const mockDeposits = [
  {
    id: "mock-deposit-1",
    amount: 500,
    notes: "Versement initial",
    client_name: "Jean Dupont",
    client_id: "mock-client-1",
    status: "completed",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    created_by: "system",
    operation_date: new Date(Date.now() - 86400000).toISOString(),
    type: "deposit"
  },
  {
    id: "mock-deposit-2",
    amount: 1000,
    notes: "Versement mensuel",
    client_name: "Marie Martin",
    client_id: "mock-client-2",
    status: "completed",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    created_by: "system",
    operation_date: new Date(Date.now() - 172800000).toISOString(),
    type: "deposit"
  },
  {
    id: "mock-deposit-3",
    amount: 250,
    notes: "Dépôt de garantie",
    client_name: "Paul Bernard",
    client_id: "mock-client-3",
    status: "completed",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    created_by: "system",
    operation_date: new Date(Date.now() - 259200000).toISOString(),
    type: "deposit"
  }
];

export const mockWithdrawals = [
  {
    id: "mock-withdrawal-1",
    amount: 200,
    notes: "Retrait hebdomadaire",
    client_name: "Jean Dupont",
    client_id: "mock-client-1",
    status: "completed",
    created_at: new Date(Date.now() - 43200000).toISOString(),
    created_by: "system",
    operation_date: new Date(Date.now() - 43200000).toISOString(),
    type: "withdrawal"
  },
  {
    id: "mock-withdrawal-2",
    amount: 500,
    notes: "Remboursement frais",
    client_name: "Marie Martin",
    client_id: "mock-client-2",
    status: "completed",
    created_at: new Date(Date.now() - 129600000).toISOString(),
    created_by: "system",
    operation_date: new Date(Date.now() - 129600000).toISOString(),
    type: "withdrawal"
  }
];

export const mockTransfers = [
  {
    id: "mock-transfer-1",
    amount: 300,
    notes: "Transfert entre comptes",
    from_client_name: "Jean Dupont",
    from_client_id: "mock-client-1",
    to_client_name: "Marie Martin",
    to_client_id: "mock-client-2",
    status: "completed",
    created_at: new Date(Date.now() - 21600000).toISOString(),
    created_by: "system",
    operation_date: new Date(Date.now() - 21600000).toISOString(),
    type: "transfer"
  }
];
