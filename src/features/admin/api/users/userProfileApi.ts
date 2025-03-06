
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
      console.log(`No profile found for user ${userId}`);
      
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }
      
      if (!user) {
        throw new Error("No authenticated user found");
      }
      
      // Create a default profile for the current user only
      // This ensures we're only creating profiles for the authenticated user
      if (user.id === userId) {
        const defaultProfile = {
          id: userId,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Default User',
          role: 'cashier', // Default to cashier role
          status: 'active',
          department: 'accounting'
        };
        
        console.log("Creating default profile for current user:", defaultProfile);
        
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
      } else {
        // For other users, return basic info without creating a profile
        // This prevents RLS violations when trying to create profiles for other users
        console.log("Returning basic profile info for non-current user");
        return {
          id: userId,
          email: user.email || '',
          full_name: 'Unknown User',
          role: 'cashier',
          status: 'inactive',
          department: 'unknown'
        };
      }
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

    // Since we don't have admin API access, we can only update our own password
    const { error: authError } = await supabase.auth.updateUser({
      password: user.password
    });

    if (authError) throw authError;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) throw error;
};

export const deleteUserById = async (userId: string) => {
  // This requires admin permissions, so let's handle it differently
  // We'll update the status to inactive instead of deleting
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'inactive' })
    .eq('id', userId);
    
  if (error) throw error;
  
  return { success: true, message: "User marked as inactive" };
};
