
import { useRef } from "react";

/**
 * Hook providing configuration values for realtime subscription
 */
export const useRealtimeConfig = () => {
  // Configuration constants
  const maxReconnectAttempts = 3; // Reduced from 5 to 3
  const reconnectBackoffMs = 5000; // Increased from 2s to 5s
  const throttleTimeMs = 3000; // Increased from 2s to 3s

  // Reference to throttle timeout
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return {
    maxReconnectAttempts,
    reconnectBackoffMs,
    throttleTimeMs,
    throttleTimeoutRef
  };
};
