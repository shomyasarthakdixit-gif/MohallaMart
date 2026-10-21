"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Store, ArrowRight } from "lucide-react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    address?: string;
    category?: string;
    isOpen?: boolean;
    description?: string;
  };
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} className="h-full">
      <Link href={`/shop/${shop.id}`} className="block h-full outline-none group focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-2xl">
        <Card className="h-full bg-surface border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
          <div className="h-40 bg-muted relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
              <Store className="h-12 w-12 text-primary/40" />
            </div>
            {shop.isOpen !== false && (
              <div className="absolute top-3 left-3 bg-background/95 backdrop-blur shadow-sm text-[10px] font-bold px-2.5 py-1 rounded-full text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Open
              </div>
            )}
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5 truncate">
              {shop.category || "Local Store"}
            </p>
            <h4 className="font-bold text-lg text-foreground truncate mb-1.5 group-hover:text-primary transition-colors">
              {shop.name}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {shop.address || shop.description}
            </p>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Delivery available</span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
