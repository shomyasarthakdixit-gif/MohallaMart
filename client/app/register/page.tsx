import { AuthFlow } from "@/components/auth/AuthFlow";

export const metadata = {
  title: "Register - MohallaMart",
  description: "Create your MohallaMart account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4 font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      </div>
      
      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-serif">
            Join MohallaMart
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            Create an account to shop from or sell to your neighbourhood.
          </p>
        </div>
        
        <AuthFlow initialMode="REGISTER" />
      </div>
    </div>
  );
}
