"use client";

import { ProfileInsightsCard } from "@/components/profile/ProfileInsightsCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CustomerProfile() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link href="/home" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>

      <div>
        <h3 className="text-2xl font-bold font-serif tracking-tight text-foreground">My Profile</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-6">Manage your account details and view your activity.</p>
      </div>
      
      <ProfileInsightsCard />
    </motion.div>
  );
}
