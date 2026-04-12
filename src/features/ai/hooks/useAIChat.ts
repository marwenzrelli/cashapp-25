import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export type Msg = { role: "user" | "assistant"; content: string };

export type Operation = {
  type: "deposit" | "withdrawal" | "transfer";
  client_name: string;
  to_client_name?: string;
  client_id: number;
  to_client_id?: number;
  amount: number;
  operation_date?: string;
  notes?: string;
};

export type PendingOps = {
  operations: Operation[];
  errors: string[];
} | null;

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
const STORAGE_KEY = "ai-chat-history";

function loadMessages(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(msgs: Msg[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100))); } catch {}
}

function isOperationRequest(text: string): boolean {
  const keywords = ["verse", "versement", "dépose", "retir", "retrait", "virement", "transfère", "transfert", "envoie", "fais un"];
  return keywords.some(k => text.toLowerCase().includes(k));
}

export function useAIChat() {
  const [messages, setMessages] = useState<Msg[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingOps, setPendingOps] = useState<PendingOps>(null);
  const queryClient = useQueryClient();

  useEffect(() => { saveMessages(messages); }, [messages]);

  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Veuillez vous connecter"); return null; }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    try {
      const headers = await getAuthHeaders();
      if (!headers) { setIsLoading(false); return; }

      if (isOperationRequest(text)) {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({ messages: allMessages, mode: "parse_operations" }),
        });

        if (resp.status === 429) { toast.error("Limite de requêtes atteinte"); setIsLoading(false); return; }
        if (resp.status === 402) { toast.error("Crédits IA épuisés"); setIsLoading(false); return; }
        if (!resp.ok) throw new Error("Erreur");

        const result = await resp.json();
        if (result.operations?.length > 0) {
          setPendingOps(result);
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `**Opérations détectées (${result.operations.length}) :**\n\nVeuillez confirmer ou annuler ci-dessous.`,
          }]);
        } else {
          const errorMsg = result.errors?.join(", ") || "Aucune opération détectée";
          setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
        }
        setIsLoading(false);
        return;
      }

      // Regular chat mode with streaming
      let assistantSoFar = "";
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: allMessages, mode: "chat" }),
      });

      if (resp.status === 429) { toast.error("Limite de requêtes atteinte"); setIsLoading(false); return; }
      if (resp.status === 402) { toast.error("Crédits IA épuisés"); setIsLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Erreur de connexion");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: current } : m);
                }
                return [...prev, { role: "assistant", content: current }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch {
      toast.error("Erreur lors de la communication avec l'IA");
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, getAuthHeaders]);

  const confirmOperations = useCallback(async () => {
    if (!pendingOps?.operations?.length) return;
    setIsLoading(true);

    try {
      const headers = await getAuthHeaders();
      if (!headers) { setIsLoading(false); return; }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: [], mode: "confirm_operations", operations: pendingOps.operations }),
      });

      if (!resp.ok) throw new Error("Erreur d'exécution");
      const result = await resp.json();

      const successCount = result.results?.filter((r: any) => r.status === "success").length || 0;
      const errorCount = result.errors?.length || 0;

      let summary = `✅ **${successCount} opération(s) exécutée(s) avec succès**`;
      if (errorCount > 0) summary += `\n\n⚠️ ${errorCount} erreur(s): ${result.errors.join(", ")}`;

      setMessages(prev => [...prev, { role: "assistant", content: summary }]);
      setPendingOps(null);

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });

      toast.success(`${successCount} opération(s) exécutée(s)`);
    } catch {
      toast.error("Erreur lors de l'exécution");
    } finally {
      setIsLoading(false);
    }
  }, [pendingOps, getAuthHeaders, queryClient]);

  const cancelOperations = useCallback(() => {
    setPendingOps(null);
    setMessages(prev => [...prev, { role: "assistant", content: "❌ Opérations annulées." }]);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setPendingOps(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Historique effacé");
  }, []);

  return {
    messages, input, setInput, isLoading, pendingOps,
    sendMessage, confirmOperations, cancelOperations, clearHistory,
  };
}
