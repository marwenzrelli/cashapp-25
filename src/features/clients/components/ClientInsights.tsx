
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Sparkles } from "lucide-react";
import { AISuggestion } from "../types";

interface ClientInsightsProps {
  suggestions: AISuggestion[];
}

const getSuggestionStyle = (type: AISuggestion["type"]) => {
  switch (type) {
    case "success":
      return "border-green-200 bg-green-50 dark:bg-green-950/20";
    case "warning":
      return "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20";
    case "info":
      return "border-blue-200 bg-blue-50 dark:bg-blue-950/20";
  }
};

export const ClientInsights = ({ suggestions }: ClientInsightsProps) => {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Insights IA
        </CardTitle>
        <CardDescription>
          Analyses et recommandations personnalisées
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${getSuggestionStyle(suggestion.type)}`}
            >
              <div className="flex items-start gap-3">
                {suggestion.type === "warning" ? (
                  <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                ) : (
                  <Sparkles className="h-5 w-5 text-green-500 shrink-0" />
                )}
                <p className="font-medium">{suggestion.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
