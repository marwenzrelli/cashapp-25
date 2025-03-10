
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { OperationsMobileCard } from "@/features/clients/components/operations-history/OperationsMobileCard";
import { RecentActivity } from "../types";
import { formatDateTime } from "@/features/operations/types";
import { formatOperationId } from "@/features/operations/utils/display-helpers";

interface RecentActivityProps {
  activities: RecentActivity[];
  currency: string;
}

export const RecentActivityCard = ({ activities, currency }: RecentActivityProps) => {
  // Function to safely format operation ID
  const safeFormatId = (id: string) => {
    try {
      return formatOperationId(id);
    } catch (error) {
      console.error("Error formatting operation ID:", error);
      return id.slice(0, 6); // Fallback to first 6 chars
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id}>
                {/* Desktop version */}
                <div className="hidden md:flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                  <div className="flex items-center gap-4">
                    {activity.type === 'deposit' && (
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                        <ArrowUpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {activity.type === 'withdrawal' && (
                      <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                        <ArrowDownCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    {activity.type === 'transfer' && (
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <ArrowLeftRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {activity.type === 'deposit' && 'Versement'}
                          {activity.type === 'withdrawal' && 'Retrait'}
                          {activity.type === 'transfer' && 'Virement'}
                        </p>
                        <span className="text-xs font-mono text-muted-foreground flex items-center">
                          <Hash className="h-3 w-3 mr-1" />
                          #{safeFormatId(activity.id)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.client_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className={cn(
                      "font-medium",
                      activity.type === 'deposit' ? "text-green-600 dark:text-green-400" :
                      activity.type === 'withdrawal' ? "text-red-600 dark:text-red-400" :
                      "text-blue-600 dark:text-blue-400"
                    )}>
                      {activity.type === 'withdrawal' ? '-' : ''}{activity.amount.toLocaleString()} {currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(activity.date)}
                    </p>
                  </div>
                </div>
                
                {/* Mobile version using OperationsMobileCard */}
                <div className="md:hidden">
                  <OperationsMobileCard 
                    operation={{
                      id: activity.id,
                      type: activity.type,
                      amount: activity.amount,
                      date: activity.date,
                      fromClient: activity.fromClient || activity.client_name,
                      toClient: activity.toClient,
                      description: activity.description || `${
                        activity.type === 'deposit' 
                          ? 'Versement pour' 
                          : activity.type === 'withdrawal' 
                            ? 'Retrait par' 
                            : 'Virement impliquant'
                      } ${activity.client_name}`
                    }}
                    formatAmount={(amount) => `${amount.toLocaleString()}`}
                    currency={currency}
                    colorClass={
                      activity.type === 'deposit' ? "text-green-600 dark:text-green-400" :
                      activity.type === 'withdrawal' ? "text-red-600 dark:text-red-400" :
                      "text-blue-600 dark:text-blue-400"
                    }
                    showId={true}
                  />
                </div>
              </div>
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
