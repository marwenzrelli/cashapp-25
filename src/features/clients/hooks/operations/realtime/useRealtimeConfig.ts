
import { useRef } from "react";

/**
 * Hook providing configuration values for realtime subscription
 */
export const useRealtimeConfig = () => {
  // Configuration constants - reducing values to minimize UI disruption
  const maxReconnectAttempts = 2; // Reduced from 3 to 2
  const reconnectBackoffMs = 8000; // Increased from 5s to 8s
  const throttleTimeMs = 5000; // Increased from 3s to 5s
  const initialConnectionDelay = 1000; // Add delay before first connection attempt

  // Reference to throttle timeout
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return {
    maxReconnectAttempts,
    reconnectBackoffMs,
    throttleTimeMs,
    throttleTimeoutRef,
    initialConnectionDelay
  };
};
