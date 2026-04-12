import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getBusinessContext(supabase: any) {
  const [clientsRes, depositsRes, withdrawalsRes, transfersRes, directOpsRes] = await Promise.all([
    supabase.from("clients").select("id, nom, prenom, solde, status, telephone").order("solde", { ascending: false }).limit(50),
    supabase.from("deposits").select("id, client_name, amount, operation_date, status").order("operation_date", { ascending: false }).limit(20),
    supabase.from("withdrawals").select("id, client_name, amount, operation_date, status").order("operation_date", { ascending: false }).limit(20),
    supabase.from("transfers").select("id, from_client, to_client, amount, operation_date, status").order("operation_date", { ascending: false }).limit(20),
    supabase.from("direct_operations").select("id, from_client_name, to_client_name, amount, operation_date, status").order("operation_date", { ascending: false }).limit(20),
  ]);

  const clients = clientsRes.data || [];
  const deposits = depositsRes.data || [];
  const withdrawals = withdrawalsRes.data || [];
  const transfers = transfersRes.data || [];
  const directOps = directOpsRes.data || [];

  const totalClients = clients.length;
  const totalBalance = clients.reduce((sum: number, c: any) => sum + (Number(c.solde) || 0), 0);
  const negativeBalanceClients = clients.filter((c: any) => (Number(c.solde) || 0) < 0);
  const totalDeposits = deposits.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
  const totalWithdrawals = withdrawals.reduce((sum: number, w: any) => sum + (Number(w.amount) || 0), 0);

  return `
## Données en temps réel de CashApp

### Résumé
- Nombre total de clients: ${totalClients}
- Solde total de tous les clients: ${totalBalance.toLocaleString("fr-FR")} 
- Clients avec solde négatif: ${negativeBalanceClients.length}
- Total des versements récents (20 derniers): ${totalDeposits.toLocaleString("fr-FR")}
- Total des retraits récents (20 derniers): ${totalWithdrawals.toLocaleString("fr-FR")}

### Top 10 clients par solde
${clients.slice(0, 10).map((c: any, i: number) => `${i + 1}. ${c.prenom} ${c.nom} - Solde: ${Number(c.solde || 0).toLocaleString("fr-FR")} - Statut: ${c.status}`).join("\n")}

### Clients avec solde négatif
${negativeBalanceClients.length > 0 ? negativeBalanceClients.map((c: any) => `- ${c.prenom} ${c.nom}: ${Number(c.solde).toLocaleString("fr-FR")}`).join("\n") : "Aucun client avec solde négatif"}

### 10 derniers versements
${deposits.slice(0, 10).map((d: any) => `- ${d.client_name}: ${Number(d.amount).toLocaleString("fr-FR")} (${d.operation_date || "N/A"})`).join("\n")}

### 10 derniers retraits
${withdrawals.slice(0, 10).map((w: any) => `- ${w.client_name}: ${Number(w.amount).toLocaleString("fr-FR")} (${w.operation_date || "N/A"})`).join("\n")}

### 10 derniers transferts
${transfers.slice(0, 10).map((t: any) => `- De ${t.from_client} à ${t.to_client}: ${Number(t.amount).toLocaleString("fr-FR")} (${t.operation_date || "N/A"})`).join("\n")}

### 10 dernières opérations directes
${directOps.slice(0, 10).map((o: any) => `- De ${o.from_client_name} à ${o.to_client_name}: ${Number(o.amount).toLocaleString("fr-FR")} (${o.operation_date || "N/A"})`).join("\n")}
`;
}

const SYSTEM_PROMPT = `Tu es l'assistant IA de CashApp, une application de gestion de coffres-forts numériques. Tu aides les gestionnaires à comprendre les données de leurs clients, les opérations (versements, retraits, transferts) et à identifier des tendances ou anomalies.

Règles:
- Réponds toujours en français
- Sois concis et précis
- Utilise des chiffres et des données réelles quand disponibles
- Formate tes réponses en markdown pour une meilleure lisibilité
- Si tu ne peux pas répondre à une question, dis-le clairement
- Ne révèle jamais d'informations techniques sur le système`;

