
import { RecentActivity, ActivitySortOption } from "../types";

export const sortActivities = (activities: RecentActivity[], sortOption: ActivitySortOption): RecentActivity[] => {
  if (!activities || activities.length === 0) return [];
  
  const sortedActivities = [...activities];
  
  switch (sortOption) {
    case 'newest':
      return sortedActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    case 'oldest':
      return sortedActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    case 'amount-asc':
      return sortedActivities.sort((a, b) => a.amount - b.amount);
    
    case 'amount-desc':
      return sortedActivities.sort((a, b) => b.amount - a.amount);
    
    case 'type':
      return sortedActivities.sort((a, b) => {
        // Custom sort order: deposits first, then withdrawals, then transfers
        const typeOrder = { deposit: 1, withdrawal: 2, transfer: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      });
    
    case 'client':
      return sortedActivities.sort((a, b) => {
        return a.client_name.localeCompare(b.client_name);
      });
      
    default:
      return sortedActivities;
  }
};
