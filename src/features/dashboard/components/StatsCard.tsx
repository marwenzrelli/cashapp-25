
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  gradientFrom: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradientFrom 
}: StatsCardProps) => {
  return (
    <Card className={`bg-gradient-to-br from-${gradientFrom}-50 to-transparent dark:from-${gradientFrom}-950/20`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
};
