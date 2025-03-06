
import { supabase } from '@/integrations/supabase/client';
import { SystemUser } from '@/types/admin';

export const fetchUserProfile = async (userId: string) => {
  try {
    console.log(`Attempting to fetch profile for user: ${userId}`);
    
    // First try with maybeSingle to avoid the error from single when no row is found
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
    
    if (!profile) {
      console.log(`No profile found for user ${userId}, creating default profile`);
      
      // Get user email from auth table
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }
      
      // Create a default profile
      const defaultProfile = {
        id: userId,
        email: userData?.user?.email || '',
        full_name: 'Default User',
        role: 'supervisor', // Assuming supervisor role for missing profiles
        status: 'active',
        department: 'administrative'
      };
      
      // Insert the default profile
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select('*')
        .single();
        
      if (insertError) {
        console.error("Error creating default profile:", insertError);
        throw insertError;
      }
      
      console.log("Default profile created successfully:", newProfile);
      return newProfile;
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
