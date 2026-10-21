import { useState } from "react";
import { Package, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  category: { id: string; name: string };
  categoryId: string;
}

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onAddNew: () => void;
}

export function ProductList({ products, isLoading, onEdit, onAddNew }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search products by name or category..." 
            className="pl-10 h-12 bg-surface border-border/50 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={onAddNew} className="h-12 px-6 rounded-xl font-bold shadow-md w-full sm:w-auto shrink-0">
          <Plus className="mr-2 h-5 w-5" /> Add New Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-surface border border-border/30 rounded-[20px] animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[24px] border border-border/50 border-dashed">
          <div className="p-4 bg-muted/30 rounded-full inline-block mb-4">
            <Package className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-serif font-bold text-foreground">No products found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            {searchQuery ? "Try adjusting your search terms." : "You haven't added any products yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => onEdit(product)}
              className="group bg-surface border border-border/50 rounded-[20px] p-5 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="bg-muted/10 text-muted-foreground font-semibold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border border-border/30">
                  {product.category.name}
                </div>
                {product.stock <= 5 ? (
                  <div className="bg-amber-500/10 text-amber-600 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border border-amber-500/20">
                    Low Stock: {product.stock}
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 text-emerald-600 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border border-emerald-500/20">
                    In Stock: {product.stock}
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                {product.unit}
              </p>
              
              <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-xl text-foreground">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-muted-foreground line-through ml-2 font-medium">₹{product.mrp}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
