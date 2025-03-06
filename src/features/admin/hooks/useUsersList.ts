
import { useState, useEffect, useCallback } from 'react';
import { SystemUser, mapProfileToSystemUser } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllProfiles, fetchUserPermissions } from '../api';
import { toast } from 'sonner';

export function useUsersList() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const profiles = await fetchAllProfiles();
      
      const usersWithPermissions = await Promise.all(
        profiles.map(async (profile) => {
          let permissions = [];
          try {
            permissions = await fetchUserPermissions(profile.id);
          } catch (permError) {
            console.error(`Error loading permissions for user ${profile.id}, continuing with empty permissions:`, permError);
          }
          return mapProfileToSystemUser({ ...profile, user_permissions: permissions });
        })
      );

      return usersWithPermissions;
    } catch (error) {
      console.error("Error loading users:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        const usersData = await fetchUsers();
        if (mounted) {
          setUsers(usersData);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error loading users list:", error);
          setError(error as Error);
          toast.error("Erreur lors du chargement de la liste des utilisateurs", {
            description: "Veuillez rafraîchir la page ou réessayer plus tard"
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && mounted) {
        initialize();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    setUsers
  };
}
