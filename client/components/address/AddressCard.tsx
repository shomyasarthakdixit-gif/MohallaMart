"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Address {
  id: string;
  text: string;
  type: string;
  default?: boolean;
}

interface AddressCardProps {
  address: Address;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function AddressCard({ address, onDelete, isDeleting }: AddressCardProps) {
  return (
    <Card className={`overflow-hidden transition-all duration-300 border-border/50 bg-surface rounded-[16px] ${address.default ? 'ring-2 ring-primary/50' : 'hover:border-primary/30'}`}>
      <CardContent className="p-0">
        <div className="flex items-start p-5 sm:p-6">
          <div className="mr-4 mt-1">
            <div className={`p-3 rounded-full ${address.default ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <MapPin className="h-6 w-6" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-lg text-foreground">{address.type}</h4>
                {address.default && (
                  <span className="bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                    Default
                  </span>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{address.text}</p>
            
            <div className="flex items-center gap-3 pt-4 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(address.id)}
                disabled={isDeleting}
                className="h-9 px-4 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground font-medium rounded-lg transition-colors"
                aria-label={`Delete ${address.type} address`}
              >
                {isDeleting ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
