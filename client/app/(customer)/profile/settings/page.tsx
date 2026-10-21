"use client";

import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LanguageSettings />
    </motion.div>
  );
}
