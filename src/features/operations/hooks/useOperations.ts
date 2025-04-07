
import { useEffect, useCallback, useState, useRef } from "react";
import { Operation } from "../types";
import { useOperationsState } from "./useOperationsState";
import { useFetchOperations } from "./useFetchOperations";
import { useDeleteOperation } from "./useDeleteOperation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useOperations = () => {
  const {
    operations,
    setOperations,
    isLoading,
    setIsLoading,
    operationToDelete,
    setOperationToDelete,
    showDeleteDialog,
    setShowDeleteDialog
  } = useOperationsState();

  const { operations: fetchedOperations, isLoading: fetchLoading, error: fetchError, refreshOperations } = useFetchOperations();
  const { deleteOperation: deleteOperationLogic, confirmDeleteOperation: confirmDeleteOperationLogic } = useDeleteOperation(refreshOperations, setIsLoading);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const realtimeSubscribedRef = useRef(false);
  const channelRef = useRef<any>(null);
  const [subscriptionAttempts, setSubscriptionAttempts] = useState(0);
  const connectionCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local operations when fetchedOperations change
  useEffect(() => {
    if (fetchedOperations.length > 0) {
      console.log(`Updating operations state with ${fetchedOperations.length} operations`);
      setOperations(fetchedOperations);
      
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    } else if (!fetchLoading && initialLoadDone) {
      // Si le chargement est terminé mais qu'aucune opération n'a été trouvée
      console.log("No operations found after loading completed");
    }
  }, [fetchedOperations, fetchLoading, initialLoadDone, setOperations]);

  // Fonction pour dédupliquer des opérations basées sur leur ID
  const deduplicateOperations = (ops: Operation[]): Operation[] => {
    const uniqueOps = new Map<string, Operation>();
    
    for (const op of ops) {
      const uniqueId = `${op.type}-${op.id}`;
      if (!uniqueOps.has(uniqueId)) {
        uniqueOps.set(uniqueId, op);
      }
    }
    
    return Array.from(uniqueOps.values());
  };

  // Ensure initial load completes
  useEffect(() => {
    if (!initialLoadDone && !fetchLoading && fetchedOperations.length === 0) {
      // If we finished loading but have no operations, let's try one more time
      const timer = setTimeout(() => {
        console.log("No operations found after initial load, trying one more time");
        refreshOperations(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [initialLoadDone, fetchLoading, fetchedOperations.length, refreshOperations]);

  // Connection check timer to verify network connectivity
  useEffect(() => {
    // Setup periodic connection check
    connectionCheckTimerRef.current = setInterval(() => {
      if (!channelRef.current || subscriptionAttempts > 5) {
        console.log("Checking Supabase connection...");
        
        // Ping Supabase to check connection
        supabase.from('deposits').select('count').limit(1).then(
          () => {
            console.log("Supabase connection active");
            
            // If we have a lot of subscription attempts but no channel, retry subscription
            if (subscriptionAttempts > 5 && !channelRef.current) {
              console.log("Connection is working but no realtime subscription. Re-establishing...");
              setSubscriptionAttempts(0);
              
              // Remove any existing channel
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
                realtimeSubscribedRef.current = false;
              }
            }
          },
          (error) => {
            console.error("Supabase connection check failed:", error);
          }
        );
      }
    }, 30000); // Every 30 seconds
    
    return () => {
      if (connectionCheckTimerRef.current) {
        clearInterval(connectionCheckTimerRef.current);
      }
    };
  }, [subscriptionAttempts]);

  // Set up real-time subscription to operations with improved error handling
  useEffect(() => {
    // Nettoyage de la souscription précédente si elle existe
    if (channelRef.current) {
      console.log("Cleaning up previous realtime subscription");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      realtimeSubscribedRef.current = false;
    }
    
    if (realtimeSubscribedRef.current) return;
    
    try {
      console.log("Setting up realtime subscription for operations, attempt:", subscriptionAttempts + 1);
      setSubscriptionAttempts(prev => prev + 1);
      
      // Use a unique channel ID to prevent collisions
      const channelId = `operations-realtime-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const channel = supabase
        .channel(channelId)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'deposits'
        }, () => {
          console.log('Deposit change detected, refreshing operations');
          refreshOperations();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'withdrawals'
        }, () => {
          console.log('Withdrawal change detected, refreshing operations');
          refreshOperations();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'transfers'
        }, () => {
          console.log('Transfer change detected, refreshing operations');
          refreshOperations();
        })
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
          if (status === 'SUBSCRIBED') {
            realtimeSubscribedRef.current = true;
            channelRef.current = channel;
          } else if (status === 'CHANNEL_ERROR') {
            console.error("Channel error occurred");
            realtimeSubscribedRef.current = false;
            
            // Don't immediately retry - wait for the next effect cycle
            setTimeout(() => {
              channelRef.current = null;
            }, 1000);
          }
        });
        
      // Si la souscription n'est pas établie après 8 secondes, considérer comme échec
      const timeout = setTimeout(() => {
        if (!realtimeSubscribedRef.current) {
          console.log("Realtime subscription timeout");
          
          if (channel) {
            supabase.removeChannel(channel);
          }
          
          // Only retry if we haven't made too many attempts
          if (subscriptionAttempts < 5) {
            console.log("Will retry subscription later");
          } else {
            console.log("Too many subscription attempts, pausing realtime features");
          }
        }
      }, 8000);
      
      return () => {
        clearTimeout(timeout);
        if (channel) {
          console.log("Cleaning up realtime subscription");
          supabase.removeChannel(channel);
          realtimeSubscribedRef.current = false;
          channelRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);
      realtimeSubscribedRef.current = false;
      return () => {};
    }
  }, [refreshOperations, subscriptionAttempts]);

  // Wrapper for delete operation to update state
  const deleteOperation = async (operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  };

  // Wrapper for confirm delete to pass the current operation to delete
  const confirmDeleteOperation = async () => {
    if (!operationToDelete) {
      console.error("No operation to delete");
      return;
    }
    await confirmDeleteOperationLogic(operationToDelete);
  };

  // Function to refresh operations with UI feedback
  const refreshOperationsWithFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      await refreshOperations(true);
      
      // Dédupliquer les opérations après rafraîchissement
      if (operations.length > 0) {
        const uniqueOperations = deduplicateOperations(operations);
        if (uniqueOperations.length !== operations.length) {
          console.log(`Dédupliqué ${operations.length - uniqueOperations.length} opérations au rafraîchissement`);
          setOperations(uniqueOperations);
        }
      }
      
      toast.success("Opérations actualisées");
    } catch (error) {
      console.error("Erreur lors de l'actualisation des opérations:", error);
      toast.error("Erreur lors de l'actualisation des opérations");
    } finally {
      setIsLoading(false);
    }
  }, [operations, refreshOperations, setIsLoading, setOperations]);

  // Check if we're in a stalled loading state
  useEffect(() => {
    let loadingTimer: NodeJS.Timeout;
    
    if (isLoading || fetchLoading) {
      loadingTimer = setTimeout(() => {
        if (isLoading || fetchLoading) {
          console.log("Loading operations is taking too long, attempting to recover");
          setIsLoading(false);
          
          // Don't auto-refresh here as it might cause an infinite loop
          // Just reset the loading state and let the user refresh manually
        }
      }, 15000); // If loading for more than 15 seconds, reset loading state
    }
    
    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [isLoading, fetchLoading, setIsLoading]);

  return {
    operations,
    isLoading: isLoading || fetchLoading,
    error: fetchError || dataError,
    fetchOperations: refreshOperations,
    refreshOperations: refreshOperationsWithFeedback,
    deleteOperation,
    showDeleteDialog,
    setShowDeleteDialog,
    confirmDeleteOperation,
    operationToDelete
  };
};
