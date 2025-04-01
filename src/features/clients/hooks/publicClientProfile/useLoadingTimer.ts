
import { useState, useEffect, useRef } from "react";

/**
 * Hook for tracking loading time
 */
export const useLoadingTimer = (isLoading: boolean, error: string | null) => {
  const [loadingTime, setLoadingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading && !error) {
      timerRef.current = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading, error]);

  return { loadingTime, setLoadingTime };
};
