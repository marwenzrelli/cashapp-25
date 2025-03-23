
import { useState, useRef } from "react";
import { RealtimeState } from "./types";

/**
 * Hook to manage realtime subscription state
 */
export const useRealtimeState = () => {
  // Track subscription status with refs to avoid re-renders
  const subscribedRef = useRef(false);
  const channelRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef(0);
  const [lastEventTime, setLastEventTime] = useState(0);

  const getState = (): RealtimeState => ({
    isSubscribed: subscribedRef.current,
    lastEventTime,
    reconnectAttempts: reconnectAttemptsRef.current,
    channel: channelRef.current
  });

  const updateState = (updates: Partial<RealtimeState>) => {
    if ('isSubscribed' in updates) {
      subscribedRef.current = updates.isSubscribed!;
    }
    if ('channel' in updates) {
      channelRef.current = updates.channel;
    }
    if ('reconnectAttempts' in updates) {
      reconnectAttemptsRef.current = updates.reconnectAttempts!;
    }
    if ('lastEventTime' in updates) {
      setLastEventTime(updates.lastEventTime!);
    }
  };

  const resetState = () => {
    subscribedRef.current = false;
    channelRef.current = null;
    reconnectAttemptsRef.current = 0;
    setLastEventTime(0);
  };

  return {
    subscribedRef,
    channelRef,
    reconnectAttemptsRef,
    lastEventTime,
    setLastEventTime,
    getState,
    updateState,
    resetState
  };
};
