
import { useState, useCallback } from "react";
import { Client } from "../../types";
import { useFetchOperation } from "./fetch/useFetchOperation";
import { showErrorToast } from "../utils/errorUtils";

export const useFetchClients = (
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Import the core fetch functionality from our refactored hook
  const { fetchClients: coreFetchClients } = useFetchOperation(setClients, setLoading, setError);
  
  // Function to fetch clients - this maintains the original API
  const fetchClients = useCallback(async (retry = 0, showToast = true) => {
    try {
      await coreFetchClients(retry, showToast);
    } catch (error) {
      console.error("Error in fetchClients wrapper:", error);
      if (showToast) {
        showErrorToast("Erreur de chargement", "Une erreur est survenue lors du chargement des clients.");
      }
    }
  }, [coreFetchClients]);

  return { fetchClients };
};
