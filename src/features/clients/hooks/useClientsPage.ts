
import { useState, useEffect, useCallback, useMemo } from "react";
import { useClients } from "./useClients";
import { useClientDialogs } from "./useClientDialogs";
import { toast } from "sonner";

export const useClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { 
    clients,
    loading,
    error,
    fetchClients,
    updateClient,
    deleteClient,
    createClient
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

  // Optimized retry handler with optional toast suppression
  const handleRetry = useCallback((showToast = true) => {
    console.log("Attempting to reload clients...");
    return fetchClients(0, showToast);
  }, [fetchClients]);

  // Optimized edit confirmation
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

  // Optimized delete confirmation
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

  // Optimized client creation
  const handleCreateClient = async () => {
    console.log("Creating a new client:", newClient);
    // Validation for required fields - phone is no longer required
    if (!newClient.prenom.trim() || !newClient.nom.trim()) {
      toast.error("Informations incomplètes", {
        description: "Veuillez remplir au moins le prénom et le nom du client."
      });
      return;
    }

    // Add default 'active' status during creation
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

  // Optimize filtering by memoizing the filter operation
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return clients.filter((client) =>
      `${client.prenom} ${client.nom}`.toLowerCase().includes(lowerSearchTerm) ||
      (client.email && client.email.toLowerCase().includes(lowerSearchTerm)) ||
      (client.telephone && client.telephone.includes(lowerSearchTerm))
    );
  }, [clients, searchTerm]);

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
