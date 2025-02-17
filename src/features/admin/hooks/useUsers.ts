
import { useState, useEffect } from 'react';
import { SystemUser, UserRole, mapProfileToSystemUser } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, user_permissions(*)')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setCurrentUser(mapProfileToSystemUser(profile));
      }
    }
  };

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*, user_permissions(*)');

    if (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
      return;
    }

    if (profiles) {
      const formattedUsers = profiles.map(mapProfileToSystemUser);
      setUsers(formattedUsers);
    }
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .auth.admin.deleteUser(userId);

    if (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
      return;
    }

    setUsers(users.filter(user => user.id !== userId));
    toast.success("Utilisateur supprimé avec succès");
  };

  const toggleUserStatus = async (userId: string) => {
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
  };

  const addUser = async (user: SystemUser & { password: string }) => {
    try {
      // Vérifier si l'utilisateur actuel est superviseur
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!currentProfile || currentProfile.role !== 'supervisor') {
        toast.error("Seuls les superviseurs peuvent créer des utilisateurs");
        return;
      }

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
  };

  const updatePermissions = async (userId: string, permissions: SystemUser["permissions"]) => {
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
