
import { useState, useEffect, useMemo } from 'react';
import { Client } from '@/features/clients/types';
import { Operation } from '@/features/operations/types';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';

export const useClientOperationsFilter = (
  operations: Operation[],
  client: Client | null
) => {
  // State for filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 30),
    new Date()
  ]);
  const [isCustomRange, setIsCustomRange] = useState<boolean>(false);

  // Get operations for this client
  const clientOperations = useMemo(() => {
    if (!client || !operations.length) return [];
    
    const clientFullName = `${client.prenom} ${client.nom}`;
    
    return operations.filter(operation => {
      // Check if this operation is related to the current client
      if (operation.fromClient === clientFullName) {
        return true;
      } else if (operation.type === 'transfer' && operation.toClient === clientFullName) {
        return true;
      }
      return false;
    });
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
      if (dateRange[0] && dateRange[1]) {
        const opDate = new Date(op.date);
        const startDate = startOfDay(dateRange[0]);
        const endDate = endOfDay(dateRange[1]);
        
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
