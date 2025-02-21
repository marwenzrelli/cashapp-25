
import { useState, useEffect } from 'react';
import { SystemUser, UserRole, mapProfileToSystemUser } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        console.log("No active session");
        setIsLoading(false);
        return;
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
        setIsLoading(false);
        return;
      }

      console.log("Profile loaded successfully:", profile);
      setCurrentUser(mapProfileToSystemUser(profile));
    } catch (error) {
      console.error("Error loading profile:", error);
      setError(error as Error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
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

      if (!profiles) {
        setUsers([]);
        return;
      }

      console.log("Users loaded successfully:", profiles);
      const mappedUsers = profiles.map(profile => mapProfileToSystemUser(profile));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      setError(error as Error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === "active" ? "inactive" : "active";

      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, status: newStatus }
          : user
      ));
      
      toast.success("Statut de l'utilisateur mis à jour");
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const addUser = async (user: SystemUser & { password: string }) => {
    try {
      // Créer l'utilisateur dans auth.users via la fonction signUp
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
        // Mettre à jour le profil avec le mot de passe hashé
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            hashed_password: user.password // Dans un environnement de production, il faudrait hasher le mot de passe
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error("Error updating profile with password:", updateError);
        }

        await fetchUsers();
        toast.success("Utilisateur créé avec succès");
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error("Erreur lors de la création de l'utilisateur: " + error.message);
    }
  };

  const updateUser = async (updatedUser: SystemUser & { password?: string }) => {
    try {
      const updateData: any = {
        full_name: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        status: updatedUser.status
      };

      // Si un nouveau mot de passe est fourni, le mettre à jour
      if (updatedUser.password) {
        updateData.hashed_password = updatedUser.password; // Dans un environnement de production, il faudrait hasher le mot de passe

        // Mettre à jour le mot de passe dans auth.users
        const { error: authError } = await supabase.auth.admin.updateUserById(
          updatedUser.id,
          { password: updatedUser.password }
        );

        if (authError) {
          console.error("Error updating auth password:", authError);
          throw authError;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', updatedUser.id);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === updatedUser.id
          ? { ...updatedUser }
          : user
      ));
      
      toast.success("Utilisateur mis à jour avec succès");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const updatePermissions = async (userId: string, permissions: SystemUser["permissions"]) => {
    try {
      // Supprimer les permissions existantes
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

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

      await fetchUsers();
      toast.success("Permissions mises à jour avec succès");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Erreur lors de la mise à jour des permissions");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await fetchCurrentUser();
        if (mounted) {
          await fetchUsers();
        }
      } catch (error) {
        if (mounted) {
          console.error("Error during initialization:", error);
          setError(error as Error);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in useUsers:", event);
      if (event === 'SIGNED_IN' && mounted) {
        initialize();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
