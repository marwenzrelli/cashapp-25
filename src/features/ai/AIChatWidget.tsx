import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAIChat } from "./hooks/useAIChat";
import { AIChatMessages } from "./components/AIChatMessages";

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    messages, input, setInput, isLoading, pendingOps,
    sendMessage, confirmOperations, cancelOperations,
  } = useAIChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingOps]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110",
          "bg-primary text-primary-foreground",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[560px] flex flex-col rounded-xl border bg-background shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 border-b px-4 py-3 bg-primary text-primary-foreground rounded-t-xl">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Assistant IA CashApp</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[380px]">
            <AIChatMessages
              messages={messages}
              pendingOps={pendingOps}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onConfirm={confirmOperations}
              onCancel={cancelOperations}
              compact={true}
            />
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-3 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Question ou opération..."
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <Button size="icon" onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
