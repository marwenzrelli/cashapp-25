
import { useState, useRef } from 'react';

export interface FetchState {
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  fetchAttempts: number;
}

export interface FetchControls {
  isMountedRef: React.MutableRefObject<boolean>;
  fetchTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  fetchingRef: React.MutableRefObject<boolean>;
  maxRetries: React.MutableRefObject<number>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
}

/**
 * Simplified hook to manage fetch state and controls
 */
export const useFetchStateManager = () => {
  // State with default values
  const [state, setState] = useState<FetchState>({
    isLoading: false,
    error: null,
    lastFetchTime: 0,
    fetchAttempts: 0
  });
  
  // Controls
  const controls: FetchControls = {
    isMountedRef: useRef<boolean>(true),
    fetchTimeoutRef: useRef<NodeJS.Timeout | null>(null),
    fetchingRef: useRef<boolean>(false),
    maxRetries: useRef<number>(1), // Reduced retries
    abortControllerRef: useRef<AbortController | null>(null)
  };
  
  // State setters
  const setIsLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };
  
  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };
  
  const setLastFetchTime = (lastFetchTime: number) => {
    setState(prev => ({ ...prev, lastFetchTime }));
  };
  
  const incrementFetchAttempts = () => {
    setState(prev => ({ ...prev, fetchAttempts: prev.fetchAttempts + 1 }));
  };
  
  const resetFetchAttempts = () => {
    setState(prev => ({ ...prev, fetchAttempts: 0 }));
  };
  
  return {
    ...state,
    controls,
    setIsLoading,
    setError,
    setLastFetchTime,
    incrementFetchAttempts,
    resetFetchAttempts
  };
};
