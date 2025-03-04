
import { StatCard } from "@/features/admin/components/StatCard";
import { Shield, UserCog, Users } from "lucide-react";
import { SystemUser } from "@/types/admin";

interface AdminStatsProps {
  users: SystemUser[];
}

export const AdminStats = ({ users }: AdminStatsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <StatCard
        title="Total Utilisateurs"
        value={users.length}
        icon={Users}
        iconColor="text-blue-600"
        gradientFrom="blue-50"
      />
      <StatCard
        title="Superviseurs"
        value={users.filter((u) => u.role === "supervisor").length}
        icon={Shield}
        iconColor="text-purple-600"
        gradientFrom="purple-50"
      />
      <StatCard
        title="Gestionnaires"
        value={users.filter((u) => u.role === "manager").length}
        icon={UserCog}
        iconColor="text-green-600"
        gradientFrom="green-50"
      />
      <StatCard
        title="Caissiers"
        value={users.filter((u) => u.role === "cashier").length}
        icon={Users}
        iconColor="text-orange-600"
        gradientFrom="orange-50"
      />
    </div>
  );
};
