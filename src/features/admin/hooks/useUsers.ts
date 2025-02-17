
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

      // Récupérer uniquement le profil d'abord
      const profileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileResult.error) {
        console.error("Erreur lors du chargement du profil:", profileResult.error);
        return;
      }

      if (!profileResult.data) return;

      // Si l'utilisateur est un superviseur, récupérer ses permissions
      if (profileResult.data.role === 'supervisor') {
        const permissionsResult = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', user.id);

        if (permissionsResult.error) {
          console.error("Erreur lors du chargement des permissions:", permissionsResult.error);
        }

        const fullProfile = {
          ...profileResult.data,
          user_permissions: permissionsResult.data || []
        };
        setCurrentUser(mapProfileToSystemUser(fullProfile));
      } else {
        // Pour les non-superviseurs, pas besoin de charger les permissions
        const fullProfile = {
          ...profileResult.data,
          user_permissions: []
        };
        setCurrentUser(mapProfileToSystemUser(fullProfile));
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Récupérer d'abord tous les profils
      const profilesResult = await supabase
        .from('profiles')
        .select('*');

      if (profilesResult.error) {
        console.error("Erreur lors du chargement des utilisateurs:", profilesResult.error);
        toast.error("Erreur lors du chargement des utilisateurs");
        return;
      }

      // Récupérer les permissions uniquement pour les superviseurs
      const supervisorIds = profilesResult.data
        .filter(profile => profile.role === 'supervisor')
        .map(profile => profile.id);

      let permissionsResult = { data: [] };
      if (supervisorIds.length > 0) {
        permissionsResult = await supabase
          .from('user_permissions')
          .select('*')
          .in('user_id', supervisorIds);

        if (permissionsResult.error) {
          console.error("Erreur lors du chargement des permissions:", permissionsResult.error);
        }
      }

      const fullProfiles = profilesResult.data.map(profile => ({
        ...profile,
        user_permissions: profile.role === 'supervisor'
          ? permissionsResult.data?.filter(p => p.user_id === profile.id) || []
          : []
      }));

      setUsers(fullProfiles.map(mapProfileToSystemUser));
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

      // Attendre que le trigger crée le profil
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      // Vérifier d'abord si l'utilisateur est un superviseur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Erreur lors de la vérification du rôle:", profileError);
        toast.error("Erreur lors de la mise à jour des permissions");
        return;
      }

      if (profile.role !== 'supervisor') {
        toast.error("Seuls les superviseurs peuvent avoir des permissions");
        return;
      }

      // Supprimer d'abord toutes les permissions existantes
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
