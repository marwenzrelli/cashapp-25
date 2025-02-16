
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  gradientFrom: string;
}

export const StatCard = ({ title, value, icon: Icon, iconColor, gradientFrom }: StatCardProps) => {
  return (
    <Card className={`bg-gradient-to-br from-${gradientFrom} to-transparent dark:from-${gradientFrom}/20`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};
