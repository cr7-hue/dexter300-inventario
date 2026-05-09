"use client";

import type { Product } from "@/types";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, BarChart2, Star, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";

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
    {
      title: "Gasto Total",
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: BarChart2,
      featured: true,
      accent: "violet" as const,
    },
    {
      title: "Productos Totales",
      value: stats.totalProducts.toString(),
      icon: Package,
      accent: "blue" as const,
    },
    {
      title: "Comprados",
      value: stats.totalPurchasedCount.toString(),
      icon: ShoppingCart,
      accent: "emerald" as const,
    },
    {
      title: "Favoritos",
      value: stats.totalFavorites.toString(),
      icon: Star,
      accent: "gold" as const,
    },
    {
      title: "Categorías",
      value: stats.uniqueCategoriesCount.toString(),
      icon: FolderTree,
      accent: "rose" as const,
    },
  ];

  if (products.length === 0) {
    return (
      <div className="mb-8 glass rounded-2xl p-8 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No hay productos para mostrar estadísticas.</p>
      </div>
    );
  }

  const accentClasses = {
    violet: { glow: "from-primary/20 to-transparent", icon: "text-primary bg-primary/15", value: "gradient-text" },
    blue: { glow: "from-blue-500/15 to-transparent", icon: "text-blue-400 bg-blue-500/10", value: "text-foreground" },
    emerald: { glow: "from-emerald-500/15 to-transparent", icon: "text-emerald-400 bg-emerald-500/10", value: "text-foreground" },
    gold: { glow: "from-amber-500/15 to-transparent", icon: "text-[hsl(var(--gold))] bg-amber-500/10", value: "text-foreground" },
    rose: { glow: "from-rose-500/15 to-transparent", icon: "text-rose-400 bg-rose-500/10", value: "text-foreground" },
  };

  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4">
        Resumen del Inventario
      </h2>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          const acc = accentClasses[item.accent];
          return (
            <Card
              key={index}
              className={cn(
                "group relative glass glow-card rounded-2xl overflow-hidden p-4",
                "hover:-translate-y-0.5 transition-transform duration-300",
                item.featured && "col-span-2 md:col-span-1 lg:col-span-2"
              )}
            >
              <div className={cn("absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl bg-gradient-to-br pointer-events-none", acc.glow)} />
              <div className="relative flex items-start justify-between mb-3">
                <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                  {item.title}
                </p>
                <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", acc.icon)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className={cn(
                "relative font-bold tabular tracking-tight leading-none",
                item.featured ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl",
                acc.value
              )}>
                {item.value}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
