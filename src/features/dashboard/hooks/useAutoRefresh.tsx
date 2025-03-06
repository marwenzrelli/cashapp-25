
import { useEffect } from "react";

export const useAutoRefresh = (
  callback: () => void,
  intervalMs: number,
  dependencies: any[] = []
) => {
  useEffect(() => {
    const interval = setInterval(() => {
      callback();
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [...dependencies]);
};
