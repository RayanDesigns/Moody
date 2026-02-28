"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! I'm Moody, your wellness companion. How are you doing today? Feel free to share whatever's on your mind — I'm here to listen.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.ok) {
        const { reply } = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm having trouble responding right now. Please try again in a moment.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong. I'm still here though — try again?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pt-8 md:pt-0">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Companion</h1>
        <p className="text-sm text-muted-foreground">
          A supportive space to reflect and process your feelings
        </p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-start gap-3",
                  msg.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "rounded-full p-2 shrink-0",
                    msg.role === "assistant"
                      ? "bg-primary/10"
                      : "bg-secondary/10"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-secondary" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed",
                    msg.role === "assistant"
                      ? "bg-muted text-foreground rounded-tl-none"
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  )}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className="rounded-full bg-primary/10 p-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3 rounded-tl-none">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <span
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={endRef} />
        </CardContent>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            Moody is an AI companion, not a therapist. If you&apos;re in crisis,
            call 988 or text HOME to 741741.
          </p>
        </div>
      </Card>
    </div>
  );
}
