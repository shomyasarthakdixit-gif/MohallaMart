"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Zap, MapPin, Store, CreditCard, Banknote } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import Script from "next/script";
import { useQuery } from "@tanstack/react-query";

export default function CartPage() {
  const [deliveryType, setDeliveryType] = useState<"SCHEDULED" | "EXPRESS">("SCHEDULED");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "ONLINE">("ONLINE");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { cart, isLoading, clearCart } = useCart();

  const items = cart?.items || [];

  const { data: addresses = [] } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const res = await api.get("/users/addresses");
      return res.data.addresses;
    }
  });

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // The backend uses the DB cart automatically!
      const { data } = await api.post("/orders", {
        deliveryType,
        paymentMethod,
        deliveryAddressId: selectedAddressId
      });
      
      if (paymentMethod === "ONLINE" && data.paymentOrder) {
         if (data.paymentOrder.id.startsWith("mock_")) {
           // Mock Flow
           const isSuccess = confirm("MOCK PAYMENT: Do you want to simulate a successful payment?");
           const verifyRes = await api.post("/payments/verify", {
             orderIds: data.orders.map((o: any) => o.id),
             razorpay_order_id: data.paymentOrder.id,
             razorpay_payment_id: "mock_payment_" + Date.now(),
             razorpay_signature: isSuccess ? "mock_success" : "mock_failed"
           });

           if (verifyRes.data.success) {
             clearCart();
             router.push("/checkout/success");
           } else {
             alert("Payment failed.");
             router.push("/orders"); // redirect to orders page
           }
         } else {
           // Real Razorpay Flow
           const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
              amount: data.paymentOrder.amount,
              currency: data.paymentOrder.currency,
              name: "MohallaMart",
              description: "Order Payment",
              order_id: data.paymentOrder.id,
              handler: async function (response: any) {
                  try {
                    const verifyRes = await api.post("/payments/verify", {
                      orderIds: data.orders.map((o: any) => o.id),
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature
                    });
                    if (verifyRes.data.success) {
                       clearCart();
                       router.push("/checkout/success");
                    }
                  } catch (e) {
                     alert("Payment verification failed");
                     router.push("/orders");
                  }
              },
              theme: {
                  color: "#3399cc"
              }
          };
          // @ts-ignore
          const rzp1 = new window.Razorpay(options);
          rzp1.open();
         }
      } else {
        // CASH
        clearCart();
        router.push("/checkout/success");
      }
    } catch (error: any) {
      console.error("Failed to place order:", error);
      alert(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center mt-20">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center mt-20 space-y-4">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <Link href="/home">
          <Button>Browse Shops</Button>
        </Link>
      </div>
    );
  }

  // Group items by shop
  const itemsByShop: Record<string, typeof items> = {};
  items.forEach(item => {
    const shopId = item.product.shop.id;
    if (!itemsByShop[shopId]) itemsByShop[shopId] = [];
    itemsByShop[shopId].push(item);
  });

  // Calculate totals
  let subtotal = 0;
  let totalScheduledFee = 0;
  let totalExpressFee = 0;
  
  Object.keys(itemsByShop).forEach(shopId => {
    const shopItems = itemsByShop[shopId];
    shopItems.forEach(item => {
      subtotal += item.product.price * item.quantity;
    });
    // Add delivery fee PER shop
    const shop = shopItems[0].product.shop;
    totalScheduledFee += shop.scheduledDeliveryFee || 20;
    totalExpressFee += shop.expressDeliveryFee || 50;
  });

  const totalDeliveryFee = deliveryType === "EXPRESS" ? totalExpressFee : totalScheduledFee;
  const total = subtotal + totalDeliveryFee;

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-2xl animate-in slide-in-from-right duration-300 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Link href="/home" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="space-y-4">
        {Object.keys(itemsByShop).map(shopId => {
          const shopItems = itemsByShop[shopId];
          const shop = shopItems[0].product.shop;
          const shopSubtotal = shopItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
          const shopDeliveryFee = deliveryType === "EXPRESS" ? (shop.expressDeliveryFee || 50) : (shop.scheduledDeliveryFee || 20);

          return (
            <Card key={shopId} className="overflow-hidden border-primary/20">
              <div className="bg-primary/5 p-3 border-b flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{shop.name}</span>
              </div>
              <div className="p-3 space-y-2">
                {shopItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} x ₹{item.product.price}</p>
                    </div>
                    <p className="font-semibold">₹{item.product.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${deliveryType === "SCHEDULED" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
            <input 
              type="radio" 
              name="delivery" 
              className="mt-1"
              checked={deliveryType === "SCHEDULED"}
              onChange={() => setDeliveryType("SCHEDULED")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-primary" /> Standard Delivery
              </div>
              <p className="text-sm text-muted-foreground mt-1">Delivered between 8 PM - 10 PM. Applied per shop.</p>
            </div>
            <div className="font-semibold text-sm">₹{totalScheduledFee} total</div>
          </label>

          <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${deliveryType === "EXPRESS" ? "border-accent bg-accent/5" : "hover:bg-muted/50"}`}>
            <input 
              type="radio" 
              name="delivery" 
              className="mt-1"
              checked={deliveryType === "EXPRESS"}
              onChange={() => setDeliveryType("EXPRESS")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                <Zap className="h-4 w-4 text-accent" /> Express Delivery
              </div>
              <p className="text-sm text-muted-foreground mt-1">Delivered within 30-45 minutes. Applied per shop.</p>
            </div>
            <div className="font-semibold text-sm">₹{totalExpressFee} total</div>
          </label>
        </CardContent>
    </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === "ONLINE" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
            <input 
              type="radio" 
              name="payment" 
              className="mt-1"
              checked={paymentMethod === "ONLINE"}
              onChange={() => setPaymentMethod("ONLINE")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                <CreditCard className="h-4 w-4 text-primary" /> Pay Online (UPI, Card, Netbanking)
              </div>
              <p className="text-sm text-muted-foreground mt-1">Fast, secure and contactless payment via Razorpay.</p>
            </div>
          </label>

          <label className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === "CASH" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
            <input 
              type="radio" 
              name="payment" 
              className="mt-1"
              checked={paymentMethod === "CASH"}
              onChange={() => setPaymentMethod("CASH")}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                <Banknote className="h-4 w-4 text-primary" /> Cash on Delivery (COD)
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pay with cash when your order arrives.</p>
            </div>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Deliver To</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl border border-dashed text-center">
                No addresses found. <Link href="/profile" className="text-primary hover:underline font-medium">Add one in your profile</Link>.
              </div>
            ) : (
              addresses.map((addr: any) => (
                <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' : 'border-border/50 hover:bg-muted/30'}`}>
                  <input 
                    type="radio" 
                    name="deliveryAddress" 
                    className="mt-1 flex-shrink-0"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div>
                    <div className="font-bold">{addr.type}</div>
                    <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{addr.text}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-lg border-primary/20">
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fees ({Object.keys(itemsByShop).length} shops)</span>
            <span>₹{totalDeliveryFee}</span>
          </div>
          <div className="border-t pt-3 mt-2 flex justify-between font-bold text-xl">
            <span>Total to pay</span>
            <span className="text-primary">₹{total}</span>
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          <Button 
            className="w-full h-14 text-lg font-bold rounded-xl shadow-md" 
            onClick={handleCheckout} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : paymentMethod === "ONLINE" ? `Pay ₹${total}` : `Place Order (COD)`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
