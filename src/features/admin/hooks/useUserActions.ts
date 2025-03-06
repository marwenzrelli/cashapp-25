
import { useCallback } from 'react';
import { SystemUser } from '@/types/admin';
import { toast } from 'sonner';
import {
  updateUserStatus,
  createUser,
  updateUserProfile,
  updateUserPermissions,
  deleteUserById
} from '../api';

export function useUserActions(
  users: SystemUser[],
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>,
  refreshUsersList: () => Promise<SystemUser[]>
) {
  const toggleUserStatus = useCallback(async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === "active" ? "inactive" : "active";
      await updateUserStatus(userId, newStatus);

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );
      
      toast.success("Statut de l'utilisateur mis à jour");
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  }, [users, setUsers]);

  const addUser = useCallback(async (user: SystemUser & { password: string }) => {
    try {
      await createUser(user);
      const newUsers = await refreshUsersList();
      setUsers(newUsers);
      toast.success("Utilisateur créé avec succès");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error("Erreur lors de la création de l'utilisateur: " + error.message);
    }
  }, [refreshUsersList, setUsers]);

  const updateUser = useCallback(async (updatedUser: SystemUser & { password?: string }) => {
    try {
      await updateUserProfile(updatedUser);

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === updatedUser.id
            ? { ...updatedUser }
            : user
        )
      );
      
      toast.success("Utilisateur mis à jour avec succès");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    }
  }, [setUsers]);

  const handleUpdatePermissions = useCallback(async (userId: string, permissions: SystemUser["permissions"]) => {
    try {
      await updateUserPermissions(userId, permissions);
      const newUsers = await refreshUsersList();
      setUsers(newUsers);
      toast.success("Permissions mises à jour avec succès");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Erreur lors de la mise à jour des permissions");
    }
  }, [refreshUsersList, setUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await deleteUserById(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  }, [setUsers]);

  return {
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions: handleUpdatePermissions,
    deleteUser
  };
}
