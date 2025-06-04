
"use client";

import type { Product } from "@/types";
import { ProductCard } from "./product-card";
import { ArchiveX } from "lucide-react";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onDuplicate: (product: Product) => void; // Added onDuplicate prop
}

export function ProductList({ products, onEdit, onDelete, onToggleFavorite, onDuplicate }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ArchiveX className="mx-auto h-16 w-16 mb-4" />
        <p className="text-xl">No se encontraron productos.</p>
        <p>Intenta ajustar los filtros o agrega nuevos productos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onDuplicate={onDuplicate} // Pass onDuplicate to ProductCard
        />
      ))}
    </div>
  );
}
