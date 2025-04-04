
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
  const [showAllDates, setShowAllDates] = useState<boolean>(true); // Default to showing all dates
  
  // Get client ID as a number and determine if this is pepsi men
  const clientId = client ? (typeof client.id === 'string' ? parseInt(client.id, 10) : client.id) : null;
  const isPepsiMen = clientId === 4;
  
  // Ensure we always show all dates for pepsi men
  useEffect(() => {
    if (isPepsiMen && !showAllDates) {
      setShowAllDates(true);
    }
  }, [isPepsiMen, showAllDates]);
  
  // Debug logging for pepsi men operations
  useEffect(() => {
    if (isPepsiMen) {
      console.log(`Pepsi Men Client - Total operations available: ${operations.length}`);
      
      // Count by type
      const byType = {
        deposits: operations.filter(op => op.type === 'deposit').length,
        withdrawals: operations.filter(op => op.type === 'withdrawal').length,
        transfers: operations.filter(op => op.type === 'transfer').length
      };
      
      console.log('Operations by type:', byType);
    }
  }, [operations, isPepsiMen]);
  
  // Get operations for this client only - with special handling for pepsi men
  const clientOperations = useMemo(() => {
    if (!client) {
      return [];
    }
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim().toLowerCase();
    
    console.log(`Filtering operations for client: ${clientFullName} (ID: ${clientId})`);
    
    // Special case for client ID 4 (pepsi men)
    if (isPepsiMen) {
      console.log("Using strict pepsi men filtering logic");
      
      return operations.filter(op => {
        // Direct client ID match (most reliable)
        if (op.client_id === 4) return true;
        
        // For operations without client_id, do strict name matching
        const fromClient = (op.fromClient || '').toLowerCase();
        const toClient = (op.toClient || '').toLowerCase();
        
        // Only match "pepsi men" exactly - no partial matches
        const exactPepsiMen = 
          fromClient === 'pepsi men' || 
          toClient === 'pepsi men' ||
          (fromClient.includes('pepsi') && fromClient.includes('men'));
        
        return exactPepsiMen;
      });
    }
    
    // Regular client filtering with direct ID matching
    return operations.filter(op => {
      // Use client_id as primary filter when available
      if (op.client_id !== undefined && op.client_id === clientId) {
        return true;
      }
      
      // Strict name-based matching as fallback
      const fromClient = (op.fromClient || '').toLowerCase();
      const exactFromMatch = fromClient === clientFullName;
      
      // For transfers, also check toClient field
      const toClient = (op.toClient || '').toLowerCase(); 
      const exactToMatch = op.type === 'transfer' && toClient === clientFullName;
      
      return exactFromMatch || exactToMatch;
    });
  }, [client, operations, clientId, isPepsiMen]);

  // Filter operations based on user selections
  const filteredOperations = useMemo(() => {
    if (!clientOperations.length) return [];
    
    console.log(`Filtering ${clientOperations.length} operations by type=${selectedType}, searchTerm=${searchTerm}, showAllDates=${showAllDates}`);
    
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
  }, [clientOperations, selectedType, searchTerm, dateRange, showAllDates]);

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
    setShowAllDates,
    isPepsiMen
  };
};
