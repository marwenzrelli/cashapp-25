import { supabase } from '@/integrations/supabase/client';
import { SystemUser } from '@/types/admin';

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      // Try with maybeSingle instead of single to handle case where profile might not exist
      const { data: maybeProfile, error: secondError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (secondError) throw secondError;
      if (!maybeProfile) {
        console.log(`No profile found for user ${userId}`);
        return null;
      }
      return maybeProfile;
    }
    
    return profile;
  } catch (error) {
    console.error(`Failed to fetch profile for user ${userId}:`, error);
    throw error;
  }
};

export const fetchAllProfiles = async () => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;
    return profiles || [];
  } catch (error) {
    console.error("Failed to fetch all profiles:", error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, status: "active" | "inactive") => {
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId);

  if (error) throw error;
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

export const deleteUserById = async (userId: string) => {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
};
