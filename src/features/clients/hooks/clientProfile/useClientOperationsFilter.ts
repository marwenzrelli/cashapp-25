
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
      
      // List all operation IDs for debugging
      const allIds = operations.map(op => `${op.type}-${op.id}`).join(', ');
      console.log(`All operation IDs: ${allIds}`);
    }
  }, [operations, isPepsiMen]);
  
  // Enhanced name matching function with more permissive matching for pepsi men
  const matchesClientName = (operationName: string | undefined, clientFullName: string, firstName: string, lastName: string): boolean => {
    if (!operationName) return false;
    
    const opName = operationName.toLowerCase().trim();
    const normalizedClientName = clientFullName.toLowerCase().trim();
    const normalizedFirstName = firstName.toLowerCase().trim();
    const normalizedLastName = lastName.toLowerCase().trim();
    
    // Special case for pepsi men - extremely permissive matching
    if (isPepsiMen) {
      return opName.includes('pepsi') || opName.includes('men') || 
             opName.includes('pepsi men') || opName.includes('pepsi-men') ||
             opName === 'pepsi' || opName === 'men';
    }
    
    // Regular matching for other clients
    // Exact full name match
    if (opName === normalizedClientName) return true;
    
    // First name + last name match
    if (opName === `${normalizedFirstName} ${normalizedLastName}`) return true;
    
    // Last name + first name match (some systems might reverse)
    if (opName === `${normalizedLastName} ${normalizedFirstName}`) return true;
    
    // Contains both first and last name
    if (opName.includes(normalizedFirstName) && opName.includes(normalizedLastName)) return true;
    
    return false;
  };
  
  // Get operations for this client only - with special handling for pepsi men
  const clientOperations = useMemo(() => {
    if (!client) {
      return [];
    }
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim().toLowerCase();
    
    console.log(`Filtering operations for client: ${clientFullName} (ID: ${clientId})`);
    console.log(`Total operations before filtering: ${operations.length}`);
    
    // Special case for client ID 4 (pepsi men) - extremely permissive matching
    if (isPepsiMen) {
      console.log("Using super-permissive pepsi men filtering logic");
      
      const pepsiOps = operations.filter(op => {
        // Direct client ID match (most reliable)
        if (op.client_id === 4) return true;
        
        // Name-based matching (any variation of pepsi/men in any field)
        const fromClient = (op.fromClient || '').toLowerCase();
        const toClient = (op.toClient || '').toLowerCase();
        const desc = (op.description || '').toLowerCase();
        
        const hasPepsi = fromClient.includes('pepsi') || toClient.includes('pepsi') || desc.includes('pepsi');
        const hasMen = fromClient.includes('men') || toClient.includes('men') || desc.includes('men');
        
        return hasPepsi || hasMen;
      });
      
      console.log(`Pepsi men operations found: ${pepsiOps.length}`);
      return pepsiOps;
    }
    
    // Regular client filtering with improved name matching
    return operations.filter(operation => {
      // First check client_id if available (most reliable method)
      if (operation.client_id !== undefined && operation.client_id === clientId) {
        return true;
      }
      
      // Name-based matching as fallback
      const isFromClient = matchesClientName(operation.fromClient, clientFullName, client.prenom, client.nom);
                        
      const isToClient = operation.type === 'transfer' && 
                        matchesClientName(operation.toClient, clientFullName, client.prenom, client.nom);
      
      return isFromClient || isToClient;
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
