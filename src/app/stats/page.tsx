"use client";

import type { Product } from "@/types";
import type { ProductFormValues } from "@/components/product-form";
import { useState, useMemo } from "react";
import Link from 'next/link';
import { AppHeader } from "@/components/header";
import { InventoryStats } from "@/components/InventoryStats";
import { ProductList } from "@/components/product-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/product-form";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/contexts/ProductContext";
import { useCategories } from "@/contexts/CategoryContext";

const MAX_PRICE_HISTORY_ENTRIES = 5;
const TOAST_DURATION = 2000;

export default function StatsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct, toggleFavorite } = useProducts();
  const { categories } = useCategories();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState<ProductFormValues | null>(null);
  const { toast } = useToast();

  const purchasedProducts = useMemo(() => {
    return products.filter(p => p.isPurchased).sort((a,b) => new Date(b.purchaseDate || 0).getTime() - new Date(a.purchaseDate || 0).getTime());
  }, [products]);

  const handleAddProductFromStats = (values: ProductFormValues) => {
    const currentDate = new Date().toISOString();
    const newProduct: Product = {
      ...values,
      storeName: values.storeName?.trim() === "" ? undefined : values.storeName,
      latitude: values.latitude === undefined || isNaN(values.latitude) ? undefined : values.latitude,
      longitude: values.longitude === undefined || isNaN(values.longitude) ? undefined : values.longitude,
      id: Date.now().toString(),
      isFavorite: false,
      lastPriceCheck: currentDate,
      priceHistory: [{ price: values.price, date: currentDate }],
      isPurchased: values.isPurchased || false,
      purchaseDate: values.isPurchased ? currentDate : undefined,
    };
    addProduct(newProduct);
    setShowFormDialog(false);
    setFormInitialValues(null);
    toast({ 
      title: "Producto Duplicado y Agregado", 
      description: `${values.name} ha sido agregado desde estadísticas.`, 
      duration: TOAST_DURATION 
    });
  };

  const handleEditProduct = (values: ProductFormValues, id: string) => {
    if (!id) return;
    
    const productToUpdate = products.find(p => p.id === id);
    if (!productToUpdate) return;

    const currentDate = new Date().toISOString();
    let updatedPriceHistory = productToUpdate.priceHistory ? [...productToUpdate.priceHistory] : [];
    
    if (values.price !== productToUpdate.price) {
      if (updatedPriceHistory.length === 0 || 
          (updatedPriceHistory[0].price !== productToUpdate.price || 
           updatedPriceHistory[0].date !== productToUpdate.lastPriceCheck)) {
        updatedPriceHistory.unshift({ price: productToUpdate.price, date: productToUpdate.lastPriceCheck });
      }
      if (updatedPriceHistory.length > MAX_PRICE_HISTORY_ENTRIES) {
        updatedPriceHistory = updatedPriceHistory.slice(0, MAX_PRICE_HISTORY_ENTRIES);
      }
    } else if (updatedPriceHistory.length === 0) {
      updatedPriceHistory.unshift({ price: values.price, date: currentDate });
    }

    const wasPurchased = productToUpdate.isPurchased;
    const isNowPurchased = values.isPurchased || false;
    let newPurchaseDate = productToUpdate.purchaseDate;

    if (isNowPurchased && !wasPurchased) {
      newPurchaseDate = currentDate;
    } else if (isNowPurchased && wasPurchased) {
      newPurchaseDate = productToUpdate.purchaseDate || currentDate;
    } else if (!isNowPurchased) {
      newPurchaseDate = undefined;
    }

    const updatedProduct: Product = {
      ...productToUpdate,
      ...values,
      storeName: values.storeName?.trim() === "" ? undefined : values.storeName,
      latitude: values.latitude === undefined || isNaN(values.latitude) ? undefined : values.latitude,
      longitude: values.longitude === undefined || isNaN(values.longitude) ? undefined : values.longitude,
      lastPriceCheck: currentDate,
      priceHistory: updatedPriceHistory,
      isPurchased: isNowPurchased,
      purchaseDate: newPurchaseDate,
    };

    updateProduct(updatedProduct);
    setShowFormDialog(false);
    setEditingProduct(null);
    toast({ 
      title: "Producto Actualizado", 
      description: `${values.name} ha sido actualizado.`, 
      duration: TOAST_DURATION 
    });
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
      toast({
        title: "Producto Eliminado",
        description: `${productToDelete.name} ha sido eliminado.`,
        variant: "destructive",
        duration: TOAST_DURATION,
      });
    }
  };

  const openFormForEdit = (product: Product) => {
    setEditingProduct(product);
    setFormInitialValues(null);
    setShowFormDialog(true);
  };

  const openFormForDuplicateFromStats = (product: Product) => {
    setEditingProduct(null);
    setFormInitialValues({
      name: `${product.name} (Copia)`,
      price: product.price,
      category: product.category,
      storeName: product.storeName || "",
      notes: product.notes || "",
      latitude: product.latitude || null,
      longitude: product.longitude || null,
      isPurchased: false,
    });
    setShowFormDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <AppHeader />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Estadísticas y Productos Comprados
        </h1>
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Inicio
          </Button>
        </Link>
      </div>
      
      <InventoryStats products={products} />

      <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-6 text-foreground">
        Mis Productos Comprados ({purchasedProducts.length})
      </h2>
      <ProductList
        products={purchasedProducts}
        onEdit={openFormForEdit}
        onDelete={(product) => setProductToDelete(product)}
        onToggleFavorite={toggleFavorite}
        onDuplicate={openFormForDuplicateFromStats}
      />
      {purchasedProducts.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          Aún no has marcado ningún producto como comprado.
        </p>
      )}

      <Dialog open={showFormDialog} onOpenChange={(isOpen) => {
        setShowFormDialog(isOpen);
        if (!isOpen) {
          setEditingProduct(null);
          setFormInitialValues(null);
        }
      }}>
        <DialogContent className="sm:max-w-xl">
          <ProductForm
            productToEdit={editingProduct}
            initialDataForNew={formInitialValues}
            onSubmit={(values, id) => {
              if (id) {
                handleEditProduct(values, id);
              } else {
                handleAddProductFromStats(values);
              }
            }}
            onCancel={() => {
              setShowFormDialog(false);
              setEditingProduct(null);
              setFormInitialValues(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{productToDelete?.name}"
              {productToDelete?.storeName ? ` de la tienda "${productToDelete.storeName}"` : ''}
              será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
