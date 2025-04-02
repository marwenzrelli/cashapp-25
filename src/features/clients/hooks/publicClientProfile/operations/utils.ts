
import { ClientOperation } from "../types";

// Sort all operations by date (newest first)
export const sortOperationsByDate = (operations: ClientOperation[]): ClientOperation[] => {
  return [...operations].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
};

// Handle timeouts and network errors
export const createTimeoutController = (timeoutMs: number = 15000): { 
  controller: AbortController, 
  timeoutId: NodeJS.Timeout 
} => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort('Timeout');
  }, timeoutMs);
  
  return { controller, timeoutId };
};

// Format and handle errors
export const handleFetchError = (error: any): never => {
  console.error("Error fetching client operations:", error);
  
  if (error.message?.includes('AbortError') || error.name === 'AbortError') {
    throw new Error("Le délai d'attente pour charger les opérations a été dépassé. Vérifiez votre connexion internet.");
  }
  
  throw error;
};
