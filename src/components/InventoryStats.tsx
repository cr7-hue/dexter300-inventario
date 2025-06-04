
"use client";

import type { Product } from "@/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, BarChart2, Star, FolderTree } from "lucide-react";

interface InventoryStatsProps {
  products: Product[];
}

export function InventoryStats({ products }: InventoryStatsProps) {
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const purchasedProducts = products.filter(p => p.isPurchased);
    const totalPurchasedCount = purchasedProducts.length;
    const totalSpent = purchasedProducts.reduce((sum, p) => sum + p.price, 0);
    const totalFavorites = products.filter(p => p.isFavorite).length;
    const uniqueCategoriesCount = new Set(products.map(p => p.category)).size;

    return {
      totalProducts,
      totalPurchasedCount,
      totalSpent,
      totalFavorites,
      uniqueCategoriesCount,
    };
  }, [products]);

  const statItems = [
    { title: "Productos Totales", value: stats.totalProducts, icon: <Package className="h-5 w-5 text-muted-foreground" /> },
    { title: "Productos Comprados", value: stats.totalPurchasedCount, icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" /> },
    { title: "Gasto Total (€)", value: stats.totalSpent.toFixed(2), icon: <BarChart2 className="h-5 w-5 text-muted-foreground" /> },
    { title: "Favoritos", value: stats.totalFavorites, icon: <Star className="h-5 w-5 text-muted-foreground" /> },
    { title: "Categorías Únicas", value: stats.uniqueCategoriesCount, icon: <FolderTree className="h-5 w-5 text-muted-foreground" /> },
  ];

  if (products.length === 0) {
    return (
      <div className="mb-8 p-6 bg-card rounded-lg shadow text-center">
        <p className="text-muted-foreground">No hay productos para mostrar estadísticas.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">Resumen del Inventario</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statItems.map((item, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
