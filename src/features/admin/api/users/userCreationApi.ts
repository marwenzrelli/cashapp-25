
import { supabase } from '@/integrations/supabase/client';
import { SystemUser } from '@/types/admin';

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
