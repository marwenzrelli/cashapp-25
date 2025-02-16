
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { type AISuggestion } from "./types";

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onApplySuggestion: (suggestion: AISuggestion) => void;
}

export const AISuggestions = ({ suggestions, onApplySuggestion }: AISuggestionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Suggestions Intelligentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onApplySuggestion(suggestion)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium">{suggestion.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.message}
                  </p>
                </div>
                <p className="font-medium text-success">
                  {suggestion.amount.toLocaleString()} €
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
