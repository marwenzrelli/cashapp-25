
import { supabase } from "@/integrations/supabase/client";
import { TransferRecord } from "./types";
import { ClientOperation } from "../types";

export const fetchOutgoingTransfers = async (clientName: string): Promise<TransferRecord[]> => {
  try {
    const fromClientResult = await supabase
      .from('transfers')
      .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
      .eq('from_client', clientName)
      .order('created_at', { ascending: false });
    
    if (fromClientResult.error) {
      console.error("Error in from-client transfers query:", fromClientResult.error);
      return [];
    }
    
    if (!fromClientResult.data) {
      return [];
    }

    // Map to proper typed records
    const fromClientData: TransferRecord[] = [];
    for (let i = 0; i < fromClientResult.data.length; i++) {
      const transfer: TransferRecord = {
        id: fromClientResult.data[i].id,
        amount: fromClientResult.data[i].amount,
        created_at: fromClientResult.data[i].created_at,
        reason: fromClientResult.data[i].reason,
        status: fromClientResult.data[i].status,
        from_client: fromClientResult.data[i].from_client,
        to_client: fromClientResult.data[i].to_client,
        operation_date: fromClientResult.data[i].operation_date
      };
      fromClientData.push(transfer);
    }
    
    return fromClientData;
  } catch (error) {
    console.error("Error fetching outgoing transfers:", error);
    return [];
  }
};

export const fetchIncomingTransfers = async (clientName: string): Promise<TransferRecord[]> => {
  try {
    const toClientResult = await supabase
      .from('transfers')
      .select('id, amount, created_at, reason, status, from_client, to_client, operation_date')
      .eq('to_client', clientName)
      .order('created_at', { ascending: false });
    
    if (toClientResult.error) {
      console.error("Error in to-client transfers query:", toClientResult.error);
      return [];
    }
    
    if (!toClientResult.data) {
      return [];
    }

    // Map to proper typed records
    const toClientData: TransferRecord[] = [];
    for (let i = 0; i < toClientResult.data.length; i++) {
      const transfer: TransferRecord = {
        id: toClientResult.data[i].id,
        amount: toClientResult.data[i].amount,
        created_at: toClientResult.data[i].created_at,
        reason: toClientResult.data[i].reason,
        status: toClientResult.data[i].status,
        from_client: toClientResult.data[i].from_client,
        to_client: toClientResult.data[i].to_client,
        operation_date: toClientResult.data[i].operation_date
      };
      toClientData.push(transfer);
    }
    
    return toClientData;
  } catch (error) {
    console.error("Error fetching incoming transfers:", error);
    return [];
  }
};

export const mapTransfersToOperations = (transfers: TransferRecord[], clientName: string): ClientOperation[] => {
  const operations: ClientOperation[] = [];
  
  for (let i = 0; i < transfers.length; i++) {
    const transfer = transfers[i];
    const isOutgoing = transfer.from_client === clientName;
    const otherClient = isOutgoing ? transfer.to_client : transfer.from_client;
    
    operations.push({
      id: transfer.id.toString(),
      type: 'transfer',
      date: transfer.created_at,
      amount: transfer.amount,
      description: transfer.reason || (isOutgoing ? `Transfert vers ${otherClient}` : `Transfert de ${otherClient}`),
      status: transfer.status,
      fromClient: isOutgoing ? clientName : otherClient,
      toClient: isOutgoing ? otherClient : clientName
    });
  }
  
  return operations;
};
