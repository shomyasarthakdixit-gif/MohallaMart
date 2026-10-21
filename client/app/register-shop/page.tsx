"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterShopPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    openTime: "09:00",
    closeTime: "21:00",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/shops", formData);
      if (response.data.success) {
        alert("Shop registered successfully!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error registering shop:", error);
      const msg = error.response?.data?.message || "Failed to register shop";
      alert("Error: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground mb-4">Register Your Shop</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Join MohallaMart and start selling your products directly to your neighborhood.
          </p>
        </div>

        <div className="bg-surface border border-border/50 rounded-[24px] shadow-sm overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Shop Name</label>
                <div className="relative group">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    required 
                    placeholder="e.g. Sharma General Store" 
                    className="pl-12 h-14 bg-muted/20 border-border/50 rounded-xl text-lg focus-visible:ring-primary focus-visible:border-primary transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Full Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    required 
                    placeholder="e.g. Shop No 4, Main Market..." 
                    className="pl-12 h-14 bg-muted/20 border-border/50 rounded-xl text-lg focus-visible:ring-primary focus-visible:border-primary transition-all"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Short Description <span className="text-muted-foreground/50 lowercase font-normal">(optional)</span></label>
                <Input 
                  placeholder="What do you sell?" 
                  className="h-14 bg-muted/20 border-border/50 rounded-xl text-lg px-4 focus-visible:ring-primary focus-visible:border-primary transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-muted/10 rounded-2xl border border-border/30">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Opening Time</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="time" 
                      required 
                      className="pl-12 h-14 bg-background border-border/50 rounded-xl text-lg focus-visible:ring-primary focus-visible:border-primary transition-all font-medium"
                      value={formData.openTime}
                      onChange={(e) => setFormData({...formData, openTime: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Closing Time</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="time" 
                      required 
                      className="pl-12 h-14 bg-background border-border/50 rounded-xl text-lg focus-visible:ring-primary focus-visible:border-primary transition-all font-medium"
                      value={formData.closeTime}
                      onChange={(e) => setFormData({...formData, closeTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold rounded-xl shadow-md bg-primary text-primary-foreground hover:bg-primary/90 mt-4" 
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Complete Registration"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
