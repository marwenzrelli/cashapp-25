
import { ReactNode } from "react";

interface ClientStatusBadgeProps {
  status: string;
  children: ReactNode;
}

export const ClientStatusBadge = ({ status, children }: ClientStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
      {children}
    </div>
  );
};
