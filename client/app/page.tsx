"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Store, MapPin, Search, Package, CheckCircle2, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { LogoutButton } from "@/components/logout-button";

const heroImages = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200", // Grocery
  "https://images.unsplash.com/photo-1571146203923-a550998f48b9?auto=format&fit=crop&q=80&w=1200", // Vegetables
  "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=1200", // Market
];

export default function LandingPage() {
  const { user } = useAuthStore();
  const [currentImage, setCurrentImage] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Crossfade every 6s
    
    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">MohallaMart</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            <Link href="#categories" className="hover:text-primary transition-colors">Categories</Link>
            <Link href="#shopkeepers" className="hover:text-primary transition-colors">For Shopkeepers</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <LogoutButton className="rounded-full font-medium" showText={true} />
                <Link href={user.role === "SHOPKEEPER" ? "/dashboard" : "/home"}>
                  <Button variant="outline" className="rounded-full">Go to App</Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full font-medium">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full bg-primary text-primary-foreground font-medium">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface p-4 flex flex-col gap-4">
            <Link href="#how-it-works" className="font-medium text-foreground p-2" onClick={() => setIsMenuOpen(false)}>How It Works</Link>
            <Link href="#categories" className="font-medium text-foreground p-2" onClick={() => setIsMenuOpen(false)}>Categories</Link>
            <Link href="#shopkeepers" className="font-medium text-foreground p-2" onClick={() => setIsMenuOpen(false)}>For Shopkeepers</Link>
            <hr className="border-border" />
            {user ? (
              <div className="flex flex-col gap-2">
                <Link href={user.role === "SHOPKEEPER" ? "/dashboard" : "/home"} onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Go to App</Button>
                </Link>
                <LogoutButton className="w-full" showText={true} />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-12 pb-24 md:pt-24 md:pb-32">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 z-10">
              <span className="text-sm font-bold tracking-widest text-primary uppercase">Local Shops. Real People. Better Choices.</span>
              <h1 className="text-5xl md:text-7xl font-serif leading-tight text-foreground">
                Your Neighbourhood, <br className="hidden md:block"/>One Tap Away.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Fresh groceries, daily essentials and more from trusted local shops near you. Support your community with every order.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/register">
                  <Button size="lg" className="rounded-full w-full sm:w-auto h-14 px-8 text-lg bg-primary hover:bg-deep-green text-primary-foreground shadow-md">
                    Explore Nearby Shops <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-border">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-medium">Local Shops</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-medium">Fresh Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-medium">Fast Delivery</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-xl border border-border">
              {heroImages.map((src, index) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImage ? "opacity-100" : "opacity-0"}`}
                >
                  <img 
                    src={src} 
                    alt="Local market" 
                    className={`w-full h-full object-cover ${!prefersReducedMotion ? "animate-[kenburns_20s_ease-out_infinite_alternate]" : ""}`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              ))}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Store className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Sharma General Store</p>
                      <p className="text-xs text-white/80">Delivering in 15 mins</p>
                    </div>
                  </div>
                  <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why MohallaMart */}
        <section className="py-24 bg-surface border-y border-border">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-foreground">More than shopping. It's your neighbourhood.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We connect you directly with the local shops you already know and trust. By shopping on MohallaMart, you get fresh, everyday products delivered quickly while supporting the local economy.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-foreground">How It Works</h2>
              <p className="text-muted-foreground mt-4">Simple, fast, and completely local.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Set Location", desc: "Tell us where you are to see shops nearby.", icon: MapPin },
                { step: "02", title: "Explore Shops", desc: "Browse trusted local stores in your area.", icon: Search },
                { step: "03", title: "Add Essentials", desc: "Pick fresh groceries and daily needs.", icon: ShoppingBag },
                { step: "04", title: "Get Delivered", desc: "Fast delivery right to your doorstep.", icon: Package },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground mb-2">{item.step}</span>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shopkeeper Section */}
        <section id="shopkeepers" className="py-24 bg-deep-green text-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Your shop. Your neighbourhood. <br className="hidden md:block"/>More digital reach.</h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-lg">
                Join MohallaMart to bring your local store online. Manage inventory, receive orders seamlessly, and serve your neighbourhood better than ever before.
              </p>
              <ul className="space-y-4 mb-8">
                {['Easy product management', 'Real-time order tracking', 'Local customer discovery', 'Zero setup cost'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?mode=shopkeeper">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
                  Start Selling Today
                </Button>
              </Link>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
                alt="Shopkeeper app" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-deep-green/80 to-transparent"></div>
              {/* Mock UI Overlay */}
              <div className="absolute bottom-8 left-8 right-8 bg-surface/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Today's Orders</span>
                  <span className="text-2xl font-serif">24</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-accent w-3/4 h-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-surface text-center border-y border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-serif mb-6 text-foreground">Ready to start shopping locally?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of customers who trust MohallaMart for their daily needs.
            </p>
            <Link href="/register">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-deep-green text-primary-foreground shadow-md">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-bold text-foreground">MohallaMart</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary">About Us</Link>
              <Link href="#" className="hover:text-primary">Help & Support</Link>
              <Link href="#" className="hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary">Terms & Conditions</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MohallaMart. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
      
      {/* CSS for Ken Burns Effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, -1%); }
        }
      `}} />
    </div>
  );
}
