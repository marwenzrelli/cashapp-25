
import { useState, useCallback } from 'react';
import { SystemUser } from '@/types/admin';
import { toast } from 'sonner';
import { useCurrentUser } from './useCurrentUser';
import { useUsersList } from './useUsersList';
import { useUserActions } from './useUserActions';
import { makeUserSupervisor } from '../api';

export function useUsers() {
  const { currentUser, isLoading: isCurrentUserLoading, error: currentUserError, fetchCurrentUser } = useCurrentUser();
  const { users, isLoading: isUsersLoading, error: usersError, fetchUsers, setUsers } = useUsersList();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [isMakingSupervisor, setIsMakingSupervisor] = useState(false);

  const { 
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions,
    deleteUser
  } = useUserActions(users, setUsers, fetchUsers);

  const retryInitialization = useCallback(async () => {
    setIsRetrying(true);
    setRetryLoading(true);
    try {
      const currentUserData = await fetchCurrentUser();
      
      const usersData = await fetchUsers();
      
      toast.success("Données chargées avec succès");
    } catch (error) {
      console.error("Error during retry:", error);
      toast.error("Échec du chargement des données");
    } finally {
      setIsRetrying(false);
      setRetryLoading(false);
    }
  }, [fetchCurrentUser, fetchUsers]);

  const makeSelfSupervisor = useCallback(async (email: string) => {
    setIsMakingSupervisor(true);
    try {
      await makeUserSupervisor(email);
      toast.success("Rôle de superviseur attribué avec succès");
      
      // Reload current user data to reflect the new role
      await fetchCurrentUser();
      
    } catch (error) {
      console.error("Error making self supervisor:", error);
      toast.error("Échec de l'attribution du rôle de superviseur");
    } finally {
      setIsMakingSupervisor(false);
    }
  }, [fetchCurrentUser]);

  // Combine loading states and errors
  const isLoading = isCurrentUserLoading || isUsersLoading;
  const error = currentUserError || usersError;

  return {
    users,
    currentUser,
    isLoading,
    error,
    isRetrying,
    retryLoading,
    isMakingSupervisor,
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions,
    deleteUser,
    retryInitialization,
    makeSelfSupervisor
  };
}
