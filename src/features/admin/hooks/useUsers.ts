
import { useState, useCallback } from 'react';
import { SystemUser } from '@/types/admin';
import { toast } from 'sonner';
import { useCurrentUser } from './useCurrentUser';
import { useUsersList } from './useUsersList';
import { useUserActions } from './useUserActions';
import { makeUserSupervisor } from '../api';
import { supabase } from '@/integrations/supabase/client';

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
      // Vérifier d'abord la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Session non disponible:", sessionError);
        toast.error("Vous devez être connecté pour accéder à cette page");
        setIsRetrying(false);
        setRetryLoading(false);
        return;
      }
      
      console.log("Session valide, utilisateur:", session.user.email);
      
      // Continuer avec le chargement des données
      const currentUserData = await fetchCurrentUser();
      console.log("Données utilisateur chargées:", currentUserData);
      
      const usersData = await fetchUsers();
      console.log("Utilisateurs chargés:", usersData?.length || 0);
      
      toast.success("Données chargées avec succès");
    } catch (error) {
      console.error("Erreur détaillée lors de la tentative:", error);
      
      // Afficher des messages d'erreur plus précis
      if (error instanceof Error) {
        const errorMsg = error.message;
        
        if (errorMsg.includes("row-level security policy")) {
          toast.error("Accès refusé par la politique de sécurité", {
            description: "Vous n'avez pas les permissions nécessaires"
          });
        } else if (errorMsg.includes("not_admin")) {
          toast.error("Accès administrateur requis", {
            description: "Votre compte n'a pas les droits suffisants"
          });
        } else {
          toast.error("Échec du chargement des données", {
            description: errorMsg
          });
        }
      } else {
        toast.error("Échec du chargement des données");
      }
    } finally {
      setIsRetrying(false);
      setRetryLoading(false);
    }
  }, [fetchCurrentUser, fetchUsers]);

  const makeSelfSupervisor = useCallback(async (email: string) => {
    if (!email || email.trim() === '') {
      toast.error("Veuillez saisir votre email");
      return;
    }
    
    setIsMakingSupervisor(true);
    try {
      console.log("Tentative d'attribution du rôle superviseur à:", email);
      
      // Récupérer l'utilisateur actuel pour vérifier
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour cette action");
        return;
      }
      
      console.log("Utilisateur actuel:", user.email);
      
      // Si l'email fourni ne correspond pas à l'utilisateur connecté, afficher un avertissement
      if (user.email !== email) {
        console.warn("L'email fourni ne correspond pas à l'utilisateur connecté");
        toast.warning("L'email fourni ne correspond pas à votre compte actuel", {
          description: "Pour plus de sécurité, utilisez l'email de votre compte actuel"
        });
      }
      
      await makeUserSupervisor(email);
      toast.success("Rôle de superviseur attribué avec succès");
      
      // Reload current user data to reflect the new role
      await fetchCurrentUser();
      
      // Recharger la page après un court délai pour appliquer les nouvelles permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Erreur détaillée lors de l'attribution du rôle de superviseur:", error);
      
      if (error instanceof Error) {
        toast.error("Échec de l'attribution du rôle de superviseur", {
          description: error.message
        });
      } else {
        toast.error("Échec de l'attribution du rôle de superviseur");
      }
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
