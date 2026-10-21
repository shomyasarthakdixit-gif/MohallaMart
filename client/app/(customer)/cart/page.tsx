"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Store, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import Script from "next/script";
import { useQuery } from "@tanstack/react-query";
import { CartItem } from "@/components/cart/CartItem";
import { DeliverySelector } from "@/components/checkout/DeliverySelector";
import { PaymentSelector } from "@/components/checkout/PaymentSelector";

export default function CartPage() {
  const [deliveryType, setDeliveryType] = useState<"SCHEDULED" | "EXPRESS">("SCHEDULED");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "ONLINE">("ONLINE");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  
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

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await api.get("/users/me");
      return res.data.user;
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
      const { data } = await api.post("/orders", {
        deliveryType,
        paymentMethod,
        deliveryAddressId: selectedAddressId,
        couponCode: appliedCoupon?.code,
        useLoyaltyPoints
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
    return <div className="container mx-auto p-4 text-center mt-20 animate-pulse font-medium text-muted-foreground">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center mt-20 space-y-6">
        <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl opacity-50">🛒</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Discover nearby shops and find great local products.</p>
        <Link href="/home" className="inline-block">
          <Button className="h-14 px-8 rounded-full font-bold shadow-lg hover:shadow-xl transition-all mt-4">
            Browse Shops
          </Button>
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
  let total = subtotal + totalDeliveryFee;
  let loyaltyDiscount = 0;
  
  if (appliedCoupon) {
    total = Math.max(0, total - appliedCoupon.discountAmount);
  }
  
  if (useLoyaltyPoints && userProfile?.loyaltyPoints > 0) {
    const pointsDiscount = userProfile.loyaltyPoints * 0.05; // 100 points = 5 Rs
    loyaltyDiscount = Math.min(pointsDiscount, total);
    total = Math.max(0, total - loyaltyDiscount);
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await api.post("/coupons/validate", {
        code: couponCode,
        orderAmount: subtotal + totalDeliveryFee
      });
      setAppliedCoupon(res.data.coupon);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-32">
      {/* @ts-ignore - Next.js Script props type mismatch in current version */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-foreground">Checkout</h1>
        <Link href="/home" className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-start">
        {/* Left Column: Cart Items */}
        <div className="xl:col-span-7 space-y-8">
          {Object.keys(itemsByShop).map(shopId => {
            const shopItems = itemsByShop[shopId];
            const shop = shopItems[0].product.shop;

            return (
              <div key={shopId} className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-muted/30 p-4 sm:p-5 border-b border-border flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-foreground text-lg">{shop.name}</span>
                </div>
                <div className="p-4 sm:p-6 divide-y divide-border/50">
                  {shopItems.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Checkout Options & Summary */}
        <div className="xl:col-span-5 space-y-8 sticky top-24">
          
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-foreground mb-4">Delivery Options</h2>
            <DeliverySelector 
              deliveryType={deliveryType} 
              setDeliveryType={setDeliveryType} 
              totalScheduledFee={totalScheduledFee} 
              totalExpressFee={totalExpressFee} 
            />
          </div>

          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Deliver To
            </h2>
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl border border-dashed text-center">
                  No addresses found. <Link href="/profile" className="text-primary hover:underline font-bold">Add one in your profile</Link>.
                </div>
              ) : (
                addresses.map((addr: any) => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' : 'border-border hover:bg-muted/30'}`}>
                    <input 
                      type="radio" 
                      name="deliveryAddress" 
                      className="mt-1 flex-shrink-0 text-primary"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div>
                      <div className="font-bold text-foreground">{addr.type}</div>
                      <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{addr.text}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-foreground mb-4">Payment Method</h2>
            <PaymentSelector 
              paymentMethod={paymentMethod} 
              setPaymentMethod={setPaymentMethod} 
            />
          </div>

          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-foreground">Order Summary</h2>
            
            <div className="space-y-3 text-sm text-muted-foreground font-medium">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-foreground font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fees ({Object.keys(itemsByShop).length} shops)</span>
                <span className="text-foreground font-bold">₹{totalDeliveryFee}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value)} 
                    placeholder="Promo Code" 
                    className="flex-1 bg-background border border-border px-4 py-2 rounded-xl text-sm uppercase outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                  <Button variant="secondary" onClick={applyCoupon} disabled={couponLoading || !couponCode} className="rounded-xl font-bold px-6">
                    {couponLoading ? "..." : "Apply"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-sm font-bold border border-emerald-500/20">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4" /> {appliedCoupon.code} Applied
                  </div>
                  <div className="flex items-center gap-2">
                    <span>-₹{appliedCoupon.discountAmount}</span>
                    <button onClick={removeCoupon} className="hover:opacity-70 transition-opacity">
                       <span className="text-xl leading-none">&times;</span>
                    </button>
                  </div>
                </div>
              )}
              {couponError && <p className="text-destructive text-xs mt-2 font-medium">{couponError}</p>}
            </div>

            {userProfile?.loyaltyPoints > 0 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <label className="flex items-center gap-3 text-sm cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={useLoyaltyPoints}
                    onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">Use {userProfile.loyaltyPoints} Loyalty Points</div>
                    <div className="text-muted-foreground text-xs">(Value: ₹{userProfile.loyaltyPoints * 0.05})</div>
                  </div>
                </label>
                {useLoyaltyPoints && <span className="text-emerald-600 dark:text-emerald-400 font-bold">-₹{loyaltyDiscount}</span>}
              </div>
            )}

            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-bold text-lg text-foreground">Total to pay</span>
              <span className="text-3xl font-extrabold text-foreground">₹{total}</span>
            </div>

            {/* Desktop Checkout Button */}
            <Button 
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-md hover:shadow-lg transition-all mt-6 hidden sm:flex" 
              onClick={handleCheckout} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : paymentMethod === "ONLINE" ? `Pay ₹${total}` : `Place Order (COD)`}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-40 sm:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Button 
          className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg" 
          onClick={handleCheckout} 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : paymentMethod === "ONLINE" ? `Pay ₹${total}` : `Place Order (COD)`}
        </Button>
      </div>
    </div>
  );
}
