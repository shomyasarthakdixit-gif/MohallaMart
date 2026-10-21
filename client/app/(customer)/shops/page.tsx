"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ShopCard } from "@/components/shop/ShopCard";
import { Store, Navigation, MapPin } from "lucide-react";
import { LocationRequestDialog } from "@/components/LocationRequestDialog";
import { Button } from "@/components/ui/button";

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  category?: string;
  isOpen?: boolean;
}

export default function ShopsPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [showLocationDialog, setShowLocationDialog] = useState(false);

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

  const handleLocationGranted = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    setLocationLabel("Home");
    setShowLocationDialog(false);
    localStorage.setItem("mohallamart_location", JSON.stringify({ lat, lng, label: "Home" }));
  };

  const handleLocationDenied = () => {
    setShowLocationDialog(false);
    setLocation({ lat: 28.6139, lng: 77.2090 });
    setLocationLabel("Default Area");
    localStorage.setItem("mohallamart_location", JSON.stringify({ skipped: true }));
  };

  const { data: shopsData, isLoading, isError } = useQuery({
    queryKey: ["nearbyShops", location?.lat, location?.lng],
    queryFn: async () => {
      const query = location ? `?lat=${location.lat}&lng=${location.lng}` : "";
      const res = await api.get(`/shops/nearby${query}`);
      return res.data.shops as Shop[];
    },
    enabled: !!location,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500 pb-24 max-w-7xl">
      {showLocationDialog && (
        <LocationRequestDialog 
          onLocationGranted={handleLocationGranted} 
          onLocationDenied={handleLocationDenied} 
        />
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight">Shops Around You</h1>
        <div 
          className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors self-start"
          onClick={() => setShowLocationDialog(true)}
        >
          <Navigation className="h-4 w-4" /> Delivering to <span className="font-semibold text-foreground underline decoration-border underline-offset-4">{locationLabel || "Select Location"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="h-40 bg-muted animate-pulse"></div>
            <div className="p-5 space-y-4">
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ))}

        {isError && (
          <div className="col-span-full py-16 px-4 rounded-2xl border border-border bg-surface text-center flex flex-col items-center">
            <p className="text-foreground font-medium mb-4">Couldn&apos;t load nearby shops.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
          </div>
        )}

        {!isLoading && !isError && shopsData?.length === 0 && (
          <div className="col-span-full py-20 px-4 rounded-2xl border border-border border-dashed bg-surface text-center flex flex-col items-center">
            <Store className="h-16 w-16 text-muted-foreground opacity-30 mb-6" />
            <h3 className="text-xl font-bold text-foreground mb-2">No shops found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">We couldn&apos;t find any shops in this area yet. Try selecting a different location.</p>
          </div>
        )}

        {shopsData?.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </div>
  );
}
