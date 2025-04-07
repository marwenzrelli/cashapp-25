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
  const lastRealtimeUpdateRef = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local operations when fetchedOperations change
  useEffect(() => {
    if (fetchedOperations.length > 0) {
      console.log(`Updating operations state with ${fetchedOperations.length} operations`);
      setOperations(fetchedOperations);
      
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    } else if (!fetchLoading && initialLoadDone) {
      // If loading is complete but no operations were found, make sure to update state
      console.log("No operations found after loading completed");
      setOperations([]);
    }
  }, [fetchedOperations, fetchLoading, initialLoadDone, setOperations]);

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

  // Set up real-time subscription with improved error handling
  useEffect(() => {
    // Function to set up the realtime channel
    const setupRealtimeChannel = () => {
      if (realtimeSubscribedRef.current || channelRef.current) return;
      
      try {
        console.log("Setting up realtime subscription for operations");
        
        // Use a unique channel ID to prevent collisions
        const channelId = `operations-realtime-${Date.now()}`;
        
        const channel = supabase
          .channel(channelId)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'deposits'
          }, () => {
            console.log('Deposit change detected');
            handleRealtimeUpdate();
          })
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'withdrawals'
          }, () => {
            console.log('Withdrawal change detected');
            handleRealtimeUpdate();
          })
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'transfers'
          }, () => {
            console.log('Transfer change detected');
            handleRealtimeUpdate();
          })
          .subscribe((status) => {
            console.log(`Realtime subscription status: ${status}`);
            if (status === 'SUBSCRIBED') {
              realtimeSubscribedRef.current = true;
              channelRef.current = channel;
            } else if (status === 'CHANNEL_ERROR') {
              console.error("Channel error occurred");
              realtimeSubscribedRef.current = false;
              channelRef.current = null;
            }
          });
          
        return channel;
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        realtimeSubscribedRef.current = false;
        return null;
      }
    };
    
    // Set up the channel
    const channel = setupRealtimeChannel();
    
    // Cleanup function
    return () => {
      if (channel) {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
        realtimeSubscribedRef.current = false;
        channelRef.current = null;
      }
    };
  }, []);

  // Debounced handler for realtime updates
  const handleRealtimeUpdate = useCallback(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastRealtimeUpdateRef.current;
    
    // Debounce to prevent multiple refreshes in quick succession
    if (timeSinceLastUpdate < 2000) {
      console.log(`Debouncing realtime update, last update was ${timeSinceLastUpdate}ms ago`);
      
      // Clear any pending timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      // Set a new timeout to refresh after the debounce period
      refreshTimeoutRef.current = setTimeout(() => {
        console.log('Executing debounced refresh');
        refreshOperations(false); // Use false to not force refresh if not needed
        lastRealtimeUpdateRef.current = Date.now();
      }, 2000);
      
      return;
    }
    
    // If it's been more than 2 seconds since the last update, refresh immediately
    console.log('Refreshing operations due to realtime update');
    refreshOperations(false);
    lastRealtimeUpdateRef.current = now;
  }, [refreshOperations]);

  // Wrapper for delete operation to update state
  const deleteOperation = async (operation: Operation) => {
    setOperationToDelete(operation);
    setShowDeleteDialog(true);
  };

  // Wrapper for confirm delete to pass the current operation to delete
  const confirmDeleteOperation = async () => {
    if (!operationToDelete) {
      console.error("No operation to delete");
      return false;
    }
    return await confirmDeleteOperationLogic(operationToDelete);
  };

  // Function to refresh operations with UI feedback
  const refreshOperationsWithFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      await refreshOperations(true);
      toast.success("Opérations actualisées");
    } catch (error) {
      console.error("Erreur lors de l'actualisation des opérations:", error);
      toast.error("Erreur lors de l'actualisation des opérations");
    } finally {
      setIsLoading(false);
    }
  }, [refreshOperations, setIsLoading]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

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
