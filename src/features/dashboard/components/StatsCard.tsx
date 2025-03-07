
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  gradientFrom?: "green" | "red" | "blue" | "purple" | "amber";
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  gradientFrom = "blue" 
}: StatsCardProps) => {
  // Déterminer si la valeur est numérique et négative
  const isNumeric = typeof value === 'number' || !isNaN(parseFloat(value as string));
  const rawValue = typeof value === 'number' ? value : parseFloat(value as string);
  const isNegative = isNumeric && !isNaN(rawValue) && rawValue < 0;
  
  // Déterminer la couleur du texte en fonction de la valeur
  const valueColorClass = isNegative ? "text-red-600 dark:text-red-400" : 
                          (title.includes("Retraits") ? "text-red-600 dark:text-red-400" : 
                          "text-green-600 dark:text-green-400");
  
  // Déterminer le gradient en fonction du type de stats
  const gradientClasses = {
    green: "from-green-50 to-transparent dark:from-green-950/20",
    red: "from-red-50 to-transparent dark:from-red-950/20",
    blue: "from-blue-50 to-transparent dark:from-blue-950/20",
    purple: "from-purple-50 to-transparent dark:from-purple-950/20",
    amber: "from-amber-50 to-transparent dark:from-amber-950/20"
  };

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
        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
};