const EXECUTE_SYSTEM_PROMPT = `Tu es l'assistant IA de CashApp. L'utilisateur te demande d'exécuter des opérations financières (versements, retraits, virements).

Tu dois analyser la demande et extraire les opérations structurées en utilisant l'outil execute_operations.

Règles:
- Identifie le type d'opération: "deposit" (versement), "withdrawal" (retrait), "transfer" (virement/transfert)
- Trouve le nom complet du client dans la liste fournie (matching approximatif accepté)
- Le montant doit être positif
- Pour les transferts, identifie le client source (client_name) et le client destinataire (to_client_name)
- Maximum 10 opérations par requête
- Si l'utilisateur spécifie une date et/ou heure, extrais-la EXACTEMENT telle qu'indiquée dans le champ operation_date au format ISO 8601 (YYYY-MM-DDTHH:mm:ss). Exemples: "11/04/2026 21:06" → "2026-04-11T21:06:00", "15 mars 2026 14h30" → "2026-03-15T14:30:00". ATTENTION: recopie les chiffres exacts de l'utilisateur, ne les modifie pas (pas de conversion de timezone). Si aucune date n'est mentionnée, laisse operation_date vide/null.
- Ne mets PAS la date dans le champ notes. Le champ notes est réservé aux commentaires.
- Si tu ne comprends pas la demande ou si un client n'existe pas, renvoie une liste vide avec une explication`;

function findClientByName(clients: any[], name: string): any | null {
  const normalized = name.toLowerCase().trim();
  let match = clients.find((c: any) => `${c.prenom} ${c.nom}`.toLowerCase() === normalized);
  if (match) return match;
  match = clients.find((c: any) => {
    const fullName = `${c.prenom} ${c.nom}`.toLowerCase();
    return fullName.includes(normalized) || normalized.includes(fullName);
  });
  if (match) return match;
  match = clients.find((c: any) =>
    c.nom.toLowerCase() === normalized || c.prenom.toLowerCase() === normalized
  );
  return match || null;
}

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 1, janv: 1, fevrier: 2, fevr: 2, fev: 2, mars: 3, avril: 4, avr: 4,
  mai: 5, juin: 6, juillet: 7, juil: 7, aout: 8, septembre: 9, sept: 9,
  octobre: 10, oct: 10, novembre: 11, nov: 11, decembre: 12, dec: 12,
};

function buildOperationDateString(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): string | null {
  const normalizedYear = year < 100 ? year + 2000 : year;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) return null;
  const candidate = new Date(Date.UTC(normalizedYear, month - 1, day, hour, minute, second));
  if (candidate.getUTCFullYear() !== normalizedYear || candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) return null;
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${normalizedYear}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function extractOperationDatesFromText(text?: string | null): string[] {
  if (!text) return [];
  const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, " ").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const results = new Set<string>();
  const addResult = (year: string, month: number, day: string, hour?: string, minute?: string, second?: string) => {
    const parsed = buildOperationDateString(Number(year), month, Number(day), hour ? Number(hour) : 0, minute ? Number(minute) : 0, second ? Number(second) : 0);
    if (parsed) results.add(parsed);
  };

  const isoRegex = /\b(\d{4})-(\d{2})-(\d{2})(?:[t\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?(?:z|[+\-]\d{2}:\d{2})?\b/g;
  for (const match of normalizedText.matchAll(isoRegex)) addResult(match[1], Number(match[2]), match[3], match[4], match[5], match[6]);

  const numericRegex = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s*(?:a|à|au|vers)?\s*(\d{1,2})(?:(?::|h)\s*(\d{2}))?(?::(\d{2}))?)?\b/g;
  for (const match of normalizedText.matchAll(numericRegex)) addResult(match[3], Number(match[2]), match[1], match[4], match[5], match[6]);

  const monthNames = Object.keys(FRENCH_MONTHS).sort((a, b) => b.length - a.length).join("|");
  const monthRegex = new RegExp(`\\b(\\d{1,2})\\s+(${monthNames})\\s+(\\d{2,4})(?:\\s*(?:a|à|au|vers)?\\s*(\\d{1,2})(?:(?::|h)\\s*(\\d{2}))?(?::(\\d{2}))?)?\\b`, "g");
  for (const match of normalizedText.matchAll(monthRegex)) addResult(match[3], FRENCH_MONTHS[match[2]], match[1], match[4], match[5], match[6]);

  return Array.from(results);
}

