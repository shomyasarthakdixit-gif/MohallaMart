import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, PackageOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  stock: number;
  category: { name: string };
}

interface LowStockAlertsProps {
  products: Product[];
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  return (
    <Card className="bg-surface border-border/50 rounded-[20px] shadow-sm flex flex-col h-full">
      <CardHeader className="border-b border-border/30 bg-muted/5 pb-4">
        <CardTitle className="font-serif text-xl tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[320px] custom-scrollbar">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="p-4 bg-emerald-500/10 rounded-full mb-3">
              <PackageOpen className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="font-bold text-foreground">Stock looks good!</p>
            <p className="text-sm text-muted-foreground mt-1">All your products are well stocked.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {products.map(product => (
              <div key={product.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/5 transition-colors">
                <div>
                  <div className="font-bold text-foreground">{product.name}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{product.category.name}</div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-1 rounded-full font-bold text-sm">
                    {product.stock} left
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {products.length > 0 && (
        <div className="p-4 border-t border-border/30 bg-muted/5 mt-auto">
          <Link href="/dashboard/products">
            <Button variant="outline" className="w-full rounded-xl font-bold border-border/50 hover:bg-muted/50">Update Inventory</Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
