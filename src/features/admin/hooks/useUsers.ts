
import { useState, useEffect } from 'react';
import { SystemUser, UserRole, mapProfileToSystemUser } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Erreur lors du chargement du profil:", profileError);
        return;
      }

      if (!profile) return;

      // Récupération des permissions avec une requête distincte
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('id, permission_name, permission_description, module')
        .eq('user_id', user.id);

      const userWithPermissions = {
        ...profile,
        user_permissions: permissions || []
      };

      setCurrentUser(mapProfileToSystemUser(userWithPermissions));
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Vérifier d'abord si l'utilisateur est un superviseur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (currentUserProfile?.role !== 'supervisor') {
        setIsLoading(false);
        toast.error("Accès non autorisé");
        return;
      }

      // Si c'est un superviseur, récupérer tous les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error("Erreur lors du chargement des utilisateurs:", profilesError);
        toast.error("Erreur lors du chargement des utilisateurs");
        setIsLoading(false);
        return;
      }

      // Récupérer toutes les permissions
      const { data: allPermissions } = await supabase
        .from('user_permissions')
        .select('*');

      const usersWithPermissions = profiles?.map(profile => ({
        ...profile,
        user_permissions: allPermissions?.filter(p => p.user_id === profile.id) || []
      })) || [];

      setUsers(usersWithPermissions.map(profile => mapProfileToSystemUser(profile)));
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Une erreur est survenue lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
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
            username: user.username,
            status: 'active'
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
          status: updatedUser.status
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
    isLoading,
    toggleUserStatus,
    addUser,
    updateUser,
    updatePermissions,
    deleteUser,
  };
}
