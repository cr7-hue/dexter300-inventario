
"use client";

import type { Product } from "@/types";
import type { ProductFormValues } from "@/components/product-form"; // Added
import { useState, useEffect, useMemo, useRef } from "react"; // Added useRef
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
import { DEFAULT_PRODUCT_CATEGORIES, LOCALSTORAGE_PRODUCTS_KEY, LOCALSTORAGE_CATEGORIES_KEY } from "@/types"; // Added for categories

const MAX_PRICE_HISTORY_ENTRIES = 5;
const TOAST_DURATION = 2000;

export default function StatsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [userCategories, setUserCategories] = useState<string[]>([]); // Added for ProductForm
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState<ProductFormValues | null>(null); // For duplication
  const { toast } = useToast();
  const isMounted = useRef(false); // To prevent localStorage writes on initial SSR/hydrate

  useEffect(() => {
    // Load products
    const storedProductsRaw = localStorage.getItem(LOCALSTORAGE_PRODUCTS_KEY);
    if (storedProductsRaw) {
      try {
        const parsedProducts = JSON.parse(storedProductsRaw);
        if (Array.isArray(parsedProducts)) {
          setAllProducts(parsedProducts);
        } else {
          console.error("Failed to load products from localStorage on stats page: data is not an array.");
          setAllProducts([]); 
        }
      } catch (error) {
        console.error("Error parsing products from localStorage on stats page:", error);
        setAllProducts([]); 
      }
    } else {
      setAllProducts([]); 
    }

    // Load categories (needed for ProductForm if opened from here)
    const storedCategoriesRaw = localStorage.getItem(LOCALSTORAGE_CATEGORIES_KEY);
    if (storedCategoriesRaw) {
        try {
            const parsed = JSON.parse(storedCategoriesRaw);
            if (Array.isArray(parsed) && parsed.every(c => typeof c === 'string')) {
                setUserCategories(parsed);
            } else {
                setUserCategories([...DEFAULT_PRODUCT_CATEGORIES]);
            }
        } catch {
            setUserCategories([...DEFAULT_PRODUCT_CATEGORIES]);
        }
    } else {
        setUserCategories([...DEFAULT_PRODUCT_CATEGORIES]);
    }
    isMounted.current = true;
  }, []);

  const purchasedProducts = useMemo(() => {
    return allProducts.filter(p => p.isPurchased).sort((a,b) => new Date(b.purchaseDate || 0).getTime() - new Date(a.purchaseDate || 0).getTime());
  }, [allProducts]);
  
  // Function to save allProducts to localStorage
  const saveProductsToLocalStorage = (productsToSave: Product[]) => {
    if (isMounted.current) { // Only save if component is mounted and client-side
        localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY, JSON.stringify(productsToSave));
    }
  };


  const handleAddProductFromStats = (values: ProductFormValues) => {
    // This function would be similar to handleAddProduct in page.tsx
    // It's called when a duplicated product is saved via the form from this page.
    const currentDate = new Date().toISOString();
    const newProduct: Product = {
      ...values,
      storeName: values.storeName?.trim() === "" ? undefined : values.storeName,
      latitude: values.latitude === undefined || isNaN(values.latitude) ? undefined : values.latitude,
      longitude: values.longitude === undefined || isNaN(values.longitude) ? undefined : values.longitude,
      id: Date.now().toString(),
      isFavorite: false, // Duplicates usually start non-favorite
      lastPriceCheck: currentDate,
      priceHistory: [{ price: values.price, date: currentDate }],
      isPurchased: values.isPurchased || false, // Can be set in form
      purchaseDate: values.isPurchased ? currentDate : undefined,
    };
    const updatedProductsList = [newProduct, ...allProducts];
    setAllProducts(updatedProductsList);
    saveProductsToLocalStorage(updatedProductsList);
    setShowFormDialog(false);
    setFormInitialValues(null);
    toast({ title: "Producto Duplicado y Agregado", description: `${values.name} ha sido agregado desde estadísticas.`, duration: TOAST_DURATION });
  };


  const handleEditProduct = (values: ProductFormValues, id: string) => {
    const currentDate = new Date().toISOString();
    const updatedProductsList = allProducts.map((p) => {
      if (p.id === id) {
        let updatedPriceHistory = p.priceHistory ? [...p.priceHistory] : [];
        if (values.price !== p.price) {
          if (updatedPriceHistory.length === 0 || (updatedPriceHistory[0].price !== p.price || updatedPriceHistory[0].date !== p.lastPriceCheck)) {
            updatedPriceHistory.unshift({ price: p.price, date: p.lastPriceCheck });
          }
          if (updatedPriceHistory.length > MAX_PRICE_HISTORY_ENTRIES) {
            updatedPriceHistory = updatedPriceHistory.slice(0, MAX_PRICE_HISTORY_ENTRIES);
          }
        } else if (updatedPriceHistory.length === 0) {
           updatedPriceHistory.unshift({ price: values.price, date: currentDate });
        }
        
        const wasPurchased = p.isPurchased;
        const isNowPurchased = values.isPurchased || false;
        let newPurchaseDate = p.purchaseDate;

        if (isNowPurchased && !wasPurchased) {
          newPurchaseDate = currentDate;
        } else if (isNowPurchased && wasPurchased) {
           newPurchaseDate = p.purchaseDate || currentDate;
        } else if (!isNowPurchased) {
          newPurchaseDate = undefined;
        }

        return { 
          ...p, 
          ...values,
          storeName: values.storeName?.trim() === "" ? undefined : values.storeName,
          latitude: values.latitude === undefined || isNaN(values.latitude) ? undefined : values.latitude,
          longitude: values.longitude === undefined || isNaN(values.longitude) ? undefined : values.longitude,
          lastPriceCheck: currentDate,
          priceHistory: updatedPriceHistory,
          isPurchased: isNowPurchased,
          purchaseDate: newPurchaseDate,
        };
      }
      return p;
    });

    setAllProducts(updatedProductsList);
    saveProductsToLocalStorage(updatedProductsList);
    setShowFormDialog(false);
    setEditingProduct(null);
    setFormInitialValues(null);
    toast({ title: "Producto Actualizado", description: `${values.name} ha sido actualizado.`, duration: TOAST_DURATION });
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      const updatedProductsList = allProducts.filter((p) => p.id !== productToDelete.id);
      setAllProducts(updatedProductsList);
      saveProductsToLocalStorage(updatedProductsList);
      toast({ title: "Producto Eliminado", description: `${productToDelete.name} ha sido eliminado.`, variant: "destructive", duration: TOAST_DURATION });
      setProductToDelete(null);
    }
  };

  const handleToggleFavorite = (productId: string) => {
    const updatedProductsList = allProducts.map((p) =>
      p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    setAllProducts(updatedProductsList);
    saveProductsToLocalStorage(updatedProductsList);
  };

  const openFormForEdit = (product: Product) => {
    setEditingProduct(product);
    setFormInitialValues(null);
    setShowFormDialog(true);
  };

  const openFormForDuplicateFromStats = (productToDuplicate: Product) => {
    setEditingProduct(null);
    const initialData: ProductFormValues = {
      name: productToDuplicate.name,
      price: productToDuplicate.price,
      category: productToDuplicate.category,
      storeName: productToDuplicate.storeName || "",
      latitude: productToDuplicate.latitude ?? undefined,
      longitude: productToDuplicate.longitude ?? undefined,
      notes: productToDuplicate.notes || "",
      isPurchased: false, // Default for duplicate
    };
    setFormInitialValues(initialData);
    setShowFormDialog(true);
  };


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
      
      <InventoryStats products={allProducts} />

      <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-6 text-foreground">
        Mis Productos Comprados ({purchasedProducts.length})
      </h2>
      <ProductList
        products={purchasedProducts}
        onEdit={openFormForEdit}
        onDelete={(product) => setProductToDelete(product)}
        onToggleFavorite={handleToggleFavorite}
        onDuplicate={openFormForDuplicateFromStats} // Added duplicate handler
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
            userCategories={userCategories} // Pass categories
            onSubmit={(values, id) => {
              if (id) { // Editing existing product
                handleEditProduct(values, id);
              } else { // Adding new (could be from duplication)
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
