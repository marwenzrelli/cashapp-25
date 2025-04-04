
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
  
  // Get client ID as a number
  const clientId = client ? (typeof client.id === 'string' ? parseInt(client.id, 10) : client.id) : null;
  
  // Get operations for this client only
  const clientOperations = useMemo(() => {
    if (!client || !clientId) {
      return [];
    }
    
    // Log clientId for debugging
    console.log(`Filtering operations for client ID: ${clientId}`);
    
    // Filter operations to only include those for this client based on client_id or name matching
    return operations.filter(op => {
      // First priority: Direct client_id matching if available
      if (op.client_id !== undefined && op.client_id === clientId) {
        return true;
      }
      
      // For operations without client_id, fall back to name matching
      if (op.client_id === undefined) {
        const clientFullName = `${client.prenom} ${client.nom}`.trim().toLowerCase();
        
        // Normalize names for comparison
        const fromClient = (op.fromClient || '').toLowerCase().trim();
        const toClient = (op.toClient || '').toLowerCase().trim();
        
        // Use exact name matching (not partial matching)
        const isFromClient = fromClient === clientFullName || 
                           fromClient === `${client.prenom.toLowerCase()} ${client.nom.toLowerCase()}`;
                        
        const isToClient = op.type === 'transfer' && 
                        (toClient === clientFullName || 
                         toClient === `${client.prenom.toLowerCase()} ${client.nom.toLowerCase()}`);
        
        return isFromClient || isToClient;
      }
      
      return false;
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
    setShowAllDates
  };
};
