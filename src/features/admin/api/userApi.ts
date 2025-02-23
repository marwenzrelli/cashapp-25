
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
  // Validation du mot de passe
  if (!user.password || user.password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères");
  }

  console.log("Tentative de création de l'utilisateur:", { ...user, password: '[HIDDEN]' });

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

  if (signUpError) {
    console.error("Erreur lors de la création de l'utilisateur:", signUpError);
    throw signUpError;
  }

  if (!data.user) {
    throw new Error("Erreur lors de la création de l'utilisateur");
  }

  console.log("Utilisateur créé avec succès:", data.user.id);

  // Mise à jour du profil
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: user.role,
      department: user.department,
      status: 'active'
    })
    .eq('id', data.user.id);

  if (updateError) {
    console.error("Erreur lors de la mise à jour du profil:", updateError);
    throw updateError;
  }

  return data.user;
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
