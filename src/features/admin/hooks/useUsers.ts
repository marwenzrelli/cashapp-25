
import { useState, useEffect, useCallback } from 'react';
import { SystemUser, mapProfileToSystemUser } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          username,
          role,
          department,
          status,
          created_at,
          last_login,
          user_permissions (
            id,
            permission_name,
            permission_description,
            module
          )
        `)
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profile) {
        console.log("No profile found");
        return null;
      }

      console.log("Profile loaded successfully:", profile);
      return mapProfileToSystemUser(profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      throw error;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          username,
          role,
          department,
          status,
          created_at,
          last_login,
          user_permissions (
            id,
            permission_name,
            permission_description,
            module
          )
        `);

      if (profilesError) {
        console.error("Error loading users:", profilesError);
        throw profilesError;
      }

      return profiles ? profiles.map(profile => mapProfileToSystemUser(profile)) : [];
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

      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.fullName,
            role: user.role,
            department: user.department,
            username: user.username
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            hashed_password: user.password
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error("Error updating profile with password:", updateError);
        }

        const newUsers = await fetchUsers();
        setUsers(newUsers);
        toast.success("Utilisateur créé avec succès");
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error("Erreur lors de la création de l'utilisateur: " + error.message);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (updatedUser: SystemUser & { password?: string }) => {
    try {
      const updateData: any = {
        full_name: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        status: updatedUser.status
      };

      if (updatedUser.password) {
        updateData.hashed_password = updatedUser.password;
        // Note: This operation requires administrative privileges
        const { error: authError } = await supabase.auth.admin.updateUserById(
          updatedUser.id,
          { password: updatedUser.password }
        );

        if (authError) throw authError;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', updatedUser.id);

      if (error) throw error;

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

  const updatePermissions = useCallback(async (userId: string, permissions: SystemUser["permissions"]) => {
    try {
      // Supprimer d'abord toutes les permissions existantes
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      // Ajouter les nouvelles permissions si elles existent
      if (permissions.length > 0) {
        const { error } = await supabase
          .from('user_permissions')
          .insert(permissions.map(p => ({
            user_id: userId,
            permission_name: p.name,
            permission_description: p.description,
            module: p.module
          })));

        if (error) throw error;
      }

      // Recharger les utilisateurs pour mettre à jour l'interface
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
      // Note: This operation requires administrative privileges
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

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
    updatePermissions,
    deleteUser
  };
}
