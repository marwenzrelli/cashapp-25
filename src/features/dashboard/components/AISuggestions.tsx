
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Sparkles } from "lucide-react";
import { DashboardStats } from "../types";

interface AISuggestionsProps {
  stats: DashboardStats;
}

export const AISuggestions = ({ stats }: AISuggestionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Suggestions IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
            <AlertCircle className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h4 className="font-medium mb-1">Analyse des tendances</h4>
              <p className="text-sm text-muted-foreground">
                {stats.total_deposits > stats.total_withdrawals 
                  ? "Les versements sont supérieurs aux retraits, ce qui indique une bonne santé financière."
                  : "Les retraits sont supérieurs aux versements, surveillez les flux de trésorerie."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
