
import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { type Suggestion } from "../types";

interface TransferSuggestionsProps {
  suggestions: Suggestion[];
  onApply: (suggestion: Suggestion) => void;
}

export const TransferSuggestions = ({
  suggestions,
  onApply
}: TransferSuggestionsProps) => {
  const handleApply = (suggestion: Suggestion) => {
    onApply(suggestion);
    toast.success("Suggestion appliquée !");
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-semibold">Suggestions IA</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 bg-white dark:bg-gray-900 rounded-b-lg">
        <div className="text-center text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
          <p>Aucune suggestion disponible pour le moment</p>
          <p className="text-sm mt-2">Les suggestions IA apparaîtront ici</p>
        </div>
      </CardContent>
    </Card>
  );
};
