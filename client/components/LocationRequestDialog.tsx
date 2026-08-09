"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Map, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationRequestDialogProps {
  onLocationGranted: (lat: number, lng: number) => void;
  onLocationDenied: () => void;
}

export function LocationRequestDialog({ onLocationGranted, onLocationDenied }: LocationRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestLocation = () => {
    setIsLocating(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsOpen(false);
        onLocationGranted(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. We need this to show nearby shops.");
        } else {
          setError("Unable to fetch location. Please try again.");
        }
      },
      { timeout: 10000 }
    );
  };

  const handleSkip = () => {
    setIsOpen(false);
    onLocationDenied();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card text-card-foreground shadow-2xl rounded-3xl overflow-hidden border border-border/50"
          >
            {/* Animated Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-primary/20 via-secondary/20 to-background opacity-50 blur-3xl pointer-events-none" />
            
            <div className="p-8 flex flex-col items-center text-center relative z-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative"
              >
                <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping opacity-20"></div>
                <MapPin className="w-12 h-12 text-primary" />
              </motion.div>
              
              <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                Discover Nearby Shops
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-sm">
                Allow location access to find the best groceries and daily essentials delivered to your doorstep in minutes.
              </p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 mb-6"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="flex flex-col w-full gap-3">
                <Button 
                  size="lg" 
                  onClick={handleRequestLocation} 
                  disabled={isLocating}
                  className="w-full h-14 text-lg rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(var(--primary),0.3)] transition-all"
                >
                  {isLocating ? (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                      className="mr-2"
                    >
                      <Navigation className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Map className="w-5 h-5 mr-2" />
                  )}
                  {isLocating ? "Locating..." : "Allow Location Access"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={handleSkip}
                  className="w-full h-14 text-muted-foreground hover:text-foreground rounded-xl"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
