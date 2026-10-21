"use client";

import { CreditCard, Banknote } from "lucide-react";

interface PaymentSelectorProps {
  paymentMethod: "ONLINE" | "CASH";
  setPaymentMethod: (method: "ONLINE" | "CASH") => void;
}

export function PaymentSelector({ paymentMethod, setPaymentMethod }: PaymentSelectorProps) {
  return (
    <div className="space-y-3">
      <label 
        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
          paymentMethod === "ONLINE" 
            ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm" 
            : "border-border hover:bg-muted/30"
        }`}
      >
        <input 
          type="radio" 
          name="payment" 
          className="mt-1"
          checked={paymentMethod === "ONLINE"}
          onChange={() => setPaymentMethod("ONLINE")}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <CreditCard className="h-4 w-4 text-primary" /> Pay Online
          </div>
          <p className="text-sm text-muted-foreground mt-1">Fast, secure, and contactless payment via Razorpay.</p>
        </div>
      </label>

      <label 
        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
          paymentMethod === "CASH" 
            ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm" 
            : "border-border hover:bg-muted/30"
        }`}
      >
        <input 
          type="radio" 
          name="payment" 
          className="mt-1"
          checked={paymentMethod === "CASH"}
          onChange={() => setPaymentMethod("CASH")}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Banknote className="h-4 w-4 text-primary" /> Cash on Delivery (COD)
          </div>
          <p className="text-sm text-muted-foreground mt-1">Pay with cash when your order arrives.</p>
        </div>
      </label>
    </div>
  );
}
