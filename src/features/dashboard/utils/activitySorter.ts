
import { RecentActivity, SortOption } from "../types";

export const sortActivities = (activities: RecentActivity[], option: SortOption): RecentActivity[] => {
  const activitiesToSort = [...activities];

  switch (option) {
    case 'date-asc':
      return activitiesToSort.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case 'date-desc':
      return activitiesToSort.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case 'amount-asc':
      return activitiesToSort.sort((a, b) => a.amount - b.amount);
    case 'amount-desc':
      return activitiesToSort.sort((a, b) => b.amount - a.amount);
    case 'type':
      return activitiesToSort.sort((a, b) => a.type.localeCompare(b.type));
    case 'type-desc':
      return activitiesToSort.sort((a, b) => b.type.localeCompare(a.type));
    case 'client':
      return activitiesToSort.sort((a, b) => a.client_name.localeCompare(b.client_name));
    case 'category':
      // Custom sorting order: deposits first, then withdrawals, then transfers
      return activitiesToSort.sort((a, b) => {
        const typeOrder = { deposit: 1, withdrawal: 2, transfer: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
    default:
      return activitiesToSort;
  }
};
