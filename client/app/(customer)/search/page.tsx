"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Store, Package, Filter, Mic, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  address?: string; // For shops
  price?: number; // For products
  image?: string; // For products
  shop?: { name: string; id: string }; // For products
  category?: { name: string }; // For products
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const router = useRouter();
  
  const [query, setQuery] = useState(q);
  const [activeTab, setActiveTab] = useState<"product" | "shop">("product");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleVoiceResult = useCallback((transcript: string) => {
    setQuery(transcript);
    router.push(`/search?q=${encodeURIComponent(transcript)}`);
  }, [router]);

  const { isListening, supported, toggleListening } = useVoiceRecognition(handleVoiceResult);

  useEffect(() => {
    const locStr = localStorage.getItem("mohallamart_location");
    if (locStr) {
      try {
        const parsed = JSON.parse(locStr);
        if (!parsed.skipped) setLocation(parsed);
      } catch (e) {}
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, activeTab, sortBy, location?.lat, location?.lng],
    queryFn: async () => {
      let url = `/search?q=${encodeURIComponent(q)}&type=${activeTab}`;
      if (sortBy !== "relevance") url += `&sortBy=${sortBy}`;
      if (location) url += `&lat=${location.lat}&lng=${location.lng}`;
      
      const res = await api.get(url);
      return res.data.results as SearchResult[];
    },
    enabled: !!q,
  });

  return (
    <div className="container mx-auto p-4 space-y-6 animate-in fade-in duration-500 pb-24 max-w-5xl">
      <div className="relative">
        <h1 className="text-2xl font-bold tracking-tight">Search Results for "{q}"</h1>
        <p className="text-muted-foreground text-sm">Showing results within your delivery area</p>
        
        {supported && (
          <button
            onClick={() => toggleListening()}
            className={`absolute right-0 top-0 p-2 rounded-full transition-colors ${
              isListening ? "bg-red-500/10 text-red-500 animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-muted/50 p-1 rounded-xl">
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'product' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('product')}
          >
            Products
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'shop' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('shop')}
          >
            Shops
          </button>
        </div>

        {activeTab === 'product' && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              className="bg-transparent border border-border/50 rounded-lg text-sm p-2 outline-none focus:border-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 rounded-2xl border border-border/50 border-dashed">
            {activeTab === 'shop' ? <Store className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" /> : <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />}
            <h3 className="text-lg font-medium">No {activeTab}s found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or location</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${activeTab === 'shop' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
            {data.map((item) => (
              activeTab === 'product' ? (
                <Link key={item.id} href={`/product/${item.id}`} className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-primary/30 flex flex-col">
                  <div className="aspect-square bg-muted/30 relative flex items-center justify-center p-4">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform" />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground/20" />
                    )}
                    {item.category && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-background/80 backdrop-blur rounded-full uppercase tracking-wider text-muted-foreground border">
                        {item.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{item.shop?.name}</p>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="font-bold text-lg">₹{item.price}</span>
                      <Button size="sm" className="h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white">Add</Button>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link key={item.id} href={`/shop/${item.id}`} className="group bg-card border border-border/50 rounded-2xl p-5 hover:shadow-lg transition-all hover:border-secondary/30 flex flex-col gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 group-hover:scale-110 transition-transform">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-secondary transition-colors line-clamp-1">{item.name}</h3>
                      <p className="text-muted-foreground text-xs line-clamp-2 mt-1">{item.address}</p>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
