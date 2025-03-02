
import { useState } from "react";
import { Operation } from "@/features/operations/types";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";
import { Client } from "@/features/clients/types";
import { containsPartialText } from "@/features/operations/utils/display-helpers";

export const useClientOperationsFilter = (operations: Operation[], client: Client | null) => {
  const [selectedType, setSelectedType] = useState<Operation["type"] | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  
  // Filter client operations
  const clientOperations = operations.filter(op => {
    if (client) {
      const clientFullName = `${client.prenom} ${client.nom}`;
      return op.fromClient === clientFullName || op.toClient === clientFullName;
    }
    return false;
  });

  // Apply filters
  const filteredOperations = clientOperations
    .filter(op => {
      if (!dateRange?.from || !dateRange?.to) return true;
      const operationDate = parseISO(op.date);
      return isWithinInterval(operationDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    })
    .filter(op => {
      if (selectedType === "all") return true;
      return op.type === selectedType;
    })
    .filter(op => {
      if (!searchTerm.trim()) return true;
      
      const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());
      
      return searchTerms.some(term => {
        // Chercher dans la description
        if (op.description && containsPartialText(op.description, term)) return true;
        
        // Chercher dans le fromClient (expéditeur)
        if (op.fromClient && containsPartialText(op.fromClient, term)) return true;
        
        // Chercher dans le toClient (destinataire)
        if (op.toClient && containsPartialText(op.toClient, term)) return true;
        
        // Chercher dans le montant
        if (op.amount.toString().includes(term)) return true;
        
        // Chercher dans l'ID
        if (op.id.toString().includes(term)) return true;
        
        return false;
      });
    });

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
