
import { useState, useMemo } from "react";
import { Operation } from "../types";
import { DateRange } from "react-day-picker";

export const useOperationsFilter = (operations: Operation[]) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Filtrage ultra-optimisé avec limitation de résultats
  const filteredOperations = useMemo(() => {
    // Retourner les 100 premières opérations si aucun filtre n'est actif
    if (!filterType && !filterClient && !(dateRange?.from && dateRange?.to)) {
      return operations.slice(0, 100).map(op => ({
        ...op,
        formattedDate: op.formattedDate || new Date(op.operation_date || op.date).toLocaleDateString('fr-FR')
      }));
    }
    
    // Appliquer les filtres avec limite de résultats
    const result = [];
    const maxResults = 100;
    
    for (const op of operations) {
      // Vérification de type - le plus rapide en premier
      if (filterType && op.type !== filterType) continue;
      
      // Recherche par client
      if (filterClient) {
        const searchTerm = filterClient.toLowerCase();
        const fromClient = (op.fromClient || '').toLowerCase();
        const toClient = (op.toClient || '').toLowerCase();
        const description = (op.description || '').toLowerCase();
        
        if (!fromClient.includes(searchTerm) && 
            !toClient.includes(searchTerm) && 
            !description.includes(searchTerm) &&
            !op.id.toString().includes(searchTerm)) {
          continue;
        }
      }
      
      // Filtre par date
      if (dateRange?.from && dateRange?.to) {
        const opDate = new Date(op.operation_date || op.date);
        if (opDate < dateRange.from || opDate > dateRange.to) {
          continue;
        }
      }
      
      // Ajouter l'opération si tous les filtres sont passés
      result.push({
        ...op,
        formattedDate: op.formattedDate || new Date(op.operation_date || op.date).toLocaleDateString('fr-FR')
      });
      
      // Limiter le nombre de résultats
      if (result.length >= maxResults) break;
    }
    
    return result;
  }, [operations, filterType, filterClient, dateRange]);

  return {
    filterType,
    setFilterType,
    filterClient,
    setFilterClient,
    dateRange,
    setDateRange,
    isFiltering: false, // Toujours false pour supprimer les indicateurs de chargement inutiles
    filteredOperations
  };
};
