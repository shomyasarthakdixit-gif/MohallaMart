"use client";

import { Languages } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export function LanguageSettings() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold font-serif tracking-tight text-foreground">Settings</h3>
      
      <Card className="rounded-[20px] border-border/50 shadow-sm overflow-hidden bg-surface">
        <CardHeader className="bg-muted/10 border-b border-border/50 px-6 py-5">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Languages className="w-5 h-5 text-primary" />
            Language Preferences
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">Choose your preferred language for the MohallaMart interface</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <button 
              className={`flex flex-col items-center justify-center p-6 rounded-[16px] border-2 transition-all duration-300 ${language === "en" ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border/50 text-foreground hover:border-primary/30 hover:bg-muted/30'}`}
              onClick={() => setLanguage("en")}
            >
              <span className="text-2xl font-bold mb-1">En</span>
              <span className="font-medium">English</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center p-6 rounded-[16px] border-2 transition-all duration-300 ${language === "hi" ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border/50 text-foreground hover:border-primary/30 hover:bg-muted/30'}`}
              onClick={() => setLanguage("hi")}
            >
              <span className="text-2xl font-bold mb-1">हि</span>
              <span className="font-medium">हिन्दी</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
