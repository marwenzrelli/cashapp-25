
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
    case 'category':
      // Custom sorting for versements/retraits/virements (deposits/withdrawals/transfers)
      return activitiesToSort.sort((a, b) => {
        // Define display order: deposits first, then withdrawals, then transfers
        const categoryOrder = {
          deposit: 1,
          withdrawal: 2,
          transfer: 3
        };
        return categoryOrder[a.type] - categoryOrder[b.type];
      });
    case 'client':
      return activitiesToSort.sort((a, b) => a.client_name.localeCompare(b.client_name));
    default:
      return activitiesToSort;
  }
};
