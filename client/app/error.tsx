"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
      <div className="bg-surface border border-border p-8 sm:p-12 rounded-3xl max-w-md w-full text-center shadow-sm">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4 tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => reset()} 
            className="w-full h-14 text-lg font-bold rounded-xl"
          >
            Try Again
          </Button>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full h-12 text-base rounded-xl font-medium border-border/50">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
