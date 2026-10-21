"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ArrowRight, Store, ShoppingBasket, Milk, Cookie, CupSoda, Pill, Drumstick, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LocationRequestDialog } from "@/components/LocationRequestDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ShopCard } from "@/components/shop/ShopCard";
import { ProductCard } from "@/components/product/ProductCard";

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  category?: string;
  isOpen?: boolean;
}

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  image: string | null;
  shop: { name: string; id: string };
}

export default function CustomerHome() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const { data: shopsData, isLoading: isLoadingShops, isError: isErrorShops } = useQuery({
    queryKey: ["nearbyShops", location?.lat, location?.lng],
    queryFn: async () => {
      const query = location ? `?lat=${location.lat}&lng=${location.lng}` : "";
      const res = await api.get(`/shops/nearby${query}`);
      return res.data.shops as Shop[];
    },
  });

  const { data: recommendationsData, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ["aiRecommendations"],
    queryFn: async () => {
      try {
        const res = await api.get(`/ai/recommendations`);
        return res.data; // { recommendations: [], title: string }
      } catch (e) {
        return { recommendations: [], title: "Popular Right Now" };
      }
    },
    retry: false,
  });

  const requestLocation = () => {
    setShowLocationDialog(true);
  };

  const handleLocationGranted = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setLocationLabel("Home"); // Graceful fallback human readable
    setShowLocationDialog(false);
    localStorage.setItem("mohallamart_location", JSON.stringify({ lat, lng, label: "Home" }));
  };

  const handleLocationDenied = () => {
    setShowLocationDialog(false);
    setLocation({ lat: 28.6139, lng: 77.2090 }); // Default fallback
    setLocationLabel("Default Area");
    localStorage.setItem("mohallamart_location", JSON.stringify({ skipped: true }));
  };

  useEffect(() => {
    const loc = localStorage.getItem("mohallamart_location");
    if (!loc) {
      setShowLocationDialog(true);
    } else {
      try {
        const parsed = JSON.parse(loc);
        if (parsed.skipped) {
          setLocation({ lat: 28.6139, lng: 77.2090 });
          setLocationLabel("Default Area");
        } else {
          setLocation({ lat: parsed.lat, lng: parsed.lng });
          setLocationLabel(parsed.label || "Your Location");
        }
      } catch (e) {
        setShowLocationDialog(true);
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-12 animate-in fade-in duration-500 pb-24">
      {showLocationDialog && (
        <LocationRequestDialog 
          onLocationGranted={handleLocationGranted} 
          onLocationDenied={handleLocationDenied} 
        />
      )}

      {/* 1. Location & Search Area */}
      <section className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Navigation className="h-3.5 w-3.5" /> Delivering to
          </p>
          <div 
            className="flex items-center gap-2 cursor-pointer group mt-1 self-start"
            onClick={requestLocation}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {locationLabel || "Select Location"}
            </h2>
            <MapPin className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <GlobalSearch />
      </section>

      {/* 2. Editorial Discovery Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-surface border border-border shadow-sm flex flex-col md:flex-row min-h-[300px]">
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4 block">Your local market, online</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] text-foreground mb-4">
              Everything you need,<br />from around the corner.
            </h2>
            <p className="text-muted-foreground font-medium max-w-md">
              Fresh groceries, daily essentials, and trusted neighbourhood shops delivered straight to your door.
            </p>
          </motion.div>
        </div>
        <div className="md:w-[45%] h-64 md:h-auto relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
            alt="Fresh produce" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlay to blend into the left side on desktop */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface via-surface/50 to-transparent"></div>
        </div>
      </section>

      {/* 3. Categories */}
      <section>
        <h3 className="text-2xl font-bold tracking-tight mb-6 font-serif">Explore Categories</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {[
            { name: "Grocery", Icon: ShoppingBasket },
            { name: "Dairy", Icon: Milk },
            { name: "Snacks", Icon: Cookie },
            { name: "Beverages", Icon: CupSoda },
            { name: "Pharmacy", Icon: Pill },
            { name: "Meat", Icon: Drumstick },
          ].map((cat, i) => (
            <Link href={`/category/${cat.name.toLowerCase()}`} key={i}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group h-full"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <cat.Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{cat.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Nearby Shops */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold tracking-tight font-serif">Nearby Shops</h3>
          <Link href="/shops" className="text-sm text-primary font-semibold flex items-center hover:underline">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingShops && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="h-44 bg-muted animate-pulse"></div>
              <div className="p-5 space-y-4">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}

          {isErrorShops && (
            <div className="col-span-full py-12 px-4 rounded-2xl border border-border bg-surface text-center">
              <p className="text-foreground font-medium mb-2">Couldn&apos;t load nearby shops.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Try again</Button>
            </div>
          )}

          {!isLoadingShops && !isErrorShops && shopsData?.length === 0 && (
            <div className="col-span-full py-16 px-4 rounded-2xl border border-border bg-surface text-center flex flex-col items-center">
              <Store className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-lg font-semibold text-foreground mb-1">We couldn&apos;t find shops nearby yet.</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">Try selecting a different location or check back later as we expand our coverage.</p>
            </div>
          )}
          
          {shopsData?.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </section>

      {/* 5. Recommended Products */}
      {(isLoadingRecommendations || (recommendationsData?.recommendations && recommendationsData.recommendations.length > 0)) && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold tracking-tight font-serif">{recommendationsData?.title || "Recommended For You"}</h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {isLoadingRecommendations && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[160px] sm:min-w-[200px] h-64 rounded-2xl border border-border bg-surface overflow-hidden snap-start">
                <div className="h-32 bg-muted animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse"></div>
                  <div className="h-5 w-1/3 bg-muted rounded animate-pulse mt-4"></div>
                </div>
              </div>
            ))}

            {!isLoadingRecommendations && recommendationsData?.recommendations.map((product: RecommendedProduct) => (
              <div key={product.id} className="min-w-[160px] sm:min-w-[200px] snap-start h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
