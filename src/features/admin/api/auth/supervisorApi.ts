
import { supabase } from '@/integrations/supabase/client';
import { SystemUser } from '@/types/admin';

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
