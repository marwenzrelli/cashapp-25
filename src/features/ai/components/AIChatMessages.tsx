import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, XCircle, Loader2, ArrowDownToLine, ArrowUpFromLine, ArrowUpDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Msg, PendingOps, Operation } from "../hooks/useAIChat";

const SUGGESTIONS = [
  "Résumé des opérations du jour",
  "Clients avec solde négatif",
  "Top 5 clients par solde",
  "Verse 1000 à Ahmed et retire 500 de Sami",
];

const OP_LABELS: Record<string, { label: string; color: string; icon: typeof ArrowDownToLine }> = {
  deposit: { label: "Versement", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", icon: ArrowDownToLine },
  withdrawal: { label: "Retrait", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: ArrowUpFromLine },
  transfer: { label: "Virement", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: ArrowUpDown },
};

interface AIChatMessagesProps {
  messages: Msg[];
  pendingOps: PendingOps;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  compact?: boolean;
}

export const AIChatMessages = ({
  messages,
  pendingOps,
  isLoading,
  onSendMessage,
  onConfirm,
  onCancel,
  compact = false,
}: AIChatMessagesProps) => {
  return (
    <>
      {messages.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">Posez une question ou demandez une opération</p>
          <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSendMessage(s)}
                className="text-left text-sm px-3 py-2 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {messages.map((m, i) => (
        <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
          <div className={cn(
            "rounded-lg px-3 py-2 text-sm",
            compact ? "max-w-[85%]" : "max-w-[75%]",
            m.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}>
            {m.role === "assistant" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ) : m.content}
          </div>
        </div>
      ))}

      {pendingOps && pendingOps.operations.length > 0 && (
        <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
          {pendingOps.operations.map((op, i) => {
            const info = OP_LABELS[op.type];
            const Icon = info.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-sm flex-wrap">
                <Badge className={cn("gap-1", info.color)}>
                  <Icon className="h-3 w-3" />
                  {info.label}
                </Badge>
                <span className="font-medium">{op.amount.toLocaleString("fr-FR")} TND</span>
                <span className="text-muted-foreground">
                  {op.type === "transfer"
                    ? `${op.client_name} → ${op.to_client_name}`
                    : op.client_name}
                </span>
                {op.operation_date && (
                  <span className="text-xs text-muted-foreground">
                    📅 {op.operation_date.replace("T", " ")}
                  </span>
                )}
              </div>
            );
          })}
          {pendingOps.errors?.length > 0 && (
            <div className="text-xs text-destructive">
              {pendingOps.errors.map((e, i) => <p key={i}>⚠️ {e}</p>)}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={onConfirm} disabled={isLoading} className="gap-1">
              <Check className="h-3 w-3" /> Confirmer
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} disabled={isLoading} className="gap-1">
              <XCircle className="h-3 w-3" /> Annuler
            </Button>
          </div>
        </div>
      )}

      {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg px-3 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      )}
    </>
  );
};
