"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI shopping assistant. What are you looking for today?", products: [] }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = { role: "user", text: query, products: [] };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await api.post("/ai/assistant", { query: userMessage.text });
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: res.data.message, products: res.data.products || [] }
      ]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: error.response?.data?.message || "Oops, something went wrong. Please try again.", products: [] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[100]">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 rounded-full shadow-lg font-bold bg-primary hover:bg-primary/90 transition-transform px-5 gap-2"
        >
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
          <span className="text-primary-foreground hidden sm:inline">Ask MohallaMart</span>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-[100] w-[90vw] sm:w-[400px] h-[500px] max-h-[75vh] bg-surface border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-xl">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground font-serif text-lg">Shopping Assistant</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 text-foreground" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${msg.role === 'user' ? 'bg-muted text-foreground rounded-tr-none' : 'bg-surface border border-border rounded-tl-none text-foreground'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested Items</p>
                        <div className="flex flex-col gap-2">
                          {msg.products.map((product: any) => (
                            <Link href={`/product/${product.id}`} key={product.id} className="flex items-center gap-3 bg-background hover:bg-muted p-2 rounded-xl border border-border transition-colors text-foreground">
                              <div className="bg-muted h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground truncate my-0.5">{product.shop?.name || "Local Shop"}</p>
                                <p className="text-sm text-foreground font-bold">₹{product.price}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="bg-surface border border-border rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-surface">
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask for recommendations..."
                  className="flex-1 bg-background border border-border px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all focus:border-primary/50"
                />
                <Button type="submit" disabled={!query.trim() || isLoading} className="rounded-xl flex-shrink-0 font-bold h-11 px-5">
                  Send
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
