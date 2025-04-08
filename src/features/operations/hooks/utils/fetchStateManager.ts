
import { useState, useRef } from 'react';

export interface FetchState {
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  fetchAttempts: number;
}

export interface FetchControls {
  isMountedRef: React.MutableRefObject<boolean>;
  fetchingRef: React.MutableRefObject<boolean>;
  fetchTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  maxRetries: React.MutableRefObject<number>;
}

/**
 * Hook ultra-simplifié pour gérer l'état de chargement
 */
export const useFetchStateManager = () => {
  // État avec valeurs par défaut
  const [state, setState] = useState<FetchState>({
    isLoading: false,
    error: null,
    lastFetchTime: 0,
    fetchAttempts: 0
  });
  
  // Contrôles avec références pour suivre l'état
  const controls: FetchControls = {
    isMountedRef: useRef<boolean>(true),
    fetchingRef: useRef<boolean>(false),
    fetchTimeoutRef: useRef<NodeJS.Timeout | null>(null),
    abortControllerRef: useRef<AbortController | null>(null),
    maxRetries: useRef<number>(3)
  };
  
  // Setters d'état
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
