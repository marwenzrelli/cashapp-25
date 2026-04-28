import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Anomaly {
  type: "high_amount" | "negative_balance" | "high_frequency" | "duplicate_suspect";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  client?: string;
  amount?: number;
  date?: string;
}

async function detectAnomalies(supabase: any): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  // Fetch recent operations (last 30 days)
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [depRes, witRes, traRes, clientsRes] = await Promise.all([
    supabase.from("deposits").select("id, client_name, amount, operation_date").gte("operation_date", sinceIso).eq("status", "completed"),
    supabase.from("withdrawals").select("id, client_name, amount, operation_date").gte("operation_date", sinceIso).eq("status", "completed"),
    supabase.from("transfers").select("id, from_client, to_client, amount, operation_date").gte("operation_date", sinceIso).eq("status", "completed"),
    supabase.from("clients").select("id, prenom, nom, solde").lt("solde", 0),
  ]);

  const deposits = depRes.data || [];
  const withdrawals = witRes.data || [];
  const transfers = traRes.data || [];
  const negativeClients = clientsRes.data || [];

  // 1. Negative balance clients
  for (const c of negativeClients) {
    anomalies.push({
      type: "negative_balance",
      severity: Math.abs(c.solde) > 1000 ? "high" : "medium",
      title: `Solde négatif : ${c.prenom} ${c.nom}`,
      description: `Le client a un solde de ${Number(c.solde).toLocaleString("fr-FR")}.`,
      client: `${c.prenom} ${c.nom}`,
      amount: Number(c.solde),
    });
  }

  // 2. High amount detection - compute mean+stdev for deposits & withdrawals
  const allOps = [
    ...deposits.map((d: any) => ({ ...d, kind: "deposit", client: d.client_name })),
    ...withdrawals.map((w: any) => ({ ...w, kind: "withdrawal", client: w.client_name })),
    ...transfers.map((t: any) => ({ ...t, kind: "transfer", client: t.from_client })),
  ];

  if (allOps.length > 5) {
    const amounts = allOps.map((o: any) => Number(o.amount) || 0);
    const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const variance = amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length;
    const stdev = Math.sqrt(variance);
    const threshold = mean + 2.5 * stdev;

    const outliers = allOps
      .filter((o: any) => Number(o.amount) > threshold && Number(o.amount) > 500)
      .sort((a: any, b: any) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);

    for (const o of outliers) {
      anomalies.push({
        type: "high_amount",
        severity: "medium",
        title: `Montant inhabituel`,
        description: `${o.kind === "deposit" ? "Versement" : o.kind === "withdrawal" ? "Retrait" : "Virement"} de ${Number(o.amount).toLocaleString("fr-FR")} pour ${o.client} (moyenne: ${Math.round(mean).toLocaleString("fr-FR")}).`,
        client: o.client,
        amount: Number(o.amount),
        date: o.operation_date,
      });
    }
  }

  // 3. High frequency: same client > 5 ops in 24h
  const opsByClient = new Map<string, any[]>();
  for (const o of allOps) {
    if (!opsByClient.has(o.client)) opsByClient.set(o.client, []);
    opsByClient.get(o.client)!.push(o);
  }

  for (const [client, ops] of opsByClient.entries()) {
    if (ops.length < 5) continue;
    const sorted = ops.sort((a: any, b: any) => new Date(a.operation_date).getTime() - new Date(b.operation_date).getTime());
    for (let i = 0; i <= sorted.length - 5; i++) {
      const window = sorted.slice(i, i + 5);
      const span = new Date(window[4].operation_date).getTime() - new Date(window[0].operation_date).getTime();
      if (span < 24 * 60 * 60 * 1000) {
        anomalies.push({
          type: "high_frequency",
          severity: "medium",
          title: `Fréquence élevée : ${client}`,
          description: `${window.length} opérations en moins de 24h (entre le ${new Date(window[0].operation_date).toLocaleDateString("fr-FR")} et le ${new Date(window[4].operation_date).toLocaleDateString("fr-FR")}).`,
          client,
        });
        break;
      }
    }
  }

  // 4. Possible duplicates: same client + same amount within 5 minutes
  const sortedAll = [...allOps].sort((a: any, b: any) => new Date(a.operation_date).getTime() - new Date(b.operation_date).getTime());
  for (let i = 0; i < sortedAll.length - 1; i++) {
    const a = sortedAll[i];
    const b = sortedAll[i + 1];
    if (a.client === b.client && a.kind === b.kind && Number(a.amount) === Number(b.amount)) {
      const diff = new Date(b.operation_date).getTime() - new Date(a.operation_date).getTime();
      if (diff < 5 * 60 * 1000) {
        anomalies.push({
          type: "duplicate_suspect",
          severity: "high",
          title: `Doublon suspect : ${a.client}`,
          description: `Deux ${a.kind === "deposit" ? "versements" : a.kind === "withdrawal" ? "retraits" : "virements"} identiques de ${Number(a.amount).toLocaleString("fr-FR")} en moins de 5 minutes.`,
          client: a.client,
          amount: Number(a.amount),
          date: a.operation_date,
        });
      }
    }
  }

  return anomalies;
}

