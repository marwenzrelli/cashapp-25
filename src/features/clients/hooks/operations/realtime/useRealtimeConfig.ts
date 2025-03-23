
import { useRef } from "react";

/**
 * Hook providing configuration values for realtime subscription
 */
export const useRealtimeConfig = () => {
  // Configuration constants
  const maxReconnectAttempts = 5;
  const reconnectBackoffMs = 2000; // Start with 2s
  const throttleTimeMs = 2000;

  // Reference to throttle timeout
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return {
    maxReconnectAttempts,
    reconnectBackoffMs,
    throttleTimeMs,
    throttleTimeoutRef
  };
};
