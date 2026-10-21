"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SalesChartProps {
  analytics: any[];
  windowStr: string;
  onWindowChange: (w: string) => void;
}

export function SalesChart({ analytics, windowStr, onWindowChange }: SalesChartProps) {
  return (
    <Card className="bg-surface border-border/50 rounded-[20px] overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30 bg-muted/5">
        <CardTitle className="font-serif text-xl tracking-tight text-foreground">Sales Trend</CardTitle>
        <div className="flex gap-1.5 sm:gap-2">
          {["7d", "21d", "30d", "6m", "1y"].map(w => (
            <button
              key={w}
              onClick={() => onWindowChange(w)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                windowStr === w 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[320px] p-4 sm:p-6">
        {analytics.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <p className="font-medium text-foreground/60">No sales data available.</p>
            <p className="text-sm">Try a different timeframe.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => {
                  const date = new Date(val);
                  return `${date.getDate()}/${date.getMonth()+1}`;
                }} 
                tick={{fontSize: 12, fontWeight: 500}} 
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                tick={{fontSize: 12, fontWeight: 500}} 
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val}`}
                dx={-10}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--surface))', 
                  borderColor: 'hsl(var(--border))', 
                  borderRadius: '12px', 
                  color: 'hsl(var(--foreground))',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                fillOpacity={0.15} 
                fill="hsl(var(--primary))" 
                strokeWidth={3} 
                activeDot={{r: 6, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2}} 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
