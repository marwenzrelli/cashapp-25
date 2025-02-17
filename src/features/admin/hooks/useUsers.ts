
import { useState, useEffect } from 'react';
import { SystemUser, UserRole, mapProfileToSystemUser } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer le profil avec une seule requête
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_permissions (
            id,
            permission_name,
            permission_description,
            module
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Erreur lors du chargement du profil:", profileError);
        return;
      }

      if (!profile) return;

      setCurrentUser(mapProfileToSystemUser(profile));
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Récupérer tous les profils avec leurs permissions en une seule requête
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_permissions (
            id,
            permission_name,
            permission_description,
            module
          )
        `);

      if (profilesError) {
        console.error("Erreur lors du chargement des utilisateurs:", profilesError);
        toast.error("Erreur lors du chargement des utilisateurs");
        return;
      }

      if (!profiles) return;

      setUsers(profiles.map(profile => mapProfileToSystemUser({
        ...profile,
        user_permissions: profile.user_permissions || []
      })));
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Une erreur est survenue lors du chargement des utilisateurs");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .auth.admin.deleteUser(userId);

      if (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        toast.error("Erreur lors de la suppression de l'utilisateur");
        return;
      }

      setUsers(users.filter(user => user.id !== userId));
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
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

      if (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        toast.error("Erreur lors de la mise à jour du statut");
        return;
      }

      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, status: newStatus }
          : user
      ));
      toast.success("Statut de l'utilisateur mis à jour");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const addUser = async (user: SystemUser & { password: string }) => {
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
        toast.success("Utilisateur créé avec succès");
        await fetchUsers();
      }
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      toast.error("Erreur lors de la création de l'utilisateur: " + error.message);
    }
  };

  const updateUser = async (updatedUser: SystemUser) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
        })
        .eq('id', updatedUser.id);

      if (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        toast.error("Erreur lors de la mise à jour de l'utilisateur");
        return;
      }

      await fetchUsers();
      toast.success("Utilisateur mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const updatePermissions = async (userId: string, permissions: SystemUser["permissions"]) => {
    try {
      const { error: deleteError } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error("Erreur lors de la suppression des permissions:", deleteError);
        toast.error("Erreur lors de la mise à jour des permissions");
        return;
      }

      if (permissions.length > 0) {
        const { error } = await supabase
          .from('user_permissions')
          .insert(permissions.map(p => ({
            user_id: userId,
            permission_name: p.name,
            permission_description: p.description,
            module: p.module
          })));

        if (error) {
          console.error("Erreur lors de l'ajout des permissions:", error);
          toast.error("Erreur lors de la mise à jour des permissions");
          return;
        }
      }

      await fetchUsers();
      toast.success("Permissions mises à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour des permissions:", error);
      toast.error("Erreur lors de la mise à jour des permissions");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  return {
    users,
    currentUser,
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions,
    deleteUser,
  };
}
