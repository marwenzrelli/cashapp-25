import { useRef, useEffect } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIChat } from "@/features/ai/hooks/useAIChat";
import { AIChatMessages } from "@/features/ai/components/AIChatMessages";

const AIAssistant: React.FC = () => {
  const {
    messages, input, setInput, isLoading, pendingOps,
    sendMessage, confirmOperations, cancelOperations, clearHistory,
  } = useAIChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingOps]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between pb-4 border-b mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Assistant IA CashApp</h1>
            <p className="text-sm text-muted-foreground">Posez des questions ou effectuez des opérations en langage naturel</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearHistory} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <AIChatMessages
          messages={messages}
          pendingOps={pendingOps}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onConfirm={confirmOperations}
          onCancel={cancelOperations}
          compact={false}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t pt-4 mt-4 flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Question ou opération..."
          className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <Button size="lg" onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4 mr-2" />
          Envoyer
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;