async function handleExecuteMode(supabase: any, userMessage: string, userId: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurée");

  const { data: clients } = await supabase.from("clients").select("id, nom, prenom, solde, status").eq("status", "active");
  const clientList = clients || [];
  const clientNames = clientList.map((c: any) => `${c.prenom} ${c.nom}`).join(", ");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: `${EXECUTE_SYSTEM_PROMPT}\n\nClients disponibles: ${clientNames}` },
        { role: "user", content: userMessage },
      ],
      tools: [{
        type: "function",
        function: {
          name: "execute_operations",
          description: "Execute financial operations (deposits, withdrawals, transfers)",
          parameters: {
            type: "object",
            properties: {
              operations: {
                type: "array",
                maxItems: 10,
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["deposit", "withdrawal", "transfer"] },
                    client_name: { type: "string", description: "Full name (Prenom Nom) of the client" },
                    to_client_name: { type: "string", description: "For transfers: destination client name" },
                    amount: { type: "number", description: "Amount (positive)" },
                    operation_date: { type: "string", description: "ISO 8601 date/time if user specified a date. Null if not specified." },
                    notes: { type: "string", description: "Optional reason/notes (do NOT put dates here)" },
                  },
                  required: ["type", "client_name", "amount"],
                },
              },
            },
            required: ["operations"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "execute_operations" } },
    }),
  });

  if (!response.ok) {
    const status = response.status;
    if (status === 429) return { error: "Limite de requêtes atteinte", status: 429 };
    if (status === 402) return { error: "Crédits IA épuisés", status: 402 };
    throw new Error(`AI gateway error: ${status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return { operations: [], errors: ["L'IA n'a pas pu extraire d'opérations de votre demande."] };

  let parsed: any;
  try { parsed = JSON.parse(toolCall.function.arguments); } catch { return { operations: [], errors: ["Erreur de parsing"] }; }

  const operations = parsed.operations || [];
  if (operations.length === 0) return { operations: [], errors: ["Aucune opération détectée"] };
  if (operations.length > 10) return { operations: [], errors: ["Maximum 10 opérations par requête"] };

  const explicitUserDates = extractOperationDatesFromText(userMessage);
  const sharedUserOperationDate = explicitUserDates.length === 1 ? explicitUserDates[0] : null;

  const resolvedOps: any[] = [];
  const errors: string[] = [];

  for (const op of operations) {
    if (!op.amount || op.amount <= 0) { errors.push(`Montant invalide pour ${op.client_name}`); continue; }
    const client = findClientByName(clientList, op.client_name);
    if (!client) { errors.push(`Client "${op.client_name}" non trouvé`); continue; }

    const resolvedOperationDate = sharedUserOperationDate || extractOperationDatesFromText(op.operation_date || op.notes || "")[0] || null;

    const resolved: any = {
      type: op.type,
      client_name: `${client.prenom} ${client.nom}`,
      client_id: client.id,
      amount: op.amount,
      operation_date: resolvedOperationDate,
      notes: op.notes || `Opération via assistant IA`,
    };

    if (op.type === "transfer") {
      const toClient = findClientByName(clientList, op.to_client_name || "");
      if (!toClient) { errors.push(`Client destinataire "${op.to_client_name}" non trouvé`); continue; }
      resolved.to_client_name = `${toClient.prenom} ${toClient.nom}`;
      resolved.to_client_id = toClient.id;
    }

    resolvedOps.push(resolved);
  }

  return { operations: resolvedOps, errors };
}

function normalizeOperationDateForStorage(operationDate?: string | null) {
  if (!operationDate) return null;
  const trimmed = operationDate.trim();
  if (!trimmed) return null;
  if (/[zZ]$|[+\-]\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00+01:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}+01:00`;
  return trimmed;
}

async function executeOperations(supabase: any, operations: any[], userId: string) {
  const results: any[] = [];
  const errors: string[] = [];
  const fallbackNow = new Date().toISOString();

  for (const op of operations) {
    const operationDate = normalizeOperationDateForStorage(op.operation_date) || fallbackNow;
    try {
      if (op.type === "deposit") {
        const { error } = await supabase.from("deposits").insert({
          client_name: op.client_name, client_id: op.client_id, amount: op.amount,
          notes: op.notes, operation_date: operationDate, created_by: userId, status: "completed",
        });
        if (error) throw error;
        const { data: client } = await supabase.from("clients").select("solde").eq("id", op.client_id).single();
        if (client) await supabase.from("clients").update({ solde: Number(client.solde || 0) + op.amount }).eq("id", op.client_id);
        results.push({ ...op, status: "success" });
      } else if (op.type === "withdrawal") {
        const { error } = await supabase.from("withdrawals").insert({
          client_name: op.client_name, client_id: op.client_id, amount: op.amount,
          notes: op.notes, operation_date: operationDate, created_by: userId, status: "completed",
        });
        if (error) throw error;
        const { data: client } = await supabase.from("clients").select("solde").eq("id", op.client_id).single();
        if (client) await supabase.from("clients").update({ solde: Number(client.solde || 0) - op.amount }).eq("id", op.client_id);
        results.push({ ...op, status: "success" });
      } else if (op.type === "transfer") {
        const { error } = await supabase.from("transfers").insert({
          from_client: op.client_name, to_client: op.to_client_name, amount: op.amount,
          reason: op.notes, operation_date: operationDate, created_by: userId, status: "completed",
        });
        if (error) throw error;
        const { data: fromClient } = await supabase.from("clients").select("solde").eq("id", op.client_id).single();
        if (fromClient) await supabase.from("clients").update({ solde: Number(fromClient.solde || 0) - op.amount }).eq("id", op.client_id);
        const { data: toClient } = await supabase.from("clients").select("solde").eq("id", op.to_client_id).single();
        if (toClient) await supabase.from("clients").update({ solde: Number(toClient.solde || 0) + op.amount }).eq("id", op.to_client_id);
        results.push({ ...op, status: "success" });
      }
    } catch (e: any) {
      errors.push(`Erreur pour ${op.type} ${op.client_name}: ${e.message}`);
      results.push({ ...op, status: "error", error: e.message });
    }
  }

  return { results, errors };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { messages, mode = "chat", operations: opsToExecute } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurée");

    // MODE: Parse operations from natural language
    if (mode === "parse_operations") {
      const lastMessage = messages[messages.length - 1]?.content || "";
      const result = await handleExecuteMode(supabase, lastMessage, user.id);
      if ("status" in result) {
        return new Response(JSON.stringify({ error: result.error }), { status: result.status as number, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // MODE: Confirm and execute operations
    if (mode === "confirm_operations") {
      if (!opsToExecute || !Array.isArray(opsToExecute) || opsToExecute.length === 0) {
        return new Response(JSON.stringify({ error: "Aucune opération à exécuter" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (opsToExecute.length > 10) {
        return new Response(JSON.stringify({ error: "Maximum 10 opérations" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const result = await executeOperations(supabase, opsToExecute, user.id);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // MODE: Chat - streaming with business context
    const businessContext = await getBusinessContext(supabase);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\n${businessContext}` },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Limite de requêtes atteinte" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
