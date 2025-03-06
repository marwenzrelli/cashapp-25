
import { useState, useEffect, useCallback } from 'react';
import { SystemUser, mapProfileToSystemUser } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile, fetchUserPermissions } from '../api';

export function useCurrentUser() {
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

      let permissions = [];
      try {
        permissions = await fetchUserPermissions(session.user.id);
      } catch (permError) {
        console.error("Error loading permissions, continuing with empty permissions:", permError);
      }
      
      console.log("Profile loaded successfully:", profile);
      return mapProfileToSystemUser({ ...profile, user_permissions: permissions });
    } catch (error) {
      console.error("Error loading profile:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        const user = await fetchCurrentUser();
        if (mounted) {
          setCurrentUser(user);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error loading current user:", error);
          setError(error as Error);
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
  }, [fetchCurrentUser]);

  return {
    currentUser,
    isLoading,
    error,
    fetchCurrentUser
  };
}
