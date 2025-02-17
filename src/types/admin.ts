
import type { Database } from '@/integrations/supabase/types'

type Tables = Database['public']['Tables']
type ProfileRow = Tables['profiles']['Row']

export type UserRole = ProfileRow['role']

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: "transfers" | "deposits" | "withdrawals" | "clients" | "reports" | "settings";
}

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  username?: string; // Ajout du champ username
  role: UserRole;
  status: ProfileRow['status'];
  permissions: Permission[];
  createdAt: string;
  department: string;
  phone?: string;
  avatar?: string;
  lastLogin?: string;
}

// Utilitaire pour convertir un profil Supabase en SystemUser
export const mapProfileToSystemUser = (
  profile: ProfileRow & { user_permissions?: Tables['user_permissions']['Row'][] }
): SystemUser => ({
  id: profile.id,
  fullName: profile.full_name,
  email: profile.email,
  username: profile.username || undefined,
  role: profile.role,
  status: profile.status,
  permissions: profile.user_permissions?.map(p => ({
    id: p.id,
    name: p.permission_name,
    description: p.permission_description || '',
    module: p.module as Permission['module']
  })) || [],
  createdAt: profile.created_at,
  department: profile.department,
  phone: profile.phone || undefined,
  avatar: profile.avatar_url || undefined,
  lastLogin: profile.last_login || undefined
});
