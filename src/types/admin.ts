
export type UserRole = "supervisor" | "manager" | "cashier";

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
  login: string;
  role: UserRole;
  avatar?: string;
  status: "active" | "inactive";
  permissions: Permission[];
  lastLogin?: string;
  createdAt: string;
  department: string;
}
