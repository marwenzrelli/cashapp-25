
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
  const [showAllDates, setShowAllDates] = useState<boolean>(true); // Default to true to show all dates

  // Get operations for this client only
  const clientOperations = useMemo(() => {
    if (!client) {
      return [];
    }
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim().toLowerCase();
    
    // Log for debugging specific client
    if (client.id === 4) {
      console.log(`Filtering operations for client ID 4 (${clientFullName}), total operations: ${operations.length}`);
      
      // Log transferring operations for this client
      const transfers = operations.filter(op => op.type === "transfer");
      console.log(`Total transfers before filtering: ${transfers.length}`);
      if (transfers.length > 0) {
        transfers.forEach(t => console.log(`Transfer #${t.id}: from ${t.fromClient} to ${t.toClient}, amount: ${t.amount}`));
      }
    }
    
    // Filter operations to only include those for this client
    return operations.filter(operation => {
      // Normalize names for comparison
      const fromClient = operation.fromClient?.toLowerCase().trim() || '';
      const toClient = operation.toClient?.toLowerCase().trim() || '';
      
      // For transfers, check both sides to ensure the operation is included
      if (operation.type === 'transfer') {
        const isInvolved = 
          fromClient.includes(clientFullName) || 
          clientFullName.includes(fromClient) ||
          toClient.includes(clientFullName) || 
          clientFullName.includes(toClient);
        
        // Debug log for client ID 4 transfers
        if (client.id === 4 && isInvolved) {
          console.log(`Including transfer #${operation.id} for client ${clientFullName}:`, 
                      `from: ${fromClient}, to: ${toClient}`);
        }
        
        return isInvolved;
      }
      
      // For other operation types
      const isFromClient = fromClient.includes(clientFullName) || clientFullName.includes(fromClient);
      return isFromClient;
    });
  }, [client, operations]);

  // Filter operations based on user selections
  const filteredOperations = useMemo(() => {
    if (!clientOperations.length) return [];
    
    // Debug logging for client ID 4
    if (client?.id === 4) {
      console.log(`Starting filter with ${clientOperations.length} operations for client ID 4`);
    }
    
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
      
      // Filter by date range only if not showing all dates
      if (!showAllDates && dateRange.from && dateRange.to) {
        const opDate = new Date(op.operation_date || op.date);
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        
        if (opDate < startDate || opDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [clientOperations, selectedType, searchTerm, dateRange, showAllDates, client?.id]);
  
  // Log specific information for client ID 4
  useEffect(() => {
    if (client?.id === 4) {
      console.log(`Filtered operations for client ID 4: ${filteredOperations.length}/${clientOperations.length}`);
      console.log("Filtered operation IDs:", filteredOperations.map(op => op.id).join(", "));
      
      // Check specifically for operations 72-78
      const missingIds = [72, 73, 74, 75, 76, 77, 78];
      const foundSpecificOperations = filteredOperations.filter(op => 
        missingIds.includes(parseInt(op.id.toString(), 10))
      );
      
      console.log(`Found ${foundSpecificOperations.length} of the specifically requested operations:`,
        foundSpecificOperations.map(op => op.id).join(', '));
    }
  }, [filteredOperations, clientOperations, client?.id]);

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
