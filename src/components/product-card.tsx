"use client";

import type { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit3, Trash2, Store, CalendarDays, MapPin, History, ShoppingCart, Copy, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onDuplicate: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete, onToggleFavorite, onDuplicate }: ProductCardProps) {
  const formatDate = (dateString: string | undefined, includeTime: boolean = true) => {
    if (!dateString) return "Fecha no disponible";
    try {
      return format(new Date(dateString), includeTime ? "dd MMM yyyy, HH:mm" : "dd MMM yyyy", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const hasCoordinates = typeof product.latitude === 'number' && typeof product.longitude === 'number';
  const mapLink = hasCoordinates ? `https://www.google.com/maps?q=${product.latitude},${product.longitude}` : "#";

  const displayedPriceHistory = product.priceHistory
    ?.filter(entry => entry.price !== product.price || entry.date !== product.lastPriceCheck)
    .slice(0, 2) || [];

  const previousPrice = displayedPriceHistory[0]?.price;
  const priceTrend = previousPrice !== undefined
    ? product.price < previousPrice ? 'down' : product.price > previousPrice ? 'up' : 'same'
    : null;
  const priceDiff = previousPrice !== undefined ? product.price - previousPrice : 0;

  return (
    <Card className={cn(
      "group relative flex flex-col glass glow-card rounded-3xl overflow-hidden",
      "transition-all duration-300 ease-out",
      "hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_hsl(263_75%_15%/0.6)]",
      product.isPurchased && "ring-1 ring-primary/40"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="relative pb-2 pt-5">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase mb-1">
              {product.category}
            </p>
            <h3 className="text-base font-semibold tracking-tight leading-snug text-foreground line-clamp-2">
              {product.name}
            </h3>
            {product.storeName && (
              <p className="flex items-center text-xs text-muted-foreground mt-1.5">
                <Store className="mr-1 h-3 w-3" />
                <span className="truncate">{product.storeName}</span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors",
                product.isFavorite && "text-[hsl(var(--gold))] hover:text-[hsl(var(--gold))]"
              )}
              onClick={() => onToggleFavorite(product.id)}
              aria-label={product.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
            >
              <Star className={cn("h-4 w-4", product.isFavorite && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => onDuplicate(product)}
              aria-label="Duplicar producto"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex-grow space-y-4 pt-2 pb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground font-medium">$</span>
            <span className="text-4xl font-bold tabular tracking-tight text-foreground leading-none">
              {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
            </span>
          </div>
          {priceTrend && priceTrend !== 'same' && (
            <div className={cn(
              "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium",
              priceTrend === 'down'
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            )}>
              {priceTrend === 'down' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              <span className="tabular">
                {priceTrend === 'down' ? '−' : '+'}${Math.abs(priceDiff).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {product.isPurchased && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Comprado</span>
            {product.purchaseDate && (
              <span className="text-[10px] text-muted-foreground ml-auto">
                {formatDate(product.purchaseDate, false)}
              </span>
            )}
          </div>
        )}

        {displayedPriceHistory.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center">
              <History className="mr-1 h-3 w-3" /> Historial
            </p>
            <div className="space-y-0.5">
              {displayedPriceHistory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground tabular">
                    ${typeof entry.price === 'number' ? entry.price.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-muted-foreground/60 text-[10px]">
                    {formatDate(entry.date, false)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-1">
          <span className="flex items-center">
            <CalendarDays className="mr-1 h-3 w-3" />
            {formatDate(product.lastPriceCheck, false)}
          </span>
          {hasCoordinates && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-primary hover:underline"
              aria-label="Ver en mapa"
            >
              <MapPin className="mr-1 h-3 w-3" /> Ver mapa
            </a>
          )}
        </div>

        {product.notes && (
          <p className="text-xs text-muted-foreground italic break-words border-l-2 border-primary/30 pl-2">
            {product.notes}
          </p>
        )}
      </CardContent>

      <CardFooter className="relative gap-2 pt-2 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(product)}
          aria-label="Editar producto"
          className="flex-1 h-9 rounded-xl bg-secondary/50 hover:bg-primary/15 hover:text-primary transition-colors"
        >
          <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product)}
          aria-label="Eliminar producto"
          className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive p-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
