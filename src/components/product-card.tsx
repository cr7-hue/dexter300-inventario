
"use client";

import type { Product } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Edit3, Trash2, Store, CalendarDays, MapPin, History, ShoppingCart, CheckCircle2, Copy } from "lucide-react";
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
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const hasCoordinates = typeof product.latitude === 'number' && typeof product.longitude === 'number';
  const mapLink = hasCoordinates ? `https://www.google.com/maps?q=${product.latitude},${product.longitude}` : "#";

  const displayedPriceHistory = product.priceHistory
    ?.filter(entry => entry.price !== product.price || entry.date !== product.lastPriceCheck)
    .slice(0, 2) || [];


  return (
    <Card className={cn("flex flex-col shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ease-in-out rounded-xl", product.isPurchased && "border-green-500 border-2")}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg tracking-tight leading-tight mr-2">{product.name}</CardTitle>
          <div className="flex items-center space-x-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-accent-foreground"
              onClick={() => onDuplicate(product)}
              aria-label="Duplicar producto"
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 text-muted-foreground hover:text-accent-foreground", product.isFavorite && "text-yellow-400 hover:text-yellow-500")}
              onClick={() => onToggleFavorite(product.id)}
              aria-label={product.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
            >
              <Star className={cn("h-5 w-5", product.isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>
        {product.storeName && (
         <CardDescription className="flex items-center text-sm">
            <Store className="mr-1.5 h-4 w-4 text-muted-foreground" />{product.storeName}
        </CardDescription>
        )}
        <CardDescription className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">{product.category}</Badge>
          {product.isPurchased && (
            <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="mr-1 h-3 w-3" /> Comprado
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 pt-0 pb-3">
        <p className="text-2xl font-semibold text-primary">${product.price.toFixed(2)}</p>
        
        {displayedPriceHistory.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
            <p className="flex items-center font-medium">
              <History className="mr-1.5 h-3.5 w-3.5" /> Historial Precios:
            </p>
            {displayedPriceHistory.map((entry, index) => (
              <p key={index} className="pl-5">
                ${entry.price.toFixed(2)} <span className="text-xs opacity-80">({formatDate(entry.date, false)})</span>
              </p>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-1">
            <p className="flex items-center">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" /> Revisado: {formatDate(product.lastPriceCheck)}
            </p>
            {product.isPurchased && product.purchaseDate && (
               <p className="flex items-center font-medium text-green-600 dark:text-green-400">
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Comprado: {formatDate(product.purchaseDate, false)}
              </p>
            )}
            {hasCoordinates && (
              <a 
                href={mapLink}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center hover:text-primary hover:underline"
                aria-label="Ver en mapa"
              >
                <MapPin className="mr-1.5 h-3.5 w-3.5" /> Lat: {product.latitude?.toFixed(4)}, Lon: {product.longitude?.toFixed(4)}
              </a>
            )}
        </div>

        {product.notes && (
          <p className="text-sm text-muted-foreground italic break-words pt-1">
            {product.notes}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-3">
        <Button variant="outline" size="sm" onClick={() => onEdit(product)} aria-label="Editar producto">
          <Edit3 className="mr-2 h-4 w-4" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(product)} aria-label="Eliminar producto">
          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
}
