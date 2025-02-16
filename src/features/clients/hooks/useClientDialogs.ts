
import { useState } from "react";
import { Client } from "../types";

export const useClientDialogs = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const [editForm, setEditForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
  });

  const [newClient, setNewClient] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    solde: 0,
  });

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setEditForm({
      nom: client.nom,
      prenom: client.prenom,
      telephone: client.telephone,
      email: client.email,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const resetNewClient = () => {
    setNewClient({ nom: "", prenom: "", telephone: "", email: "", solde: 0 });
  };

  return {
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
    resetNewClient,
  };
};
