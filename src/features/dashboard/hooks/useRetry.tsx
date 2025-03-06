
import { useEffect } from "react";

export const useRetry = (
  retryCount: number,
  maxRetries: number,
  callback: () => void
) => {
  useEffect(() => {
    // If we had a failed attempt but haven't exceeded retry limit, try again
    if (retryCount > 0 && retryCount <= maxRetries) {
      const retryTimeout = setTimeout(() => {
        console.log(`Retrying fetch attempt ${retryCount}...`);
        callback();
      }, 2000 * retryCount); // Exponential backoff
      
      return () => clearTimeout(retryTimeout);
    }
  }, [retryCount, maxRetries, callback]);
};
