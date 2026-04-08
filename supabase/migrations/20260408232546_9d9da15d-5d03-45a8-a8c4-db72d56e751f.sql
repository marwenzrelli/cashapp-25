
CREATE OR REPLACE FUNCTION public.recalculate_all_client_balances()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_record RECORD;
  total_deposits NUMERIC;
  total_withdrawals NUMERIC;
  total_transfers_received NUMERIC;
  total_transfers_sent NUMERIC;
  total_direct_received NUMERIC;
  total_direct_sent NUMERIC;
  new_balance NUMERIC;
  results JSON[];
  client_full_name TEXT;
  updated_count INT := 0;
BEGIN
  FOR client_record IN SELECT id, prenom, nom, solde FROM clients LOOP
    client_full_name := client_record.prenom || ' ' || client_record.nom;

    SELECT COALESCE(SUM(amount), 0) INTO total_deposits
    FROM deposits WHERE client_name = client_full_name AND status = 'completed';

    SELECT COALESCE(SUM(amount), 0) INTO total_withdrawals
    FROM withdrawals WHERE client_name = client_full_name AND status = 'completed';

    SELECT COALESCE(SUM(amount), 0) INTO total_transfers_received
    FROM transfers WHERE to_client = client_full_name AND status = 'completed';

    SELECT COALESCE(SUM(amount), 0) INTO total_transfers_sent
    FROM transfers WHERE from_client = client_full_name AND status = 'completed';

    SELECT COALESCE(SUM(amount), 0) INTO total_direct_received
    FROM direct_operations WHERE to_client_name = client_full_name AND status = 'completed';

    SELECT COALESCE(SUM(amount), 0) INTO total_direct_sent
    FROM direct_operations WHERE from_client_name = client_full_name AND status = 'completed';

    new_balance := total_deposits + total_transfers_received + total_direct_received
                 - total_withdrawals - total_transfers_sent - total_direct_sent;

    IF client_record.solde IS DISTINCT FROM ROUND(new_balance, 2) THEN
      UPDATE clients SET solde = ROUND(new_balance, 2) WHERE id = client_record.id;
      updated_count := updated_count + 1;
      results := array_append(results, json_build_object(
        'client', client_full_name,
        'old_balance', client_record.solde,
        'new_balance', ROUND(new_balance, 2),
        'deposits', total_deposits,
        'withdrawals', total_withdrawals,
        'transfers_in', total_transfers_received,
        'transfers_out', total_transfers_sent,
        'direct_in', total_direct_received,
        'direct_out', total_direct_sent
      ));
    END IF;
  END LOOP;

  RETURN json_build_object(
    'updated_count', updated_count,
    'details', COALESCE(array_to_json(results), '[]'::json)
  );
END;
$$;
