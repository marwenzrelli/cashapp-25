
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
    <Card className="shadow-md overflow-hidden border-primary/5">
      <div className={`absolute inset-0 bg-gradient-to-br from-${gradientFrom}-50 to-transparent dark:from-${gradientFrom}-950/20 opacity-70`}></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="relative z-10">{icon}</div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
};
