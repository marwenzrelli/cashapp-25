
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity } from "../../types";
import { useActivityFilters } from "./useActivityFilters";
import { FilterBar } from "./FilterBar";
import { RecentActivityItem } from "./RecentActivityItem";

interface RecentActivityProps {
  activities: RecentActivity[];
  currency: string;
}

export const RecentActivityCard = ({ activities, currency }: RecentActivityProps) => {
  const {
    tempSearchTerm,
    setTempSearchTerm,
    tempOperationType,
    setTempOperationType,
    tempDateRange,
    setTempDateRange,
    applyFilters,
    filteredActivities
  } = useActivityFilters(activities);

  return (
    <Card className="w-full max-w-none">
      <CardHeader className="pb-3">
        <CardTitle>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-4">
          {/* Search and filters section */}
          <FilterBar 
            tempSearchTerm={tempSearchTerm}
            setTempSearchTerm={setTempSearchTerm}
            tempOperationType={tempOperationType}
            setTempOperationType={setTempOperationType}
            tempDateRange={tempDateRange}
            setTempDateRange={setTempDateRange}
            applyFilters={applyFilters}
          />
          
          {filteredActivities && filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <RecentActivityItem 
                key={`${activity.id}-${index}`}
                activity={activity}
                currency={currency}
                index={index}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Aucune activité récente
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
