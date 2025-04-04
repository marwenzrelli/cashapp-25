
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
  
  // Enhanced name matching function
  const matchesClientName = (operationName: string | undefined, clientFullName: string, firstName: string, lastName: string): boolean => {
    if (!operationName) return false;
    
    const opName = operationName.toLowerCase().trim();
    const normalizedClientName = clientFullName.toLowerCase().trim();
    const normalizedFirstName = firstName.toLowerCase().trim();
    const normalizedLastName = lastName.toLowerCase().trim();
    
    // Exact full name match
    if (opName === normalizedClientName) return true;
    
    // First name + last name match
    if (opName === `${normalizedFirstName} ${normalizedLastName}`) return true;
    
    // Last name + first name match (some systems might reverse)
    if (opName === `${normalizedLastName} ${normalizedFirstName}`) return true;
    
    // Contains both first and last name
    if (opName.includes(normalizedFirstName) && opName.includes(normalizedLastName)) return true;
    
    // Special case for pepsi men - more permissive matching
    if (isPepsiMen && (opName.includes('pepsi') && opName.includes('men'))) return true;
    
    return false;
  };
  
  // Get operations for this client only
  const clientOperations = useMemo(() => {
    if (!client) {
      return [];
    }
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim().toLowerCase();
    
    console.log(`Filtering operations for client: ${clientFullName} (ID: ${clientId})`);
    
    // Special case for client ID 4 (pepsi men)
    if (isPepsiMen) {
      // Log the operations count before filtering
      console.log("Using special pepsi men filtering logic");
      
      return operations.filter(op => 
        op.client_id === 4 || 
        (op.fromClient && op.fromClient.toLowerCase().includes('pepsi') && op.fromClient.toLowerCase().includes('men')) ||
        (op.toClient && op.toClient.toLowerCase().includes('pepsi') && op.toClient.toLowerCase().includes('men'))
      );
    }
    
    // Regular client filtering with improved name matching
    return operations.filter(operation => {
      // First check client_id if available
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