async function generateDailyInsights(supabase: any): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurée");

  // Get aggregate stats
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7 = new Date(today);
  last7.setDate(last7.getDate() - 7);
  const last30 = new Date(today);
  last30.setDate(last30.getDate() - 30);

  const [stats, dep7, wit7, dep30, wit30, topClients] = await Promise.all([
    supabase.rpc("get_dashboard_stats"),
    supabase.from("deposits").select("amount").gte("operation_date", last7.toISOString()).eq("status", "completed"),
    supabase.from("withdrawals").select("amount").gte("operation_date", last7.toISOString()).eq("status", "completed"),
    supabase.from("deposits").select("amount").gte("operation_date", last30.toISOString()).eq("status", "completed"),
    supabase.from("withdrawals").select("amount").gte("operation_date", last30.toISOString()).eq("status", "completed"),
    supabase.from("clients").select("prenom, nom, solde").order("solde", { ascending: false }).limit(5),
  ]);

  const sum = (arr: any[]) => arr.reduce((s, x) => s + Number(x.amount || 0), 0);
  const dep7Total = sum(dep7.data || []);
  const wit7Total = sum(wit7.data || []);
  const dep30Total = sum(dep30.data || []);
  const wit30Total = sum(wit30.data || []);

  const context = `
Stats globales: ${JSON.stringify(stats.data)}
7 derniers jours - Versements: ${dep7Total}, Retraits: ${wit7Total} (${(dep7.data || []).length} dépôts, ${(wit7.data || []).length} retraits)
30 derniers jours - Versements: ${dep30Total}, Retraits: ${wit30Total}
Top 5 clients par solde: ${(topClients.data || []).map((c: any) => `${c.prenom} ${c.nom} (${c.solde})`).join(", ")}
`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: "Tu es un analyste financier. Génère un résumé quotidien CONCIS en markdown (max 300 mots) avec : 1) Synthèse de l'activité, 2) Tendances clés (comparaison 7j vs 30j), 3) Top clients à surveiller, 4) Recommandations actionnables. Utilise des emojis et des bullet points. Réponds en français.",
        },
        { role: "user", content: `Voici les données du système CashApp:\n${context}\n\nGénère le résumé d'insights quotidien.` },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) return "⚠️ Limite de requêtes IA atteinte. Réessayez dans quelques instants.";
    if (response.status === 402) return "⚠️ Crédits IA épuisés. Veuillez recharger votre compte.";
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Aucun insight disponible.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "all";

    const result: any = {};

    if (mode === "all" || mode === "anomalies") {
      result.anomalies = await detectAnomalies(supabase);
    }
    if (mode === "all" || mode === "insights") {
      result.insights = await generateDailyInsights(supabase);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur serveur" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
