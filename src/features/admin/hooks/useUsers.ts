import { useState, useEffect, useCallback } from 'react';
import { SystemUser, mapProfileToSystemUser } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  fetchUserPermissions,
  fetchUserProfile,
  fetchAllProfiles,
  updateUserStatus,
  createUser,
  updateUserProfile,
  updateUserPermissions,
  deleteUserById
} from '../api';

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session");
        return null;
      }

      console.log("Fetching profile for user:", session.user.id);
      const profile = await fetchUserProfile(session.user.id);

      if (!profile) {
        console.log("No profile found");
        return null;
      }

      const permissions = await fetchUserPermissions(session.user.id);
      
      console.log("Profile loaded successfully:", profile);
      return mapProfileToSystemUser({ ...profile, user_permissions: permissions });
    } catch (error) {
      console.error("Error loading profile:", error);
      throw error;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const profiles = await fetchAllProfiles();
      const usersWithPermissions = await Promise.all(
        profiles.map(async (profile) => {
          const permissions = await fetchUserPermissions(profile.id);
          return mapProfileToSystemUser({ ...profile, user_permissions: permissions });
        })
      );

      return usersWithPermissions;
    } catch (error) {
      console.error("Error loading users:", error);
      throw error;
    }
  }, []);

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
  }, [users]);

  const addUser = useCallback(async (user: SystemUser & { password: string }) => {
    try {
      await createUser(user);
      const newUsers = await fetchUsers();
      setUsers(newUsers);
      toast.success("Utilisateur créé avec succès");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error("Erreur lors de la création de l'utilisateur: " + error.message);
    }
  }, [fetchUsers]);

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
  }, []);

  const handleUpdatePermissions = useCallback(async (userId: string, permissions: SystemUser["permissions"]) => {
    try {
      await updateUserPermissions(userId, permissions);
      const newUsers = await fetchUsers();
      setUsers(newUsers);
      toast.success("Permissions mises à jour avec succès");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Erreur lors de la mise à jour des permissions");
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await deleteUserById(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        const [currentUserData, usersData] = await Promise.all([
          fetchCurrentUser(),
          fetchUsers()
        ]);

        if (mounted) {
          if (currentUserData) setCurrentUser(currentUserData);
          setUsers(usersData);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error during initialization:", error);
          setError(error as Error);
          toast.error("Erreur lors du chargement des données");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in useUsers:", event);
      if (event === 'SIGNED_IN' && mounted) {
        initialize();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchCurrentUser, fetchUsers]);

  return {
    users,
    currentUser,
    isLoading,
    error,
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions: handleUpdatePermissions,
    deleteUser
  };
}
