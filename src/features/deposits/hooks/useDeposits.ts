
import { useState, useEffect } from "react";
import { useFetchDeposits } from "./useFetchDeposits";

export const useDeposits = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { fetchDeposits } = useFetchDeposits(setDeposits, setIsLoading);

  useEffect(() => {
    console.log("Fetching deposits from useDeposits hook");
    fetchDeposits();
  }, [fetchDeposits]);

  return { 
    deposits,
    isLoading,
    refreshDeposits: fetchDeposits
  };
};
