
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
 * Hook to manage fetch state and controls
 */
export const useFetchStateManager = () => {
  // State
  const [state, setState] = useState<FetchState>({
    isLoading: true,
    error: null,
    lastFetchTime: 0,
    fetchAttempts: 0
  });
  
  // Controls
  const controls: FetchControls = {
    isMountedRef: useRef<boolean>(true),
    fetchTimeoutRef: useRef<NodeJS.Timeout | null>(null),
    fetchingRef: useRef<boolean>(false),
    maxRetries: useRef<number>(3),
    abortControllerRef: useRef<AbortController | null>(null)
  };
  
  const updateState = (updates: Partial<FetchState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };
  
  const setIsLoading = (isLoading: boolean) => {
    updateState({ isLoading });
  };
  
  const setError = (error: string | null) => {
    updateState({ error });
  };
  
  const setLastFetchTime = (lastFetchTime: number) => {
    updateState({ lastFetchTime });
  };
  
  const incrementFetchAttempts = () => {
    updateState({ fetchAttempts: state.fetchAttempts + 1 });
  };
  
  const resetFetchAttempts = () => {
    updateState({ fetchAttempts: 0 });
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
