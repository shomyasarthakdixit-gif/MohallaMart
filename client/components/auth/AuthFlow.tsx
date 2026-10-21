"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, User, Smartphone, KeyRound, ArrowRight, Mail } from "lucide-react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/lib/firebase";

type AuthMethod = "PHONE" | "EMAIL" | "GOOGLE" | null;

interface AuthFlowProps {
  initialMode?: "LOGIN" | "REGISTER";
}

export function AuthFlow({ initialMode = "LOGIN" }: AuthFlowProps) {
  const router = useRouter();
  const { user, setAuth, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && user) {
      if (user.role === "ADMIN") router.replace("/admin/dashboard");
      else if (user.role === "SHOPKEEPER") router.replace("/dashboard");
      else router.replace("/home");
    }
  }, [user, hasHydrated, router]);

  const [role, setRole] = useState<"CUSTOMER" | "SHOPKEEPER" | null>(null);
  const [shopkeeperIntent, setShopkeeperIntent] = useState<"LOGIN" | "REGISTER" | null>(initialMode);
  
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [step, setStep] = useState<"ROLE_SELECTION" | "METHOD_SELECTION" | "CREDENTIALS" | "OTP">("ROLE_SELECTION");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const handleRoleSelect = (selectedRole: "CUSTOMER" | "SHOPKEEPER") => {
    setRole(selectedRole);
    if (selectedRole === "CUSTOMER") {
      setStep("METHOD_SELECTION");
    } else if (selectedRole === "SHOPKEEPER" && shopkeeperIntent) {
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
        if (shopkeeperIntent === "REGISTER" || initialMode === "REGISTER") {
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
    <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        {step === "ROLE_SELECTION" && !role && (
          <motion.div 
            key="role-selection"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-8 w-full max-w-4xl"
          >
            <Card 
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border bg-surface hover:border-primary/50"
              onClick={() => handleRoleSelect("CUSTOMER")}
            >
              <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="p-5 bg-primary/10 rounded-2xl text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Customer</h3>
                <p className="text-muted-foreground leading-relaxed">Experience ultra-fast hyperlocal delivery with premium quality and service.</p>
                <Button className="mt-6 w-full h-12 text-lg rounded-xl" variant="outline">
                  {initialMode === "REGISTER" ? "Sign Up as Customer" : "Login as Customer"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border bg-surface hover:border-primary/50"
              onClick={() => handleRoleSelect("SHOPKEEPER")}
            >
              <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="p-5 bg-secondary/20 rounded-2xl text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Store className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Shopkeeper</h3>
                <p className="text-muted-foreground leading-relaxed">Grow your business with our state-of-the-art digital storefront platform.</p>
                <Button className="mt-6 w-full h-12 text-lg rounded-xl" variant="outline">
                  {initialMode === "REGISTER" ? "Register Shop" : "Login as Shopkeeper"} <ArrowRight className="ml-2 w-5 h-5" />
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
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="premium-card">
              <CardHeader className="text-center pb-4 border-b border-border/50">
                <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                  <Store className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl font-bold">Shopkeeper Portal</CardTitle>
                <CardDescription className="text-base mt-2">Welcome to your digital storefront</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button 
                  className="w-full h-14 text-lg rounded-xl" 
                  onClick={() => { setShopkeeperIntent("REGISTER"); setStep("METHOD_SELECTION"); }}
                >
                  Register New Shop
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-14 text-lg rounded-xl"
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
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="premium-card">
              <CardHeader className="text-center pb-4 border-b border-border/50">
                <CardTitle className="text-2xl font-bold">{initialMode === "REGISTER" ? "Create Account" : "Welcome Back"}</CardTitle>
                <CardDescription className="text-base mt-2">Choose how you want to continue</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button 
                  variant="outline"
                  className="w-full h-14 text-lg rounded-xl flex items-center justify-center gap-3"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full h-14 text-lg rounded-xl flex items-center gap-3"
                  onClick={() => { setAuthMethod("EMAIL"); setStep("CREDENTIALS"); }}
                >
                  <Mail className="w-5 h-5" /> Continue with Email
                </Button>

                <Button 
                  variant="outline"
                  className="w-full h-14 text-lg rounded-xl flex items-center gap-3"
                  onClick={() => { setAuthMethod("PHONE"); setStep("CREDENTIALS"); }}
                >
                  <Smartphone className="w-5 h-5" /> Continue with Phone
                </Button>

                <Button variant="ghost" className="w-full h-12 rounded-xl mt-4" onClick={() => {
                  if (role === "CUSTOMER") {
                    setRole(null);
                    setStep("ROLE_SELECTION");
                  }
                  else {
                    setShopkeeperIntent(null);
                    setStep("ROLE_SELECTION");
                  }
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
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="premium-card">
              <CardHeader className="text-center pb-4 border-b border-border/50">
                <CardTitle className="text-2xl font-bold">
                  {authMethod === "EMAIL" ? "Email Authentication" : "Phone Authentication"}
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
                          className="pl-12 h-14 text-lg rounded-xl bg-background border-border/50"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-14 text-lg rounded-xl" disabled={isLoading}>
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
                        className="h-14 text-lg rounded-xl bg-background border-border/50"
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
                        className="h-14 text-lg rounded-xl bg-background border-border/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      {initialMode === "LOGIN" ? (
                        <>
                          <Button 
                            type="button" 
                            onClick={(e) => handleEmailAuth(e, false)}
                            className="flex-1 h-14 text-lg rounded-xl" 
                            disabled={isLoading}
                          >
                            Login
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={(e) => handleEmailAuth(e, true)}
                            className="flex-1 h-14 text-lg rounded-xl" 
                            disabled={isLoading}
                          >
                            Sign Up
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            type="button" 
                            onClick={(e) => handleEmailAuth(e, true)}
                            className="flex-1 h-14 text-lg rounded-xl" 
                            disabled={isLoading}
                          >
                            Sign Up
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={(e) => handleEmailAuth(e, false)}
                            className="flex-1 h-14 text-lg rounded-xl" 
                            disabled={isLoading}
                          >
                            Login Instead
                          </Button>
                        </>
                      )}
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
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="premium-card">
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
                        className="pl-12 h-14 text-center tracking-[0.5em] font-bold text-2xl rounded-xl bg-background border-border/50"
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
                  <Button type="submit" className="w-full h-14 text-lg rounded-xl" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
    </div>
  );
}
