import { supabase } from '@/integrations/supabase/client';
import { SystemUser } from '@/types/admin';

export const fetchUserPermissions = async (userId: string) => {
  try {
    // Since the user_permissions table doesn't exist yet, let's return an empty array
    console.log("Fetching permissions for user:", userId);
    // In a real scenario, this would query the user_permissions table
    return [];
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

export const createSupervisorAccount = async (userData: {
  email: string;
  password: string;
  fullName: string;
  username: string;
}) => {
  console.log("Création d'un compte superviseur");
  
  if (!userData.email || !userData.fullName || !userData.password || !userData.username) {
    throw new Error("Tous les champs requis doivent être remplis");
  }
  
  if (userData.password.length < 6) {
    throw new Error("Le mot de passe doit contenir au moins 6 caractères");
  }
  
  try {
    // Créer l'utilisateur avec le rôle de superviseur
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          role: 'supervisor',
          department: 'finance',
          username: userData.username
        }
      }
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error("Erreur: Aucun utilisateur créé");

    // Attendre un court instant pour que le trigger handle_new_user s'exécute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Vérifier si le profil a été créé
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Erreur lors de la vérification du profil:", profileCheckError);
    }

    // Si le profil n'existe pas, le créer manuellement
    if (!existingProfile) {
      console.log("Aucun profil trouvé, création manuelle du profil...");
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          role: 'supervisor',
          department: 'finance',
          status: 'active',
          full_name: userData.fullName,
          username: userData.username
        });

      if (insertError) {
        console.error("Erreur lors de la création manuelle du profil:", insertError);
        throw new Error("Erreur lors de la création du profil utilisateur");
      }
    } else {
      // Mettre à jour explicitement le profil avec le rôle et le département
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'supervisor',
          department: 'finance',
          status: 'active',
          full_name: userData.fullName,
          username: userData.username
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;
    }

    console.log("Compte superviseur créé avec succès:", authData.user);
    return authData.user;
  } catch (error) {
    console.error("Erreur lors de la création du compte superviseur:", error);
    throw error;
  }
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
  // Since user_permissions table doesn't exist yet, log the action but don't make database changes
  console.log("Updating permissions for user:", userId);
  console.log("New permissions:", permissions);
  
  // In a real implementation, we would delete existing permissions and insert new ones
  // For now, we'll just return as if it succeeded
  return;
};

export const deleteUserById = async (userId: string) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
};

export const makeUserSupervisor = async (email: string) => {
  try {
    console.log(`Attempting to promote user with email: ${email} to supervisor role`);
    
    // Get user by email
    const { data, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError);
      throw userError;
    }
    
    // Properly access users array from the data object with explicit typing
    const users = data?.users || [];
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error(`No user found with email: ${email}`);
      throw new Error(`Aucun utilisateur trouvé avec l'email: ${email}`);
    }
    
    console.log(`Found user with ID: ${user.id}`);
    
    // Update user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'supervisor',
        department: 'finance'
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error("Error updating user profile:", updateError);
      throw updateError;
    }
    
    console.log(`Successfully promoted user ${email} to supervisor role`);
    return true;
  } catch (error) {
    console.error("Error making user supervisor:", error);
    throw error;
  }
};
