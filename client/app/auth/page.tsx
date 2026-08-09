"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, User, Smartphone, KeyRound } from "lucide-react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";

export default function AuthPage() {
  const [role, setRole] = useState<"CUSTOMER" | "SHOPKEEPER">("CUSTOMER");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const { setAuth } = useAuthStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic formatting for IN numbers
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      
      // Bypass Firebase Auth for Local Development
      if (process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("DummyKey")) {
        console.log("Development mode: bypassing real SMS");
        setConfirmationResult({
          confirm: async (code: string) => {
            if (code !== "123456") throw new Error("Invalid mock OTP");
            return {
              user: {
                getIdToken: async () => "dev-mock-token-" + formattedPhone,
              }
            };
          }
        });
        setStep("OTP");
        alert("Development Mode: Use OTP 123456 to login");
        return;
      }

      // Setup reCAPTCHA if not exists
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
        });
      }
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep("OTP");
    } catch (error) {
      console.error("Error sending OTP", error);
      alert("Failed to send OTP. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Send to our backend
      const { api } = await import("@/lib/api");
      const response = await api.post("/auth/verify-phone", { idToken, role });

      const data = response.data;
      setAuth(data.user, data.accessToken);
      
      // Redirect based on role
      if (data.user.role === "SHOPKEEPER") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Error verifying OTP", error);
      const msg = error.response?.data?.error || error.message || "Invalid OTP";
      alert("Error: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="glass border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">MohallaMart</CardTitle>
              <CardDescription>Welcome to your neighborhood marketplace</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex p-1 bg-muted rounded-lg mb-6">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${role === "CUSTOMER" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setRole("CUSTOMER")}
              >
                <User className="w-4 h-4" /> Customer
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${role === "SHOPKEEPER" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setRole("SHOPKEEPER")}
              >
                <Store className="w-4 h-4" /> Shopkeeper
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === "PHONE" ? (
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="10-digit mobile number"
                        className="pl-10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending OTP..." : "Continue"}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter OTP</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="6-digit OTP"
                        className="pl-10 text-center tracking-[0.5em]"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      OTP sent to {phone}. <button type="button" onClick={() => setStep("PHONE")} className="text-primary hover:underline">Edit</button>
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
            <div id="recaptcha-container"></div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
