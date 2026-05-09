"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2, Bot, User } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  products: Product[];
}

export function AiChat({ products }: AiChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeMessage = (count: number): Message => ({
    role: "assistant",
    content: `Hola! Soy tu asistente de inventario ✨\nTienes ${count} producto${count !== 1 ? "s" : ""} registrado${count !== 1 ? "s" : ""}. Puedes preguntarme:\n• ¿Cuánto gasté en total?\n• ¿Cuál es mi producto más caro?\n• ¿Qué favoritos no he comprado?\n• ¿En qué tienda compro más?`,
  });

  const handleOpen = () => {
    setMessages([welcomeMessage(products.length)]);
    setInput("");
    setOpen(true);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage, products }),
      });

      if (res.ok) {
        const { answer } = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Lo siento, ocurrió un error. Intenta de nuevo." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión. Verifica tu conexión a internet." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-2xl p-0 gradient-violet-gold border-0 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-transform z-50"
        aria-label="Abrir asistente IA"
        title="Asistente IA"
      >
        <Sparkles className="h-5 w-5 text-white" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md h-[80vh] flex flex-col p-0 gap-0 glass-strong rounded-3xl border-border/60">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/50 shrink-0">
            <DialogTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-xl gradient-violet-gold flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="gradient-text font-bold">Asistente IA</span>
            </DialogTitle>
          </DialogHeader>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 min-h-0"
          >
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex gap-2 items-start", msg.role === "user" && "flex-row-reverse")}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5",
                      msg.role === "assistant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm max-w-[82%] whitespace-pre-wrap leading-relaxed",
                      msg.role === "assistant"
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 pb-4 pt-3 border-t shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="shrink-0"
                aria-label="Enviar mensaje"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
