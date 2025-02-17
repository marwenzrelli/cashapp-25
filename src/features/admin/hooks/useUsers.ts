
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
        .single();

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
      toast.error("Erreur lors du chargement des utilisateurs");
      return;
    }

    const formattedUsers = profiles.map(mapProfileToSystemUser);
    setUsers(formattedUsers);
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

  const addUser = async (user: SystemUser) => {
    try {
      const tempPassword = 'temp-' + Math.random().toString(36).slice(-8);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: tempPassword,
        options: {
          data: {
            full_name: user.fullName,
            role: user.role,
            department: user.department
          }
        }
      });

      if (signUpError) throw signUpError;

      // Attendre que le trigger crée le profil
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (data.user) {
        toast.success(`Utilisateur créé avec succès. \nMot de passe temporaire: ${tempPassword}\nVeuillez communiquer ce mot de passe à l'utilisateur de manière sécurisée.`, {
          duration: 10000, // Afficher plus longtemps pour que l'admin puisse noter le mot de passe
        });
      }

      await fetchUsers();
    } catch (error: any) {
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
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
      return;
    }

    await fetchUsers();
    toast.success("Utilisateur mis à jour avec succès");
  };

  const updatePermissions = async (userId: string, permissions: SystemUser["permissions"]) => {
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
  };
}
