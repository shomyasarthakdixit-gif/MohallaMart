import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[70vh] text-center animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <CheckCircle2 className="w-12 h-12 text-amber-600" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Order Pending Confirmation!</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Your orders have been sent to the respective shops. Please wait for the shopkeepers to accept your order. You can track the status in the Orders section.
      </p>

      <div className="flex gap-4">
        <Link href="/home">
          <Button variant="outline" className="rounded-xl h-12 px-6 font-semibold">
            Back to Home
          </Button>
        </Link>
        <Link href="/orders">
          <Button className="rounded-xl h-12 px-6 font-bold shadow-md bg-primary text-primary-foreground">
            View Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
