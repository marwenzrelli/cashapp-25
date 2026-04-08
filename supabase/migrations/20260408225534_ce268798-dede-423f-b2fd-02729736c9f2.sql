CREATE OR REPLACE FUNCTION public.get_monthly_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT json_agg(month_data ORDER BY month_start)
  FROM (
    SELECT
      gs.month_start,
      to_char(gs.month_start, 'Mon') AS month_label,
      COALESCE((SELECT SUM(amount) FROM deposits WHERE status = 'completed' AND operation_date >= gs.month_start AND operation_date < gs.month_start + interval '1 month'), 0) AS deposit_total,
      COALESCE((SELECT COUNT(*) FROM deposits WHERE status = 'completed' AND operation_date >= gs.month_start AND operation_date < gs.month_start + interval '1 month'), 0) AS deposit_count,
      COALESCE((SELECT SUM(amount) FROM withdrawals WHERE status = 'completed' AND operation_date >= gs.month_start AND operation_date < gs.month_start + interval '1 month'), 0) AS withdrawal_total,
      COALESCE((SELECT COUNT(*) FROM withdrawals WHERE status = 'completed' AND operation_date >= gs.month_start AND operation_date < gs.month_start + interval '1 month'), 0) AS withdrawal_count
    FROM generate_series(
      date_trunc('month', now()) - interval '5 months',
      date_trunc('month', now()),
      interval '1 month'
    ) AS gs(month_start)
  ) AS month_data;
$$;