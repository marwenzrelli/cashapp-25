
import { useState, useEffect, useMemo } from 'react';
import { Client } from '@/features/clients/types';
import { Operation } from '@/features/operations/types';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

export const useClientOperationsFilter = (
  operations: Operation[],
  client: Client | null
) => {
  // Define the union type for selectedType
  type OperationType = "all" | "deposit" | "withdrawal" | "transfer";
  
  // State for filters
  const [selectedType, setSelectedType] = useState<OperationType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);
  
  // Get client ID as a number
  const clientId = client ? (typeof client.id === 'string' ? parseInt(client.id, 10) : client.id) : null;
  
  // Special handling for pepsi men (client ID 4)
  const isPepsiMen = clientId === 4;
  
  // For pepsi men, always show all dates
  const [showAllDates, setShowAllDates] = useState<boolean>(isPepsiMen || true);
  
  // Ensure pepsi men always has showAllDates set to true
  useEffect(() => {
    if (isPepsiMen && !showAllDates) {
      setShowAllDates(true);
    }
  }, [isPepsiMen, showAllDates]);
  
  // Get operations for this client only
  const clientOperations = useMemo(() => {
    if (!client) {
      return [];
    }
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim().toLowerCase();
    
    console.log(`Filtering operations for client: ${clientFullName} (ID: ${clientId})`);
    
    // Special case for client ID 4 (pepsi men)
    if (clientId === 4) {
      // Log the operations count before filtering
      const allClientIdOps = operations.filter(op => 
        op.client_id === 4 || 
        (op.fromClient && op.fromClient.toLowerCase().includes('pepsi') && op.fromClient.toLowerCase().includes('men'))
      );
      
      console.log(`Total potential operations found for pepsi men: ${allClientIdOps.length}`);
      console.log(`Total potential withdrawals: ${allClientIdOps.filter(op => op.type === "withdrawal").length}`);
      
      const withdrawalIds = allClientIdOps
        .filter(op => op.type === "withdrawal")
        .map(op => op.id);
      
      console.log("All withdrawal IDs found for pepsi men:", withdrawalIds.join(", "));
      
      return allClientIdOps;
    }
    
    // Regular client filtering
    return operations.filter(operation => {
      // First check client_id if available
      if (operation.client_id !== undefined && operation.client_id === clientId) {
        return true;
      }
      
      // Fallback to name matching if client_id isn't available or doesn't match
      const fromClient = (operation.fromClient || '').toLowerCase().trim();
      const toClient = (operation.toClient || '').toLowerCase().trim();
      
      const isFromClient = fromClient.includes(clientFullName) || 
                         clientFullName.includes(fromClient) ||
                         fromClient === `${client.prenom.toLowerCase()} ${client.nom.toLowerCase()}`;
                        
      const isToClient = operation.type === 'transfer' && 
                      (toClient.includes(clientFullName) || 
                       clientFullName.includes(toClient) ||
                       toClient === `${client.prenom.toLowerCase()} ${client.nom.toLowerCase()}`);
      
      return isFromClient || isToClient;
    });
  }, [client, operations, clientId]);

  // Filter operations based on user selections
  const filteredOperations = useMemo(() => {
    if (!clientOperations.length) return [];
    
    return clientOperations.filter(op => {
      // Filter by type
      if (selectedType !== 'all' && op.type !== selectedType) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const descriptionMatch = op.description?.toLowerCase().includes(searchLower);
        const typeMatch = op.type.toLowerCase().includes(searchLower);
        const amountMatch = op.amount.toString().includes(searchLower);
        
        if (!(descriptionMatch || typeMatch || amountMatch)) {
          return false;
        }
      }
      
      // Filter by date range only if not showing all dates AND not pepsi men
      // For pepsi men, we never filter by date (always show all)
      if (!showAllDates && !isPepsiMen && dateRange.from && dateRange.to) {
        const opDate = new Date(op.operation_date || op.date);
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        
        if (opDate < startDate || opDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [clientOperations, selectedType, searchTerm, dateRange, showAllDates, isPepsiMen]);

  return {
    clientOperations,
    filteredOperations,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    isCustomRange,
    setIsCustomRange,
    showAllDates,
    setShowAllDates
  };
};
