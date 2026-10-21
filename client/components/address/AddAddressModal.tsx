"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapPickerDynamic from "@/components/ui/MapPickerDynamic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAddressModal({ isOpen, onClose }: AddAddressModalProps) {
  const queryClient = useQueryClient();
  const [newAddress, setNewAddress] = useState({ lat: 0, lng: 0, text: "", type: "Home" });
  
  const addAddressMutation = useMutation({
    mutationFn: async (addressData: typeof newAddress) => {
      await api.post("/users/addresses", addressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      onClose();
      // Reset form
      setNewAddress({ lat: 0, lng: 0, text: "", type: "Home" });
    }
  });

  const handleLocationSelect = (lat: number, lng: number, addressText: string) => {
    setNewAddress(prev => ({ ...prev, lat, lng, text: addressText }));
  };

  const handleSaveAddress = () => {
    if (!newAddress.text) {
      alert("Please select a valid location on the map.");
      return;
    }
    addAddressMutation.mutate(newAddress);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-4 top-[5%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-surface border border-border/50 shadow-2xl rounded-[24px] z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground">Add New Address</h2>
                <p className="text-sm text-muted-foreground mt-1">Pinpoint your exact location for fast delivery</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted" aria-label="Close modal">
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <MapPickerDynamic onLocationSelect={handleLocationSelect} />
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="addressText" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Address details</label>
                  <Input 
                    id="addressText"
                    value={newAddress.text}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="e.g. Flat 402, Block B..."
                    className="bg-background/50 border-border/50 rounded-xl h-12"
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
                        className={`flex-1 rounded-xl h-11 ${newAddress.type === type ? 'shadow-md' : 'border-border/50 text-muted-foreground hover:bg-muted/50'}`}
                        onClick={() => setNewAddress(prev => ({ ...prev, type }))}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-border/50 bg-background flex gap-3 justify-end rounded-b-[24px]">
              <Button variant="outline" className="rounded-xl h-12 border-border/50 text-foreground hover:bg-muted/50 font-medium" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                className="rounded-xl h-12 shadow-md font-bold px-8" 
                onClick={handleSaveAddress}
                disabled={!newAddress.text || addAddressMutation.isPending}
              >
                {addAddressMutation.isPending ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
