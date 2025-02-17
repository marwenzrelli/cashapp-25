
export type UserStatus = "active" | "inactive";
export type UserRole = "supervisor" | "manager" | "cashier";

export interface Permission {
  id?: string;
  name: string;
  description: string;
  module: string;
}

export interface SystemUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  permissions: Permission[];
  createdAt: string;
  lastLogin: string | null;
  phone?: string; // Ajout du champ phone optionnel
}

export const mapProfileToSystemUser = (profile: any): SystemUser => {
  return {
    id: profile.id,
    email: profile.email,
    username: profile.username || '',
    fullName: profile.full_name || '',
    role: profile.role || 'cashier',
    status: profile.status || 'active',
    department: profile.department || 'accounting',
    permissions: profile.user_permissions || [],
    createdAt: profile.created_at,
    lastLogin: profile.last_login,
    avatar: profile.avatar_url,
    phone: profile.phone,
  };
};
