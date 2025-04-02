
import { useState, useEffect, useMemo, useCallback } from "react";
import { useClients } from "./useClients";
import { useClientDialogs } from "./useClientDialogs";
import { toast } from "sonner";
import { Client } from "../types";

export const useClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  const { 
    clients,
    loading,
    error,
    fetchClients,
    updateClient,
    deleteClient,
    createClient,
    cachedClients
  } = useClients();

  const {
    isDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedClient,
    editForm,
    newClient,
    setIsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setEditForm,
    setNewClient,
    handleEdit,
    handleDelete,
    resetNewClient
  } = useClientDialogs();

  // Initial fetch with limited automatic retry - executed ONLY once on first component mount
  useEffect(() => {
    console.log("Chargement initial des clients...");
    // Only load data once when component mounts - no additional parameters
    fetchClients();
    
    // No automatic refresh interval - we don't want any automatic refreshes
  }, [fetchClients]);

  // Memoize filtered clients to avoid unnecessary recalculations
  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone?.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const handleRetry = useCallback(() => {
    console.log("Tentative de rechargement des clients...");
    toast.info("Renouvellement de la connexion", {
      description: "Tentative de connexion à la base de données..."
    });
    setRetryAttempt(prev => prev + 1);
    fetchClients();
  }, [fetchClients]);

  const confirmEdit = async () => {
    if (!selectedClient) return;

    const success = await updateClient(selectedClient.id, editForm);
    
    if (success) {
      setIsEditDialogOpen(false);
      toast.success("Modifications enregistrées", {
        description: `Les informations de ${editForm.prenom} ${editForm.nom} ont été mises à jour avec succès.`
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedClient) return;

    const success = await deleteClient(selectedClient.id);
    
    if (success) {
      setIsDeleteDialogOpen(false);
      toast.success("Client supprimé", {
        description: `${selectedClient.prenom} ${selectedClient.nom} a été retiré de la base de données.`
      });
    }
  };

  const handleCreateClient = async () => {
    console.log("Création d'un nouveau client:", newClient);
    // Validation des champs requis - téléphone n'est plus obligatoire
    if (!newClient.prenom.trim() || !newClient.nom.trim()) {
      toast.error("Informations incomplètes", {
        description: "Veuillez remplir au moins le prénom et le nom du client."
      });
      return;
    }

    // Ajout du status par défaut 'active' lors de la création
    const clientData = {
      ...newClient,
      status: 'active'
    };
    
    const success = await createClient(clientData);
    
    if (success) {
      setIsDialogOpen(false);
      toast.success("Nouveau client créé", {
        description: `${newClient.prenom} ${newClient.nom} a été ajouté avec succès.`
      });
      resetNewClient();
    }
  };

  return {
    // State
    clients,
    filteredClients,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    
    // Dialog state
    isDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedClient,
    editForm,
    newClient,
    
    // Dialog actions
    setIsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setEditForm,     
    setNewClient,   
    
    // Client actions
    handleRetry,
    handleEdit,
    handleDelete,
    confirmEdit,
    confirmDelete,
    handleCreateClient,
  };
};
