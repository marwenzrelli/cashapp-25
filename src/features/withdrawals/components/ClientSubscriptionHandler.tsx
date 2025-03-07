
import React, { useEffect } from "react";
import { useClientSubscription } from "./useClientSubscription";
import { useClients } from "@/features/clients/hooks/useClients";

interface ClientSubscriptionHandlerProps {
  isAuthenticated: boolean | null;
}

export const ClientSubscriptionHandler: React.FC<ClientSubscriptionHandlerProps> = ({ 
  isAuthenticated 
}) => {
  const { fetchClients } = useClients();

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients().catch(err => {
        console.error("Error fetching clients:", err);
      });
    }
  }, [isAuthenticated, fetchClients]);

  // Subscribe to real-time client updates
  useClientSubscription({ fetchClients });
  
  return null; // This is a logic-only component, it doesn't render anything
};
