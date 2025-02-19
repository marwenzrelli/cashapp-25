
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
      console.log("Début de la récupération de l'utilisateur courant");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Pas de session active");
        return;
      }

      console.log("Session trouvée, ID utilisateur:", session.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Erreur lors de la récupération du profil:", profileError);
        toast.error("Erreur lors du chargement du profil");
        return;
      }

      if (!profile) {
        console.log("Aucun profil trouvé");
        return;
      }

      console.log("Profil récupéré:", profile);
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('id, permission_name, permission_description, module')
        .eq('user_id', session.user.id);

      console.log("Permissions récupérées:", permissions);
      setCurrentUser(mapProfileToSystemUser({
        ...profile,
        user_permissions: permissions || []
      }));
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      toast.error("Erreur lors du chargement du profil");
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Pas de session active pour récupérer les utilisateurs");
        return;
      }

      console.log("Récupération des profils utilisateurs");
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error("Erreur lors du chargement des utilisateurs:", profilesError);
        toast.error("Erreur lors du chargement des utilisateurs");
        return;
      }

      if (!profiles) {
        console.log("Aucun profil trouvé");
        setUsers([]);
        return;
      }

      console.log("Profils récupérés:", profiles);
      const { data: allPermissions } = await supabase
        .from('user_permissions')
        .select('*');

      console.log("Permissions récupérées:", allPermissions);
      
      const mappedUsers = profiles.map(profile => mapProfileToSystemUser({
        ...profile,
        user_permissions: allPermissions?.filter(p => p.user_id === profile.id) || []
      }));

      console.log("Utilisateurs mappés:", mappedUsers);
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Une erreur est survenue lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

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
        await fetchUsers();
        toast.success("Utilisateur créé avec succès");
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
      // Supprimer d'abord toutes les permissions existantes
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
    console.log("Initialisation du hook useUsers");
    const initialize = async () => {
      await fetchCurrentUser();
      await fetchUsers();
    };
    initialize();
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
