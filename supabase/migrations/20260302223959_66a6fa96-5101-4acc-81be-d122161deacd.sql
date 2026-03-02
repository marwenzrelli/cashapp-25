CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'deposit_count', (SELECT COUNT(*) FROM deposits WHERE status = 'completed'),
    'deposit_total', (SELECT COALESCE(SUM(amount), 0) FROM deposits WHERE status = 'completed'),
    'withdrawal_count', (SELECT COUNT(*) FROM withdrawals WHERE status = 'completed'),
    'withdrawal_total', (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE status = 'completed'),
    'transfer_count', (SELECT COUNT(*) FROM transfers WHERE status = 'completed'),
    'transfer_total', (SELECT COALESCE(SUM(amount), 0) FROM transfers WHERE status = 'completed'),
    'direct_op_count', (SELECT COUNT(*) FROM direct_operations WHERE status = 'completed'),
    'direct_op_total', (SELECT COALESCE(SUM(amount), 0) FROM direct_operations WHERE status = 'completed'),
    'client_count', (SELECT COUNT(*) FROM clients WHERE status = 'active'),
    'total_balance', (SELECT COALESCE(SUM(solde), 0) FROM clients)
  );
$$;