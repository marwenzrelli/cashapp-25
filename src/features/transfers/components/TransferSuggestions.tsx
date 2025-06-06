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
  return;
};