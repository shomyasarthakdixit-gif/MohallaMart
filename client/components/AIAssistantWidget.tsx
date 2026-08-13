"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, ShoppingBag } from "lucide-react";
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
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0 transition-transform hover:scale-105"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-[100] w-[90vw] sm:w-[400px] h-[500px] max-h-[75vh] bg-background border rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-1.5 rounded-full">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">AI Assistant</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 text-foreground" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'}`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Suggested Items:</p>
                        <div className="flex flex-col gap-2">
                          {msg.products.map((product: any) => (
                            <Link href={`/product/${product.id}`} key={product.id} className="flex items-center gap-2 bg-background/60 hover:bg-background p-2 rounded-lg border transition-all hover:border-primary/50 text-foreground">
                              <div className="bg-muted h-10 w-10 rounded flex items-center justify-center flex-shrink-0">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded" />
                                ) : (
                                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground truncate my-0.5 text-[10px]">from {product.shop?.name || "Local Shop"}</p>
                                <p className="text-xs text-primary font-bold">₹{product.price}</p>
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
                <div className="flex gap-2">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white flex items-center justify-center">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                    <div className="flex gap-1.5 items-center h-full">
                      <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t bg-background/95 backdrop-blur">
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="I want to bake a cake..."
                  className="flex-1 bg-muted px-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-transparent focus:border-primary/20"
                />
                <Button type="submit" size="icon" disabled={!query.trim() || isLoading} className="rounded-full flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
