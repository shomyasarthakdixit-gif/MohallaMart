"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Navigation, Store, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LocationRequestDialog } from "@/components/LocationRequestDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useAuthStore } from "@/store/authStore";

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
}

export default function CustomerHome() {
  const { user } = useAuthStore();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const { data: shopsData, isLoading: isLoadingShops } = useQuery({
    queryKey: ["nearbyShops", location?.lat, location?.lng],
    queryFn: async () => {
      const query = location ? `?lat=${location.lat}&lng=${location.lng}` : "";
      const res = await api.get(`/shops/nearby${query}`);
      return res.data.shops as Shop[];
    },
  });

  const requestLocation = () => {
    setShowLocationDialog(true);
  };

  const handleLocationGranted = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setShowLocationDialog(false);
    localStorage.setItem("mohallamart_location", JSON.stringify({ lat, lng }));
  };

  const handleLocationDenied = () => {
    setLocationError("Location access skipped");
    setShowLocationDialog(false);
    setLocation({ lat: 28.6139, lng: 77.2090 }); // Default fallback
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
          setLocationError("Location access skipped");
          setLocation({ lat: 28.6139, lng: 77.2090 });
        } else {
          setLocation(parsed);
        }
      } catch (e) {
        setShowLocationDialog(true);
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-10 animate-in fade-in duration-500 pb-24">
      {showLocationDialog && (
        <LocationRequestDialog 
          onLocationGranted={handleLocationGranted} 
          onLocationDenied={handleLocationDenied} 
        />
      )}

      {/* Header & Location */}
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Navigation className="h-3 w-3" /> Delivering to
            </p>
            <div 
              className="flex items-center gap-2 cursor-pointer group mt-1"
              onClick={requestLocation}
            >
              <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : locationError || "Select Location"}
              </h2>
              <MapPin className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <Link href="/profile">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors border-2 border-primary/20">
              <span className="text-lg font-bold text-primary">{user?.name ? user.name.charAt(0) : "JD"}</span>
            </div>
          </Link>
        </div>

        {/* Global Search */}
        <GlobalSearch />
      </div>

      {/* Banner Carousel */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-secondary h-48 sm:h-64 flex items-center p-8 text-white shadow-xl">
        <div className="z-10 max-w-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block backdrop-blur-md">Fastest Delivery</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-3 leading-tight">Fresh Needs,<br/>Delivered Fast.</h2>
            <p className="text-sm sm:text-base opacity-90 mb-6 font-medium">From your trusted neighborhood stores.</p>
          </motion.div>
        </div>
        <div className="absolute right-[-20%] bottom-[-20%] opacity-20 transform -rotate-12 scale-150">
          <Store className="w-96 h-96" />
        </div>
      </section>

      {/* Categories */}
      <section>
        <h3 className="text-2xl font-bold tracking-tight mb-6">Explore Categories</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {[
            { name: "Grocery", icon: "🌾", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
            { name: "Dairy", icon: "🥛", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
            { name: "Snacks", icon: "🍪", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
            { name: "Beverages", icon: "🥤", color: "bg-red-500/10 text-red-600 border-red-500/20" },
            { name: "Pharmacy", icon: "💊", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
            { name: "Meat", icon: "🥩", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
          ].map((cat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05, y: -5 }} 
              whileTap={{ scale: 0.95 }}
              className={`min-w-[100px] flex flex-col items-center justify-center p-4 rounded-3xl border cursor-pointer snap-start ${cat.color} hover:shadow-lg transition-all`}
            >
              <span className="text-3xl mb-2 filter drop-shadow-md">{cat.icon}</span>
              <span className="text-sm font-semibold">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nearby Shops */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold tracking-tight">Nearby Shops</h3>
          <Link href="/shops" className="text-sm text-primary hover:underline font-semibold flex items-center">
            See All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoadingShops && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/50 glass animate-pulse">
              <div className="h-40 bg-muted/50"></div>
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/3 mt-4"></div>
              </div>
            </div>
          ))}

          {!isLoadingShops && shopsData?.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-10 glass rounded-2xl border border-border/50">
              No shops found near you.
            </div>
          )}
          
          {shopsData?.map((shop) => (
            <motion.div 
              key={shop.id} 
              whileHover={{ y: -5, scale: 1.02 }} 
              transition={{ type: "spring", stiffness: 300 }}
              className="h-full"
            >
              <Link href={`/shop/${shop.id}`}>
                <Card className="overflow-hidden cursor-pointer h-full glass border-border/50 hover:border-primary/50 transition-colors shadow-lg hover:shadow-[0_10px_30px_-15px_rgba(var(--primary),0.3)] rounded-2xl">
                  <div className="h-40 bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500">
                      <Store className="h-16 w-16" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h4 className="font-semibold truncate text-lg tracking-tight">{shop.name}</h4>
                    <p className="text-xs text-muted-foreground truncate mt-1">{shop.address}</p>
                    <div className="mt-4 text-[10px] uppercase font-bold tracking-wider bg-secondary/10 text-secondary inline-block px-3 py-1.5 rounded-full">
                      Scheduled Delivery
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
