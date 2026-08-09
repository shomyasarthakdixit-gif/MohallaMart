"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Edit3, Trash2, Plus, ArrowLeft, LogOut, Package, CreditCard, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import MapPickerDynamic from "@/components/ui/MapPickerDynamic";

export default function CustomerProfile() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("addresses");
  const queryClient = useQueryClient();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ lat: 0, lng: 0, text: "", type: "Home" });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const res = await api.get("/users/addresses");
      return res.data.addresses;
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    }
  });

  const handleDeleteAddress = (id: string) => {
    deleteAddressMutation.mutate(id);
  };

  const handleLocationSelect = (lat: number, lng: number, addressText: string) => {
    setNewAddress(prev => ({ ...prev, lat, lng, text: addressText }));
  };

  const handleSaveAddress = async () => {
    if (!newAddress.text) {
      alert("Please select a valid location on the map.");
      return;
    }
    setIsSavingAddress(true);
    try {
       await api.post("/users/addresses", newAddress);
       setShowAddressModal(false);
       queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    } catch (error) {
       console.error(error);
       alert("Failed to save address");
    } finally {
       setIsSavingAddress(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const menuItems = [
    { id: "orders", icon: Package, label: "My Orders", desc: "View past and active orders" },
    { id: "addresses", icon: MapPin, label: "Saved Addresses", desc: "Manage delivery locations" },
    { id: "payments", icon: CreditCard, label: "Payment Methods", desc: "Saved cards and UPI" },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-24 max-w-5xl">
      <Link href="/home" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden group flex flex-col items-center text-center">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/20 to-transparent -z-10" />
            
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                <User className="h-12 w-12 text-primary" />
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-colors">
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight">{user?.name || "John Doe"}</h2>
            <p className="text-muted-foreground mt-1 font-medium">{user?.phone || "+91 9876543210"}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
              Verified User
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden flex flex-col divide-y divide-border/30">
            {menuItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center text-left p-4 sm:p-5 transition-colors ${activeTab === item.id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-muted/30 border-l-4 border-transparent'}`}
              >
                <div className={`p-2.5 rounded-xl mr-4 transition-colors ${activeTab === item.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${activeTab === item.id ? 'text-primary' : ''}`}>{item.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${activeTab === item.id ? 'text-primary translate-x-1' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center justify-center gap-2 h-12 rounded-2xl"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" /> Log Out
          </Button>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[500px]"
        >
          <AnimatePresence mode="wait">
            {activeTab === "addresses" && (
              <motion.div 
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Saved Addresses</h3>
                    <p className="text-muted-foreground text-sm mt-1">Manage where we deliver your orders.</p>
                  </div>
                  <Button 
                    className="rounded-xl shadow-md hidden sm:flex bg-primary text-primary-foreground font-bold group"
                    onClick={() => setShowAddressModal(true)}
                  >
                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" /> Add New
                  </Button>
                </div>

                <Button 
                  className="w-full sm:hidden rounded-xl h-12 border-dashed border-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setShowAddressModal(true)}
                >
                  <Plus className="mr-2 h-5 w-5" /> Add New Address
                </Button>

                <div className="grid grid-cols-1 gap-4">
                  {isLoadingAddresses ? (
                    <div className="text-center py-10 text-muted-foreground">Loading addresses...</div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-10 bg-muted/20 rounded-3xl border border-dashed border-border/50">
                      <MapPin className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground font-medium">No saved addresses found.</p>
                    </div>
                  ) : (
                    addresses.map((address: any, i: number) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={address.id}
                    >
                      <Card className={`overflow-hidden transition-all duration-300 border-border/50 hover:shadow-md ${address.default ? 'ring-2 ring-primary/50 bg-primary/[0.02]' : 'hover:border-primary/30'}`}>
                        <CardContent className="p-0">
                          <div className="flex items-start p-5 sm:p-6">
                            <div className="mr-4 mt-1">
                              <div className={`p-3 rounded-full ${address.default ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <MapPin className="h-6 w-6" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-bold text-lg">{address.type}</h4>
                                  {address.default && (
                                    <span className="bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{address.text}</p>
                              
                              <div className="flex items-center gap-3 pt-3 border-t border-border/50 mt-4">
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-muted-foreground hover:text-foreground font-medium rounded-lg">
                                  Edit
                                </Button>
                                <div className="w-px h-4 bg-border"></div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="h-8 px-3 text-destructive/80 hover:text-destructive hover:bg-destructive/10 font-medium rounded-lg"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )))}
                </div>
              </motion.div>
            )}

            {activeTab !== "addresses" && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 opacity-50">
                   {activeTab === "orders" ? <Package className="h-10 w-10 text-muted-foreground" /> : <CreditCard className="h-10 w-10 text-muted-foreground" />}
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Coming Soon</h3>
                <p className="text-muted-foreground max-w-sm">This feature will be available in the upcoming phases. Stay tuned!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[5%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-card border border-border/50 shadow-2xl rounded-3xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
                <div>
                  <h2 className="text-xl font-bold">Add New Address</h2>
                  <p className="text-sm text-muted-foreground">Pinpoint your exact location for fast delivery</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAddressModal(false)} className="rounded-full hover:bg-muted">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <MapPickerDynamic onLocationSelect={handleLocationSelect} />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Address details</label>
                    <Input 
                      value={newAddress.text}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="e.g. Flat 402, Block B..."
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Save As</label>
                    <div className="flex gap-2">
                      {["Home", "Work", "Other"].map(type => (
                        <Button 
                          key={type}
                          type="button"
                          variant={newAddress.type === type ? "default" : "outline"}
                          className={`flex-1 rounded-xl ${newAddress.type === type ? 'shadow-md' : 'border-border/50 hover:bg-muted/50'}`}
                          onClick={() => setNewAddress(prev => ({ ...prev, type }))}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-border/50 bg-background flex gap-3 justify-end">
                <Button variant="outline" className="rounded-xl border-border/50 hover:bg-muted/50" onClick={() => setShowAddressModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="rounded-xl shadow-md font-bold px-8" 
                  onClick={handleSaveAddress}
                  disabled={!newAddress.text || isSavingAddress}
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
