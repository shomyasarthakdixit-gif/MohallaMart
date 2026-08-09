"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin, Clock } from "lucide-react";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="z-10 w-full max-w-lg animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Register Your Shop</h1>
          <p className="text-muted-foreground mt-2">Join MohallaMart and start selling to your neighborhood.</p>
        </div>

        <Card className="border-primary/10 shadow-xl backdrop-blur-sm bg-card/90">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>Enter the basic information about your store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Shop Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    required 
                    placeholder="e.g. Sharma General Store" 
                    className="pl-9"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    required 
                    placeholder="e.g. Shop No 4, Main Market..." 
                    className="pl-9"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description (Optional)</label>
                <Input 
                  placeholder="What do you sell?" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Opening Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="time" 
                      required 
                      className="pl-9"
                      value={formData.openTime}
                      onChange={(e) => setFormData({...formData, openTime: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Closing Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="time" 
                      required 
                      className="pl-9"
                      value={formData.closeTime}
                      onChange={(e) => setFormData({...formData, closeTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
                {isLoading ? "Registering..." : "Complete Registration"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
