
import { supabase } from '@/integrations/supabase/client';
import { SystemUser } from '@/types/admin';

export const fetchUserPermissions = async (userId: string) => {
  try {
    const { data: permissions, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return permissions || [];
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return [];
  }
};

export const fetchUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return profile;
};

export const fetchAllProfiles = async () => {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) throw error;
  return profiles || [];
};

export const updateUserStatus = async (userId: string, status: "active" | "inactive") => {
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId);

  if (error) throw error;
};

export const createUser = async (user: SystemUser & { password: string }) => {
  console.log("Démarrage de la création de l'utilisateur");

  if (!user.email || !user.fullName || !user.password) {
    throw new Error("Tous les champs requis doivent être remplis");
  }

  if (user.password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères");
  }

  try {
    // Vérifier que l'utilisateur actuel est un superviseur
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error("Vous devez être connecté pour créer un utilisateur");
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (!currentProfile || currentProfile.role !== 'supervisor') {
      throw new Error("Seul un superviseur peut créer des utilisateurs");
    }

    // Créer l'utilisateur
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
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
    if (!authData.user) throw new Error("Erreur: Aucun utilisateur créé");

    // Attendre un court instant pour que le trigger handle_new_user s'exécute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mettre à jour explicitement le profil avec le rôle et le département
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: user.role,
        department: user.department,
        status: 'active',
        full_name: user.fullName,
        username: user.username
      })
      .eq('id', authData.user.id);

    if (updateError) throw updateError;

    // Vérifier que le profil a bien été mis à jour
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !updatedProfile) {
      throw new Error("Erreur lors de la vérification du profil créé");
    }

    if (updatedProfile.role !== user.role) {
      console.error("Le rôle n'a pas été correctement assigné");
      throw new Error("Erreur lors de l'attribution du rôle");
    }

    console.log("Utilisateur créé avec succès:", updatedProfile);
    return authData.user;

  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    throw error;
  }
};

export const updateUserProfile = async (user: SystemUser & { password?: string }) => {
  const updateData: any = {
    full_name: user.fullName,
    email: user.email,
    role: user.role,
    department: user.department,
    status: user.status
  };

  if (user.password) {
    if (user.password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: user.password }
    );

    if (authError) throw authError;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) throw error;
};

export const updateUserPermissions = async (userId: string, permissions: SystemUser["permissions"]) => {
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
};

export const deleteUserById = async (userId: string) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
};
