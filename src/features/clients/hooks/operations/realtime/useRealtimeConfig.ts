
import { useRef } from "react";

export const useRealtimeConfig = () => {
  // Configuration settings for realtime connection
  const maxReconnectAttempts = 5; 
  const reconnectBackoffMs = 2000; // Start with 2 seconds and then use exponential backoff
  const throttleTimeMs = 2000; // Throttle time for refreshes
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialConnectionDelay = 1500; // Delay before first connection attempt

  return {
    maxReconnectAttempts,
    reconnectBackoffMs,
    throttleTimeMs,
    throttleTimeoutRef,
    initialConnectionDelay
  };
};
