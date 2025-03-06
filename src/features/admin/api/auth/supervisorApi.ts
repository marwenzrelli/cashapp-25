
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
    
    // Mettre à jour explicitement le profil avec le rôle
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'supervisor',
        department: 'finance',
        profile_role: 'supervisor' // Utiliser le nouveau champ profile_role
      })
      .eq('id', authData.user.id);
    
    if (updateError) {
      console.error("Erreur lors de la mise à jour du profil:", updateError);
      throw updateError;
    }

    return authData.user;
  } catch (error) {
    console.error("Erreur lors de la création du compte superviseur:", error);
    throw error;
  }
};

export const makeUserSupervisor = async (email: string) => {
  try {
    console.log(`Tentative de promotion de l'utilisateur avec email: ${email} au rôle de superviseur`);
    
    // Vérifier si l'utilisateur est déjà connecté
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser && currentUser.email === email) {
      console.log("L'utilisateur correspond à l'utilisateur actuellement connecté");
      
      // Mettre à jour le profil de l'utilisateur actuel directement
      const { error: updateCurrentError } = await supabase
        .from('profiles')
        .update({
          role: 'supervisor',
          department: 'finance',
          profile_role: 'supervisor'
        })
        .eq('id', currentUser.id);
      
      if (updateCurrentError) {
        console.error("Erreur lors de la mise à jour du profil utilisateur actuel:", updateCurrentError);
        throw updateCurrentError;
      }
      
      console.log(`Utilisateur ${email} promu avec succès au rôle de superviseur`);
      return true;
    }
    
    // Si ce n'est pas l'utilisateur actuel ou pas d'utilisateur connecté,
    // rechercher l'utilisateur par email
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError) {
      console.error("Erreur lors de la recherche du profil utilisateur:", profileError);
      throw profileError;
    }
    
    if (!profileData) {
      console.error(`Aucun utilisateur trouvé avec l'email: ${email}`);
      
      // Si aucun profil n'existe, créer un profil temporaire avec l'email
      // Cela peut être utile pour des cas où l'utilisateur n'a pas encore de profil
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (authError || !authUser) {
        console.error(`Aucun utilisateur auth trouvé avec l'email: ${email}`);
        throw new Error(`Aucun utilisateur trouvé avec l'email: ${email}`);
      }
      
      // Créer un profil pour cet utilisateur
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: email,
          full_name: "Superviseur",
          role: 'supervisor',
          department: 'finance',
          profile_role: 'supervisor',
          status: 'active'
        });
      
      if (insertError) {
        console.error("Erreur lors de la création d'un profil pour l'utilisateur:", insertError);
        throw insertError;
      }
      
      console.log(`Profil créé et promu pour l'utilisateur ${email}`);
      return true;
    }
    
    // Mettre à jour le profil existant
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'supervisor',
        department: 'finance',
        profile_role: 'supervisor'
      })
      .eq('id', profileData.id);
    
    if (updateError) {
      console.error("Erreur lors de la mise à jour du profil:", updateError);
      throw updateError;
    }
    
    console.log(`Utilisateur ${email} promu avec succès au rôle de superviseur`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la promotion de l'utilisateur en superviseur:", error);
    throw error;
  }
};
