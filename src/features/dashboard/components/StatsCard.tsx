
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  gradientFrom?: "green" | "red" | "blue" | "purple" | "amber";
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  gradientFrom = "blue",
  onRecalculate,
  isRecalculating = false
}: StatsCardProps) => {
  // Determine if the value is numeric and negative
  const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value as string));
  const rawValue = typeof value === 'number' ? value : parseFloat(value as string);
  const isNegative = isNumeric && !isNaN(rawValue) && rawValue < 0;
  
  // Determine text color based on value and card type
  const valueColorClass = isNegative || title.includes("Retraits") || title.includes("Émis") 
    ? "text-red-600 dark:text-red-400" 
    : "text-green-600 dark:text-green-400";
  
  // Determine gradient based on stats type
  const gradientClasses = {
    green: "from-green-50 to-transparent dark:from-green-950/20",
    red: "from-red-50 to-transparent dark:from-red-950/20",
    blue: "from-blue-50 to-transparent dark:from-blue-950/20",
    purple: "from-purple-50 to-transparent dark:from-purple-950/20",
    amber: "from-amber-50 to-transparent dark:from-amber-950/20"
  };

  // Only show recalculate button for Solde Général (title check)
  const showRecalculate = onRecalculate && title === "Solde Général";

  return (
    <Card className={`bg-gradient-to-br ${gradientClasses[gradientFrom]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          valueColorClass
        )}>
          {value}
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
          
          {showRecalculate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRecalculate}
              disabled={isRecalculating}
              className="mt-2 md:mt-0 w-full md:w-auto text-xs"
            >
              <RotateCw className={`h-3 w-3 mr-1 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalcul...' : 'Recalculer tous les soldes'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
