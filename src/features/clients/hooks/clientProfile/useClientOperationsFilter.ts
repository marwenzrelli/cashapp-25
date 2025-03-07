
import { useState, useEffect, useMemo } from 'react';
import { Client } from '@/features/clients/types';
import { Operation } from '@/features/operations/types';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

export const useClientOperationsFilter = (
  operations: Operation[],
  client: Client | null
) => {
  // State for filters
  const [selectedType, setSelectedType] = useState<"all" | "deposit" | "withdrawal" | "transfer">('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);

  // Get operations for this client
  const clientOperations = useMemo(() => {
    if (!client || !operations.length) {
      console.log("No client or operations data available", { client, operationsCount: operations.length });
      return [];
    }
    
    const clientFullName = `${client.prenom} ${client.nom}`.trim();
    console.log(`Filtering operations for client: "${clientFullName}"`, { 
      totalOperations: operations.length,
      clientId: client.id
    });
    
    // More flexible matching to handle variations in name format
    const matchesClient = (name: string | undefined) => {
      if (!name) return false;
      
      // Check for exact match
      if (name.toLowerCase() === clientFullName.toLowerCase()) return true;
      
      // Check if client name is part of the operation name (for partial matches)
      if (name.toLowerCase().includes(clientFullName.toLowerCase())) return true;
      
      // Check if operation name is part of client name (for partial matches)
      if (clientFullName.toLowerCase().includes(name.toLowerCase())) return true;
      
      return false;
    };
    
    const clientOps = operations.filter(operation => {
      // Check if this operation is related to the current client
      if (matchesClient(operation.fromClient)) {
        return true;
      } else if (operation.type === 'transfer' && matchesClient(operation.toClient)) {
        return true;
      }
      return false;
    });
    
    console.log(`Found ${clientOps.length} operations for client "${clientFullName}"`);
    return clientOps;
  }, [client, operations]);

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
      
      // Filter by date range
      if (dateRange.from && dateRange.to) {
        const opDate = new Date(op.date);
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        
        if (opDate < startDate || opDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [clientOperations, selectedType, searchTerm, dateRange]);

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
    setIsCustomRange
  };
};
