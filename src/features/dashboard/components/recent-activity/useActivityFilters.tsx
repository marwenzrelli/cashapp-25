
import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";
import { RecentActivity } from "../../types";

export const useActivityFilters = (activities: RecentActivity[]) => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [operationType, setOperationType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Temporary states for filters before validation
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempOperationType, setTempOperationType] = useState<string | null>(null);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);

  // Initialize temporary filters when component mounts or when actual filters change
  useEffect(() => {
    setTempSearchTerm(searchTerm);
    setTempOperationType(operationType);
    setTempDateRange(dateRange);
  }, [searchTerm, operationType, dateRange]);

  // Apply filters when OK button is clicked
  const applyFilters = () => {
    setSearchTerm(tempSearchTerm);
    setOperationType(tempOperationType);
    setDateRange(tempDateRange);
  };

  // Filter activities based on search and filters
  const filteredActivities = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    console.log(`Filtering ${activities.length} activities with searchTerm=${searchTerm}, operationType=${operationType}, dateRange present: ${!!dateRange?.from && !!dateRange?.to}`);

    return activities.filter(activity => {
      // Filter by search term
      const searchMatch = !searchTerm || 
        activity.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by operation type
      const typeMatch = !operationType || activity.type === operationType;

      // Filter by date range with time consideration
      let dateMatch = true;
      if (dateRange?.from && dateRange?.to) {
        try {
          const activityDate = parseISO(activity.date);
          
          // Check if date is valid
          if (isNaN(activityDate.getTime())) {
            console.error(`Invalid activity date: ${activity.date}`);
            return false;
          }
          
          // Use the exact date-time from the range picker (no startOfDay/endOfDay)
          const startDate = new Date(dateRange.from);
          const endDate = new Date(dateRange.to);
          
          dateMatch = isWithinInterval(activityDate, { 
            start: startDate, 
            end: endDate 
          });
          
          if (!dateMatch) {
            console.log(`Activity excluded - date ${activityDate.toISOString()} outside range ${startDate.toISOString()} to ${endDate.toISOString()}`);
          }
        } catch (error) {
          console.error("Error parsing date:", error);
          dateMatch = false;
        }
      }

      return searchMatch && typeMatch && dateMatch;
    });
  }, [activities, searchTerm, operationType, dateRange]);

  return {
    searchTerm,
    setSearchTerm,
    operationType,
    setOperationType,
    dateRange, 
    setDateRange,
    tempSearchTerm,
    setTempSearchTerm,
    tempOperationType,
    setTempOperationType,
    tempDateRange,
    setTempDateRange,
    applyFilters,
    filteredActivities
  };
};
