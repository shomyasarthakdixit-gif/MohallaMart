"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Plus, Edit2, Trash2, Search, Package, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: { name: string };
  isActive: boolean;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    categoryName: "",
    isActive: true
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["myProducts"],
    queryFn: async () => {
      const res = await api.get("/products/me");
      return res.data.products as Product[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingProduct) {
        return await api.put(`/products/${editingProduct.id}`, data);
      } else {
        return await api.post("/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      closeModal();
    },
    onError: () => {
      alert("Failed to save product.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    }
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryName: product.category.name,
        isActive: product.isActive
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", price: "", stock: "", categoryName: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your shop's catalog and inventory.</p>
        </div>
        <Button onClick={() => openModal()} className="h-12 px-6 rounded-xl font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-5 w-5" /> Add New Product
        </Button>
      </div>

      <div className="bg-card border border-border/50 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border/30 bg-muted/10 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-background border-border/50 rounded-xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/5 border-b border-border/30">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Product Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Category</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Price</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Stock</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-lg font-semibold text-muted-foreground">No products found</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Add some products to your catalog to start selling.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-muted/5 transition-colors group">
                    <td className="px-6 py-4 font-medium">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{product.category.name}</span>
                    </td>
                    <td className="px-6 py-4 font-bold">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-500' : 'text-destructive'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => openModal(product)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { if(confirm("Delete this product?")) deleteMutation.mutate(product.id) }} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border shadow-2xl rounded-3xl overflow-hidden"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b bg-muted/5">
                  <h2 className="text-xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Product Name</label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="h-11 bg-muted/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Category</label>
                    <Input value={formData.categoryName} onChange={e => setFormData({...formData, categoryName: e.target.value})} placeholder="e.g. Dairy, Snacks" required className="h-11 bg-muted/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Price (₹)</label>
                      <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="h-11 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Stock Quantity</label>
                      <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required className="h-11 bg-muted/20" />
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t bg-muted/5 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={closeModal} className="rounded-xl">Cancel</Button>
                  <Button type="submit" disabled={saveMutation.isPending} className="rounded-xl font-bold bg-primary text-primary-foreground shadow-md">
                    {saveMutation.isPending ? "Saving..." : "Save Product"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
