"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, User, Smartphone, KeyRound, ShoppingBag, ArrowRight, Mail } from "lucide-react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/lib/firebase";

type AuthMethod = "PHONE" | "EMAIL" | "GOOGLE" | null;

export default function LandingPage() {
  const [role, setRole] = useState<"CUSTOMER" | "SHOPKEEPER" | null>(null);
  const [shopkeeperIntent, setShopkeeperIntent] = useState<"LOGIN" | "REGISTER" | null>(null);
  
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [step, setStep] = useState<"ROLE_SELECTION" | "METHOD_SELECTION" | "CREDENTIALS" | "OTP">("ROLE_SELECTION");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const { setAuth } = useAuthStore();

  const handleRoleSelect = (selectedRole: "CUSTOMER" | "SHOPKEEPER") => {
    setRole(selectedRole);
    if (selectedRole === "CUSTOMER") {
      setStep("METHOD_SELECTION");
    }
  };

  const handleSuccessfulLogin = async (idToken: string) => {
    try {
      const { api } = await import("@/lib/api");
      const response = await api.post("/auth/verify-phone", { idToken, role });

      const data = response.data;
      setAuth(data.user, data.accessToken);
      
      if (data.user.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else if (role === "SHOPKEEPER") {
        if (shopkeeperIntent === "REGISTER") {
          window.location.href = "/register-shop";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        window.location.href = "/home";
      }
    } catch (error: any) {
      console.error("Error verifying on backend", error);
      const msg = error.response?.data?.error || error.message || "Authentication Failed";
      alert("Error: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("DummyKey")) {
        const mockToken = "dev-mock-token-google-user";
        await handleSuccessfulLogin(mockToken);
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await handleSuccessfulLogin(idToken);
    } catch (error) {
      console.error("Google Auth Error", error);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent, isRegister: boolean) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("DummyKey")) {
        const mockToken = "dev-mock-token-" + email;
        await handleSuccessfulLogin(mockToken);
        return;
      }

      let result;
      if (isRegister) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      const idToken = await result.user.getIdToken();
      await handleSuccessfulLogin(idToken);
    } catch (error: any) {
      console.error("Email Auth Error", error);
      alert(error.message);
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      
      if (process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("DummyKey")) {
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
      await handleSuccessfulLogin(idToken);
    } catch (error: any) {
      console.error("Error verifying OTP", error);
      alert("Invalid OTP");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4 font-sans">
      {/* Ultra Premium Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(var(--primary),0.05)_0deg,transparent_60deg,transparent_300deg,rgba(var(--secondary),0.05)_360deg)] opacity-70"
        />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-5 glass rounded-3xl shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)] mb-8 border border-white/10 glow-primary">
            <ShoppingBag className="h-14 w-14 text-primary" />
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-gradient-premium animate-gradient">
            MohallaMart
          </h1>
          <p className="mt-6 text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto tracking-wide">
            Your neighborhood marketplace, <span className="text-foreground">elevated.</span>
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "ROLE_SELECTION" && !role && (
            <motion.div 
              key="role-selection"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
            >
              <Card 
                className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.3)] border-border/50 glass hover:border-primary/50"
                onClick={() => handleRoleSelect("CUSTOMER")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                  <div className="p-5 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                    <User className="w-14 h-14 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">Customer</h3>
                  <p className="text-muted-foreground leading-relaxed">Experience ultra-fast hyperlocal delivery with premium quality and service.</p>
                  <Button className="mt-6 w-full h-12 text-lg rounded-xl group-hover:bg-primary transition-colors" variant="outline">
                    Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(var(--secondary),0.3)] border-border/50 glass hover:border-secondary/50"
                onClick={() => handleRoleSelect("SHOPKEEPER")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                  <div className="p-5 bg-secondary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500 group-hover:-rotate-3">
                    <Store className="w-14 h-14 text-secondary" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">Shopkeeper</h3>
                  <p className="text-muted-foreground leading-relaxed">Grow your business with our state-of-the-art digital storefront platform.</p>
                  <Button className="mt-6 w-full h-12 text-lg rounded-xl group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors" variant="outline">
                    Manage Shop <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {role === "SHOPKEEPER" && !shopkeeperIntent && (
            <motion.div
              key="shopkeeper-intent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <Card className="glass border-border/50 shadow-2xl bg-background/60 backdrop-blur-xl">
                <CardHeader className="text-center pb-4 border-b border-border/50">
                  <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Store className="w-8 h-8 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Shopkeeper Portal</CardTitle>
                  <CardDescription className="text-base mt-2">Welcome to your digital storefront</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button 
                    className="w-full h-14 text-lg rounded-xl bg-gradient-premium hover:opacity-90 border-0" 
                    onClick={() => { setShopkeeperIntent("REGISTER"); setStep("METHOD_SELECTION"); }}
                  >
                    Register New Shop
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 text-lg rounded-xl border-border/50 hover:bg-muted/50"
                    onClick={() => { setShopkeeperIntent("LOGIN"); setStep("METHOD_SELECTION"); }}
                  >
                    Login to Dashboard
                  </Button>
                  <Button variant="ghost" className="w-full h-12 rounded-xl mt-2" onClick={() => setRole(null)}>
                    Back to Roles
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "METHOD_SELECTION" && (
            <motion.div
              key="method-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Card className="glass border-border/50 shadow-2xl bg-background/60 backdrop-blur-xl">
                <CardHeader className="text-center pb-4 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                  <CardDescription className="text-base mt-2">Choose how you want to continue</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button 
                    variant="outline"
                    className="w-full h-14 text-lg rounded-xl flex items-center gap-3 border-border/50 hover:bg-muted/50"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    Continue with Google
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full h-14 text-lg rounded-xl flex items-center gap-3 border-border/50 hover:bg-muted/50"
                    onClick={() => { setAuthMethod("EMAIL"); setStep("CREDENTIALS"); }}
                  >
                    <Mail className="w-5 h-5" /> Continue with Email
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full h-14 text-lg rounded-xl flex items-center gap-3 border-border/50 hover:bg-muted/50"
                    onClick={() => { setAuthMethod("PHONE"); setStep("CREDENTIALS"); }}
                  >
                    <Smartphone className="w-5 h-5" /> Continue with Phone
                  </Button>

                  <Button variant="ghost" className="w-full h-12 rounded-xl mt-4" onClick={() => {
                    if (role === "CUSTOMER") setRole(null);
                    else setShopkeeperIntent(null);
                  }}>
                    Back
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "CREDENTIALS" && (
            <motion.div
              key="credentials-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Card className="glass border-border/50 shadow-2xl bg-background/60 backdrop-blur-xl">
                <CardHeader className="text-center pb-4 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold">
                    {authMethod === "EMAIL" ? "Email Login" : "Phone Login"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {authMethod === "PHONE" ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mobile Number</label>
                        <div className="relative">
                          <Smartphone className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="Enter 10-digit number"
                            className="pl-12 h-14 text-lg rounded-xl bg-background/50 border-border/50"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-14 text-lg rounded-xl bg-gradient-premium hover:opacity-90 border-0" disabled={isLoading}>
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </form>
                  ) : (
                    <form className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="h-14 text-lg rounded-xl bg-background/50 border-border/50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-14 text-lg rounded-xl bg-background/50 border-border/50"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex gap-4">
                        <Button 
                          type="button" 
                          onClick={(e) => handleEmailAuth(e, false)}
                          className="flex-1 h-14 text-lg rounded-xl bg-gradient-premium hover:opacity-90 border-0" 
                          disabled={isLoading}
                        >
                          Login
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={(e) => handleEmailAuth(e, true)}
                          className="flex-1 h-14 text-lg rounded-xl border-border/50 hover:bg-muted/50" 
                          disabled={isLoading}
                        >
                          Sign Up
                        </Button>
                      </div>
                    </form>
                  )}
                  <Button variant="ghost" type="button" className="w-full h-12 rounded-xl mt-4" onClick={() => setStep("METHOD_SELECTION")}>
                    Back
                  </Button>
                  <div id="recaptcha-container"></div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "OTP" && (
            <motion.div
              key="otp-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Card className="glass border-border/50 shadow-2xl bg-background/60 backdrop-blur-xl">
                <CardHeader className="text-center pb-4 border-b border-border/50">
                  <CardTitle className="text-2xl font-bold">Verification</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Enter OTP</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="6-digit OTP"
                          className="pl-12 h-14 text-center tracking-[0.5em] font-bold text-2xl rounded-xl bg-background/50 border-border/50"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-sm text-center text-muted-foreground mt-4">
                        OTP sent to {phone}. <button type="button" onClick={() => setStep("CREDENTIALS")} className="text-primary hover:underline font-medium">Edit</button>
                      </p>
                    </div>
                    <Button type="submit" className="w-full h-14 text-lg rounded-xl bg-gradient-premium hover:opacity-90 border-0" disabled={isLoading || otp.length !== 6}>
                      {isLoading ? "Verifying..." : "Verify & Continue"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
