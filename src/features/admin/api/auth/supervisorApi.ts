
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
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userData.email)
      .maybeSingle();
      
    if (checkError) {
      console.error("Erreur lors de la vérification de l'utilisateur:", checkError);
    }
    
    if (existingUser) {
      console.log("L'utilisateur existe déjà, mise à jour du profil uniquement");
      return { id: existingUser.id, email: userData.email };
    }

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

    if (signUpError) {
      console.error("Erreur lors de la création de l'utilisateur:", signUpError);
      throw signUpError;
    }
    
    if (!authData.user) {
      console.error("Aucun utilisateur n'a été créé");
      throw new Error("Erreur: Aucun utilisateur créé");
    }

    console.log("Utilisateur créé avec succès, ID:", authData.user.id);
    
    // IMPORTANT: Attendre plus longtemps pour que le trigger handle_new_user s'exécute complètement
    await new Promise(resolve => setTimeout(resolve, 2000));

    return authData.user;
  } catch (error) {
    console.error("Erreur lors de la création du compte superviseur:", error);
    throw error;
  }
};

export const makeUserSupervisor = async (email: string) => {
  try {
    console.log(`Attempting to promote user with email: ${email} to supervisor role`);
    
    // Find the user by email directly in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw profileError;
    }
    
    if (!profileData) {
      console.error(`No user found with email: ${email}`);
      throw new Error(`Aucun utilisateur trouvé avec l'email: ${email}`);
    }
    
    console.log(`Found user with ID: ${profileData.id}`);
    
    // Update user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'supervisor',
        department: 'finance'
      })
      .eq('id', profileData.id);
    
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
