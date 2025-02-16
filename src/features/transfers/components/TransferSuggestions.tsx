
import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { type Suggestion } from "../types";

interface TransferSuggestionsProps {
  suggestions: Suggestion[];
  onApply: (suggestion: Suggestion) => void;
}

export const TransferSuggestions = ({ suggestions, onApply }: TransferSuggestionsProps) => {
  const handleApply = (suggestion: Suggestion) => {
    onApply(suggestion);
    toast.success("Suggestion appliquée !");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Suggestions intelligentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
              onClick={() => handleApply(suggestion)}
            >
              <div className="space-y-1">
                <p className="font-medium">
                  {suggestion.fromClient} → {suggestion.toClient}
                </p>
                <p className="text-sm text-muted-foreground">
                  {suggestion.reason}
                </p>
              </div>
              <p className="font-medium">{suggestion.amount.toLocaleString()} €</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
