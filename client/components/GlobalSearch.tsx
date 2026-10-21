"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Store, Package, ArrowRight, Mic } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface SearchResult {
  id: string;
  type: "shop" | "product";
  title: string;
  subtitle: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleVoiceResult = (transcript: string) => {
    setQuery(transcript);
    setIsOpen(true);
  };

  const { isListening, supported, toggleListening } = useVoiceRecognition(handleVoiceResult);

  // Keyboard shortcut to open search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened and clear query when closed
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const debouncedQuery = useDebounce(query, 300);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const locStr = localStorage.getItem("mohallamart_location");
    if (locStr) {
      try {
        const parsed = JSON.parse(locStr);
        if (!parsed.skipped) setLocation(parsed);
      } catch (e) {}
    }
  }, []);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["globalSearch", debouncedQuery, location?.lat, location?.lng],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      try {
        let urlShop = `/search?q=${encodeURIComponent(debouncedQuery)}&type=shop`;
        let urlProduct = `/search?q=${encodeURIComponent(debouncedQuery)}&type=product`;
        
        if (location) {
          urlShop += `&lat=${location.lat}&lng=${location.lng}`;
          urlProduct += `&lat=${location.lat}&lng=${location.lng}`;
        }
        
        const [shopRes, productRes] = await Promise.all([
          api.get(urlShop),
          api.get(urlProduct)
        ]);

        const shops = (shopRes.data.results || []).slice(0, 3).map((shop: any) => ({
          id: shop.id,
          type: "shop",
          title: shop.name,
          subtitle: shop.address,
        }));

        const products = (productRes.data.results || []).slice(0, 5).map((product: any) => ({
          id: product.id,
          type: "product",
          title: product.name,
          subtitle: product.shop?.name || "Local Shop",
        }));

        return [...shops, ...products] as SearchResult[];
      } catch (e) {
        return [];
      }
    },
    enabled: !!debouncedQuery,
  });

  function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    return debouncedValue;
  }

  return (
    <>
      {/* Search Trigger Button */}
      <div 
        onClick={() => setIsOpen(true)}
        className="relative w-full max-w-2xl mx-auto group cursor-text"
      >
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="h-14 w-full bg-surface border border-border rounded-full flex items-center pl-14 pr-4 text-muted-foreground shadow-sm group-hover:shadow-md group-hover:border-primary/50 transition-all text-base sm:text-lg">
          Search groceries, shops, essentials...
          <div className="ml-auto hidden sm:flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded-md opacity-70">
            <span className="text-[10px]">⌘</span>K
          </div>
        </div>
      </div>

      {/* Full Screen Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center p-4 sm:p-8 pt-[10vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-card border border-border/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Search Header */}
              <div className="relative flex items-center p-4 border-b border-border/50">
                <Search className="absolute left-6 h-6 w-6 text-primary" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) {
                      setIsOpen(false);
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    }
                  }}
                  placeholder="What are you looking for? Press Enter to search..."
                  className="w-full h-14 bg-transparent border-none outline-none pl-14 pr-12 text-xl font-medium placeholder:text-muted-foreground/50"
                />

                {supported && (
                  <button
                    onClick={() => toggleListening()}
                    className={`absolute right-16 p-2 rounded-full transition-colors ${
                      isListening ? "bg-red-500/10 text-red-500 animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    }`}
                  >
                    <Mic className="h-6 w-6" />
                  </button>
                )}

                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute right-6 p-2 bg-muted/50 text-muted-foreground rounded-full hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-2">
                {!query ? (
                  <div className="p-10 flex flex-col items-center justify-center text-muted-foreground/50 h-64">
                    <Search className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg">Start typing to search...</p>
                  </div>
                ) : isLoading ? (
                  <div className="p-10 flex flex-col items-center justify-center text-muted-foreground/50 h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-lg">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Results
                    </div>
                    {searchResults.map((result, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={result.id}
                      >
                        <Link 
                          href={result.type === "shop" ? `/shop/${result.id}` : `/product/${result.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center p-4 rounded-2xl hover:bg-muted/50 group transition-colors cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 text-primary group-hover:scale-110 transition-transform">
                            {result.type === "shop" ? <Store className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-semibold group-hover:text-primary transition-colors">{result.title}</h4>
                            <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 flex flex-col items-center justify-center text-muted-foreground/70 h-64">
                    <p className="text-lg">No results found for &quot;{query}&quot;</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
