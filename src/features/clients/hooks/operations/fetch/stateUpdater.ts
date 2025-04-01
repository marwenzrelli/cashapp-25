
import { Client } from "../../../types";
import { updateClientBalances } from "./balanceUtils";
import { BALANCE_UPDATE_DELAY } from "./constants";

/**
 * Updates component state with fetched clients
 */
export const updateClientState = (
  clientsData: Client[],
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchAttemptsRef: React.MutableRefObject<number>
) => {
  console.log(`${clientsData.length} clients récupérés avec succès:`, clientsData);
  
  // Update the state with retrieved clients
  setClients(clientsData);
  fetchAttemptsRef.current = 0;
  
  // Create function to update a single client in the state
  const updateSingleClient = (updatedClient: Client) => {
    setClients(prevClients => 
      prevClients.map(c => 
        c.id === updatedClient.id ? updatedClient : c
      )
    );
  };
  
  // Update balances in background after loading clients
  if (clientsData.length > 0) {
    setTimeout(() => {
      updateClientBalances(clientsData, updateSingleClient).catch(err => {
        console.error("Error updating client balances:", err);
      });
    }, BALANCE_UPDATE_DELAY);
  }
  
  // Important: Reset loading state
  setLoading(false);
};
