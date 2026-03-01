
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch ALL rows from a Supabase table, bypassing the default 1000-row limit.
 * Uses .range() pagination to batch-fetch in chunks.
 */
export async function fetchAllRows<T = any>(
  table: string,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    batchSize?: number;
  }
): Promise<T[]> {
  const batchSize = options?.batchSize ?? 1000;
  const orderBy = options?.orderBy ?? 'operation_date';
  const ascending = options?.ascending ?? true;

  const allData: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await (supabase
      .from(table as any)
      .select('*')
      .order(orderBy, { ascending })
      .range(offset, offset + batchSize - 1) as any);

    if (error) throw error;

    if (data && data.length > 0) {
      allData.push(...(data as T[]));
      offset += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
}
