"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressCard } from "./AddressCard";
import { AddAddressModal } from "./AddAddressModal";
import { motion } from "framer-motion";

export function AddressList() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold font-serif tracking-tight text-foreground">Saved Addresses</h3>
          <p className="text-muted-foreground text-sm mt-1">Manage where we deliver your orders.</p>
        </div>
        <Button 
          className="rounded-xl shadow-md bg-primary text-primary-foreground font-bold group h-12 px-6"
          onClick={() => setShowModal(true)}
        >
          <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" /> Add New
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-2">
        {isLoading ? (
          <div className="space-y-4">
             <div className="h-32 bg-muted/50 rounded-[16px] animate-pulse"></div>
             <div className="h-32 bg-muted/50 rounded-[16px] animate-pulse"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-[20px] border border-dashed border-border/60">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium text-lg">No saved addresses yet.</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Add one to speed up checkout.</p>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowModal(true)}>
              Add your first address
            </Button>
          </div>
        ) : (
          addresses.map((address: { id: string; text: string; type: string; default?: boolean }, i: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={address.id}
            >
              <AddressCard 
                address={address} 
                onDelete={(id) => deleteAddressMutation.mutate(id)}
                isDeleting={deleteAddressMutation.isPending && deleteAddressMutation.variables === address.id}
              />
            </motion.div>
          ))
        )}
      </div>

      <AddAddressModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
