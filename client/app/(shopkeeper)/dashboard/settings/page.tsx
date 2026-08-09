"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Shop Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your shop profile, timings, and preferences.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleUpdate}>
          <Card className="shadow-lg border-border/50 overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="bg-muted/10 border-b border-border/30 pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" /> Profile Information
              </CardTitle>
              <CardDescription>
                These details will be publicly visible to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80"><Store className="h-4 w-4" /> Shop Name</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    className="h-12 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80"><MapPin className="h-4 w-4" /> Address</label>
                  <Input 
                    value={formData.address} 
                    onChange={e => setFormData({ ...formData, address: e.target.value })} 
                    className="h-12 bg-muted/20"
                    required
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80"><FileText className="h-4 w-4" /> Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    className="flex min-h-[100px] w-full rounded-xl border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell customers about your shop..."
                  />
                </div>
              </div>

              <div className="border-t border-border/30 pt-6 mt-6">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-foreground/80"><MapPin className="h-4 w-4" /> Shop Location & Delivery Radius</h3>
                <div className="mb-4">
                  <label className="text-sm font-semibold mb-2 block">Delivery Radius (km)</label>
                  <Input 
                    type="number" 
                    min="1"
                    max="50"
                    value={formData.deliveryRadius} 
                    onChange={e => setFormData({ ...formData, deliveryRadius: parseFloat(e.target.value) || 5 })} 
                    className="h-12 bg-muted/20 max-w-[200px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Customers outside this radius won't be able to place orders.</p>
                </div>
                <div className="bg-background/50 p-2 rounded-xl border border-border/50">
                  <MapPickerDynamic 
                    initialPosition={{ lat: formData.latitude, lng: formData.longitude }}
                    onLocationSelect={(lat, lng, addressText) => {
                      setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, address: addressText }));
                    }}
                  />
                </div>
              </div>
            </CardContent>

            <CardHeader className="bg-muted/10 border-y border-border/30 py-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Opening Time</label>
                <Input 
                  type="time" 
                  value={formData.openTime} 
                  onChange={e => setFormData({ ...formData, openTime: e.target.value })} 
                  className="h-12 bg-muted/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Closing Time</label>
                <Input 
                  type="time" 
                  value={formData.closeTime} 
                  onChange={e => setFormData({ ...formData, closeTime: e.target.value })} 
                  className="h-12 bg-muted/20"
                  required
                />
              </div>
            </CardContent>

            <CardHeader className="bg-muted/10 border-y border-border/30 py-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Delivery Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Scheduled Delivery Fee (₹)</label>
                <Input 
                  type="number" 
                  min="0"
                  value={formData.scheduledDeliveryFee} 
                  onChange={e => setFormData({ ...formData, scheduledDeliveryFee: parseFloat(e.target.value) || 0 })} 
                  className="h-12 bg-muted/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Express Delivery Fee (₹)</label>
                <Input 
                  type="number" 
                  min="0"
                  value={formData.expressDeliveryFee} 
                  onChange={e => setFormData({ ...formData, expressDeliveryFee: parseFloat(e.target.value) || 0 })} 
                  className="h-12 bg-muted/20"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="bg-muted/5 border-t border-border/30 pt-6 flex justify-end">
              <Button type="submit" disabled={updateShopMutation.isPending} className="h-12 px-8 font-bold shadow-md rounded-xl">
                <Save className="mr-2 h-5 w-5" /> {updateShopMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </motion.div>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border rounded-lg p-4 bg-destructive/5">
            <div>
              <h3 className="font-semibold text-foreground">Delete Shop</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently remove your shop and all of its data from MohallaMart.
              </p>
            </div>
            <Button 
              variant="destructive" 
              className="mt-4 sm:mt-0 whitespace-nowrap" 
              onClick={handleDeleteShop}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "Deleting..." : "Delete Shop"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
