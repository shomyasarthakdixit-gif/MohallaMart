import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[70vh] text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20"></div>
        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
      </div>
      
      <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Order Successfully Placed!</h1>
      <p className="text-muted-foreground mb-10 max-w-md text-lg leading-relaxed">
        Your order has been sent to the shop. Please wait for the shopkeeper to confirm it. You can track its progress in the Orders section.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link href="/home" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full rounded-2xl h-14 px-8 font-bold border-border/50 shadow-sm hover:bg-muted/50 transition-colors">
            Back to Home
          </Button>
        </Link>
        <Link href="/orders" className="w-full sm:w-auto">
          <Button className="w-full rounded-2xl h-14 px-8 font-bold shadow-lg hover:shadow-xl transition-all">
            Track Order
          </Button>
        </Link>
      </div>
    </div>
  );
}
