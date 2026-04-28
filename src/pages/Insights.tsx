import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle, RefreshCcw, Sparkles, TrendingUp, Repeat, UserMinus, Copy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Anomaly {
  type: "high_amount" | "negative_balance" | "high_frequency" | "duplicate_suspect";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  client?: string;
  amount?: number;
  date?: string;
}

const severityColor: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-700 border-blue-200",
  medium: "bg-amber-500/10 text-amber-700 border-amber-200",
  high: "bg-red-500/10 text-red-700 border-red-200",
};

const typeIcon: Record<string, any> = {
  high_amount: TrendingUp,
  negative_balance: UserMinus,
  high_frequency: Repeat,
  duplicate_suspect: Copy,
};

const InsightsPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const loadData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("ai-insights", {
        body: { mode: "all" },
      });
      if (invokeError) throw invokeError;
      setAnomalies(data.anomalies || []);
      setInsights(data.insights || "");
      if (refresh) toast.success("Insights actualisés");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors du chargement");
      toast.error("Erreur lors du chargement des insights");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupedAnomalies = anomalies.reduce<Record<string, Anomaly[]>>((acc, a) => {
    if (!acc[a.severity]) acc[a.severity] = [];
    acc[a.severity].push(a);
    return acc;
  }, {});

  const order: ("high" | "medium" | "low")[] = ["high", "medium", "low"];

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-amber-500" />
            Insights IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Détection d'anomalies et résumé quotidien généré par l'IA
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          className="gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-700">{error}</CardContent>
        </Card>
      )}

      {/* Daily Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Résumé quotidien
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{insights || "Aucun insight disponible."}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Anomalies détectées
            {!loading && (
              <Badge variant="outline" className="ml-2">
                {anomalies.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : anomalies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              ✅ Aucune anomalie détectée sur les 30 derniers jours.
            </div>
          ) : (
            <div className="space-y-6">
              {order.map((sev) => {
                const items = groupedAnomalies[sev];
                if (!items?.length) return null;
                const sevLabel = sev === "high" ? "Critique" : sev === "medium" ? "Modérée" : "Faible";
                return (
                  <div key={sev} className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      {sevLabel} ({items.length})
                    </h3>
                    {items.map((a, idx) => {
                      const Icon = typeIcon[a.type] || AlertTriangle;
                      return (
                        <div
                          key={`${sev}-${idx}`}
                          className={`flex items-start gap-3 p-4 rounded-lg border ${severityColor[a.severity]}`}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{a.title}</div>
                            <div className="text-sm opacity-90 mt-1">{a.description}</div>
                            {a.date && (
                              <div className="text-xs opacity-70 mt-1">
                                {new Date(a.date).toLocaleString("fr-FR")}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsPage;
