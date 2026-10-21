import { useState, useEffect } from "react";
import { X, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  unit: string;
  categoryId: string;
  category?: { id: string; name: string };
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSave: (product: Omit<Product, "id" | "category"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function ProductModal({ isOpen, onClose, product, categories, onSave, onDelete, isSaving, isDeleting }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    mrp: 0,
    stock: 0,
    unit: "1 kg",
    categoryId: ""
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        mrp: product.mrp,
        stock: product.stock,
        unit: product.unit,
        categoryId: product.categoryId || (categories.length > 0 ? categories[0].id : "")
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        mrp: 0,
        stock: 0,
        unit: "1 kg",
        categoryId: categories.length > 0 ? categories[0].id : ""
      });
    }
  }, [product, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: product?.id });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface shadow-2xl rounded-[24px] border border-border/50 z-50 flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b border-border/30 flex items-center justify-between bg-muted/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-serif font-bold text-foreground">
                  {product ? "Edit Product" : "Add New Product"}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted h-10 w-10">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="product-name" className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Product Name</label>
                  <Input 
                    id="product-name"
                    required 
                    className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="product-category" className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Category</label>
                  <select 
                    id="product-category"
                    required
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="product-desc" className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Description</label>
                  <textarea 
                    id="product-desc"
                    className="flex min-h-[100px] w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-medium resize-none custom-scrollbar"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="product-price" className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Price (₹)</label>
                    <Input 
                      id="product-price"
                      type="number" 
                      required 
                      min="0"
                      className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary font-medium"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="product-mrp" className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">MRP (₹)</label>
                    <Input 
                      id="product-mrp"
                      type="number" 
                      required 
                      min="0"
                      className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary font-medium"
                      value={formData.mrp}
                      onChange={e => setFormData({...formData, mrp: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="product-stock" className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Stock Level</label>
                    <Input 
                      id="product-stock"
                      type="number" 
                      required 
                      min="0"
                      className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary font-medium"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="product-unit" className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">Unit</label>
                    <Input 
                      id="product-unit"
                      required 
                      placeholder="e.g. 1 kg, 500g, 1 piece"
                      className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary font-medium"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border/30 bg-muted/5 flex items-center justify-between gap-4">
              {product && onDelete ? (
                <Button 
                  type="button"
                  variant="destructive" 
                  onClick={() => onDelete(product.id)}
                  disabled={isDeleting || isSaving}
                  className="rounded-xl h-12 px-6 font-bold"
                  aria-label="Delete product"
                >
                  <Trash2 className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                </Button>
              ) : (
                <div></div>
              )}
              
              <div className="flex gap-3">
                <Button variant="outline" type="button" onClick={onClose} className="rounded-xl h-12 px-6 font-bold border-border/50">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="product-form"
                  disabled={isSaving || isDeleting}
                  className="rounded-xl h-12 px-8 font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSaving ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
