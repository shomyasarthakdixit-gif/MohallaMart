"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Store, Clock, MapPin, Save, FileText, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import MapPickerDynamic from "@/components/ui/MapPickerDynamic";

export default function SettingsPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    openTime: "",
    closeTime: "",
    scheduledDeliveryFee: 20,
    expressDeliveryFee: 50,
    deliveryRadius: 5,
    latitude: 0,
    longitude: 0
  });

  const { data: shop, isLoading } = useQuery({
    queryKey: ["myShop"],
    queryFn: async () => {
      const res = await api.get("/shops/me");
      return res.data.shop;
    }
  });

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || "",
        description: shop.description || "",
        address: shop.address || "",
        openTime: shop.openTime || "09:00",
        closeTime: shop.closeTime || "21:00",
        scheduledDeliveryFee: shop.scheduledDeliveryFee || 20,
        expressDeliveryFee: shop.expressDeliveryFee || 50,
        deliveryRadius: shop.deliveryRadius || 5,
        latitude: shop.latitude || 28.6139,
        longitude: shop.longitude || 77.2090
      });
    }
  }, [shop]);

  const updateShopMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await api.put("/shops/me", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myShop"] });
      alert("Shop settings updated successfully!");
    },
    onError: () => {
      alert("Failed to update shop settings.");
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateShopMutation.mutate(formData);
  };

  const handleDeleteShop = async () => {
    if (confirm("Are you sure you want to delete your shop? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await api.delete("/shops");
        alert("Shop deleted successfully.");
        router.push("/");
      } catch (error) {
        console.error("Error deleting shop:", error);
        alert("Failed to delete shop.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-10 w-48 bg-muted/50 rounded-xl animate-pulse" />
        <div className="h-[600px] bg-surface rounded-[24px] border border-border/30 animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-20 md:pb-0 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Shop Settings</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your shop profile, timings, and delivery preferences.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Profile Information */}
        <div className="bg-surface rounded-[24px] border border-border/50 overflow-hidden shadow-sm">
          <div className="h-2 w-full bg-primary" />
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-foreground">
                <Store className="h-5 w-5 text-primary" /> Profile Information
              </h2>
              <p className="text-sm text-muted-foreground mt-1">These details will be publicly visible to customers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Shop Name</label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="h-14 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Address</label>
                <Input 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                  className="h-14 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  className="flex min-h-[100px] w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-medium resize-none custom-scrollbar"
                  placeholder="Tell customers about your shop..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location & Delivery Radius */}
        <div className="bg-surface rounded-[24px] border border-border/50 overflow-hidden shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-foreground">
              <MapPin className="h-5 w-5 text-primary" /> Location & Radius
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Set your delivery boundaries on the map.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 max-w-[240px]">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Delivery Radius (km)</label>
              <Input 
                type="number" 
                min="1"
                max="50"
                value={formData.deliveryRadius} 
                onChange={e => setFormData({ ...formData, deliveryRadius: parseFloat(e.target.value) || 5 })} 
                className="h-14 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground font-medium">Customers outside this radius won't be able to place orders.</p>
            </div>
            <div className="bg-muted/10 p-2 sm:p-3 rounded-2xl border border-border/50 shadow-inner">
              <MapPickerDynamic 
                initialPosition={{ lat: formData.latitude, lng: formData.longitude }}
                onLocationSelect={(lat: number, lng: number, addressText: string) => {
                  setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, address: addressText }));
                }}
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-surface rounded-[24px] border border-border/50 overflow-hidden shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" /> Operating Hours
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Opening Time</label>
              <Input 
                type="time" 
                value={formData.openTime} 
                onChange={e => setFormData({ ...formData, openTime: e.target.value })} 
                className="h-14 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Closing Time</label>
              <Input 
                type="time" 
                value={formData.closeTime} 
                onChange={e => setFormData({ ...formData, closeTime: e.target.value })} 
                className="h-14 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* Delivery Fees */}
        <div className="bg-surface rounded-[24px] border border-border/50 overflow-hidden shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-foreground">
              <Truck className="h-5 w-5 text-primary" /> Delivery Fees
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Scheduled Fee (₹)</label>
              <Input 
                type="number" 
                min="0"
                value={formData.scheduledDeliveryFee} 
                onChange={e => setFormData({ ...formData, scheduledDeliveryFee: parseFloat(e.target.value) || 0 })} 
                className="h-14 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Express Fee (₹)</label>
              <Input 
                type="number" 
                min="0"
                value={formData.expressDeliveryFee} 
                onChange={e => setFormData({ ...formData, expressDeliveryFee: parseFloat(e.target.value) || 0 })} 
                className="h-14 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={updateShopMutation.isPending} 
            className="h-14 px-10 text-lg font-bold shadow-md rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="mr-2 h-5 w-5" /> 
            {updateShopMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-destructive/5 rounded-[24px] border border-destructive/20 overflow-hidden mt-12 p-6 sm:p-8">
        <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-destructive mb-4">
          <AlertTriangle className="h-5 w-5" /> Danger Zone
        </h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-background rounded-2xl border border-destructive/10">
          <div>
            <h3 className="font-bold text-foreground">Delete Shop</h3>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Permanently remove your shop and all of its data from MohallaMart.
            </p>
          </div>
          <Button 
            variant="destructive" 
            className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold whitespace-nowrap" 
            onClick={handleDeleteShop}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" /> 
            {isDeleting ? "Deleting..." : "Delete Shop"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
