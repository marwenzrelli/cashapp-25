
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  gradientFrom: string;
}

export const StatCard = ({ title, value, icon: Icon, iconColor, gradientFrom }: StatCardProps) => {
  const getAmountColor = (amount: number) => {
    if (amount > 0) return "text-green-600 dark:text-green-400";
    if (amount < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Card className="shadow-md overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br from-${gradientFrom} to-transparent dark:from-${gradientFrom}/20 opacity-70`}></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent className="relative z-10">
        <div className={cn(
          "text-2xl font-bold",
          getAmountColor(value)
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
};
