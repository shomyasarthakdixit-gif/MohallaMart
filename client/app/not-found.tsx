import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
      <div className="bg-surface border border-border p-8 sm:p-12 rounded-3xl max-w-md w-full text-center shadow-sm">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPinOff className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/" className="w-full">
            <Button className="w-full h-14 text-lg font-bold rounded-xl">
              Back to Home
            </Button>
          </Link>
          <Link href="javascript:history.back()" className="w-full">
            <Button variant="ghost" className="w-full h-12 text-base rounded-xl font-medium">
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
