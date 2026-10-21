"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductList } from "@/components/shopkeeper/products/ProductList";
import { ProductModal } from "@/components/shopkeeper/products/ProductModal";
import { motion } from "framer-motion";

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
  imageUrl?: string;
  category: Category;
  categoryId: string;
}

export default function ShopkeeperProductsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["myProducts"],
    queryFn: async () => {
      const res = await api.get("/products/me");
      return res.data.products as Product[];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.categories as Category[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Omit<Product, "id" | "category"> & { id?: string }) => {
      if (data.id) {
        return await api.put(`/products/${data.id}`, data);
      } else {
        return await api.post("/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  });

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = (productData: Omit<Product, "id" | "category"> & { id?: string }) => {
    saveMutation.mutate(productData);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-20 md:pb-0"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Products & Inventory</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your catalog, pricing, and stock levels.</p>
      </div>

      <ProductList 
        products={products} 
        isLoading={isLoadingProducts} 
        onEdit={handleEdit} 
        onAddNew={handleAddNew} 
      />

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={saveMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </motion.div>
  );
}
