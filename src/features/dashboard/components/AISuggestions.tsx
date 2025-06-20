
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Sparkles, TrendingUp, TrendingDown, Users, DollarSign, Clock } from "lucide-react";
import { DashboardStats } from "../types";

interface AISuggestionsProps {
  stats: DashboardStats;
}

export const AISuggestions = ({
  stats
}: AISuggestionsProps) => {
  const generateSuggestions = () => {
    const suggestions = [];

    // Analyse des flux financiers
    const depositsAmount = stats.total_deposits_amount || 0;
    const withdrawalsAmount = stats.total_withdrawals_amount || 0;
    const balanceRatio = depositsAmount > 0 ? withdrawalsAmount / depositsAmount * 100 : 0;
    
    if (balanceRatio > 80) {
      suggestions.push({
        id: 1,
        type: "warning",
        icon: <TrendingDown className="h-5 w-5 text-orange-500" />,
        title: "Flux de sorties élevé",
        message: `Les retraits représentent ${balanceRatio.toFixed(0)}% des versements. Surveillez la trésorerie.`,
        color: "border-orange-200 bg-orange-50 dark:bg-orange-950/20"
      });
    } else if (balanceRatio < 30) {
      suggestions.push({
        id: 2,
        type: "success",
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        title: "Excellente croissance",
        message: `Faible ratio de retrait (${balanceRatio.toFixed(0)}%). Bonne accumulation de fonds.`,
        color: "border-green-200 bg-green-50 dark:bg-green-950/20"
      });
    }

    // Analyse de l'activité client
    if (stats.client_count > 0 && stats.total_deposits > 0) {
      const avgDepositsPerClient = stats.total_deposits / stats.client_count;
      if (avgDepositsPerClient < 2) {
        suggestions.push({
          id: 3,
          type: "info",
          icon: <Users className="h-5 w-5 text-blue-500" />,
          title: "Activité client faible",
          message: `Moyenne de ${avgDepositsPerClient.toFixed(1)} versements par client. Considérez des campagnes d'engagement.`,
          color: "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
        });
      }
    }

    // Analyse des montants moyens
    if (stats.total_deposits > 0 && depositsAmount > 0) {
      const avgDepositAmount = depositsAmount / stats.total_deposits;
      if (avgDepositAmount < 1000) {
        suggestions.push({
          id: 4,
          type: "info",
          icon: <DollarSign className="h-5 w-5 text-purple-500" />,
          title: "Petits montants",
          message: `Montant moyen des versements: ${avgDepositAmount.toFixed(0)} TND. Opportunité d'encourager des montants plus élevés.`,
          color: "border-purple-200 bg-purple-50 dark:bg-purple-950/20"
        });
      }
    }

    // Analyse des virements
    if (stats.transfer_count > 0 && stats.sent_transfers > 0) {
      const avgTransferAmount = stats.sent_transfers / stats.transfer_count;
      suggestions.push({
        id: 5,
        type: "info",
        icon: <Clock className="h-5 w-5 text-indigo-500" />,
        title: "Activité de virements",
        message: `${stats.transfer_count} virements effectués avec un montant moyen de ${avgTransferAmount.toFixed(0)} TND.`,
        color: "border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20"
      });
    }

    // Suggestion générale si peu d'activité
    if (stats.total_deposits + stats.total_withdrawals + stats.transfer_count < 10) {
      suggestions.push({
        id: 6,
        type: "info",
        icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
        title: "Activité limitée",
        message: "Peu d'opérations détectées. Pensez à promouvoir les services auprès des clients.",
        color: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
      });
    }
    
    return suggestions.slice(0, 3); // Limiter à 3 suggestions
  };
  
  const suggestions = generateSuggestions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Suggestions IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border ${suggestion.color}`}
            >
              <div className="flex items-start gap-3">
                {suggestion.icon}
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune suggestion disponible pour le moment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
