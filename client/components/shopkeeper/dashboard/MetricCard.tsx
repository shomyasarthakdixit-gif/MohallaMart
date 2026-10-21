import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "warning";
}

export function MetricCard({ title, value, subtitle, icon: Icon, variant = "default" }: MetricCardProps) {
  const isPrimary = variant === "primary";
  const isWarning = variant === "warning";

  return (
    <Card className={`overflow-hidden border-border/50 rounded-[20px] shadow-sm transition-all duration-300 ${isPrimary ? 'bg-primary/5 border-primary/20' : 'bg-surface hover:shadow-md'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={`p-2 rounded-xl ${isPrimary ? 'bg-primary/10 text-primary' : isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-serif font-bold ${isPrimary ? 'text-primary' : isWarning ? 'text-amber-500' : 'text-foreground'}`}>
          {value}
        </div>
        <p className="text-sm text-muted-foreground mt-1 font-medium">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
