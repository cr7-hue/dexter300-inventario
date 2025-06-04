
"use client";

import type { Product, ProductCategory } from "@/types";
import { DEFAULT_PRODUCT_CATEGORIES, LOCALSTORAGE_PRODUCTS_KEY, LOCALSTORAGE_CATEGORIES_KEY, initialProducts } from "@/types";
import type { ProductFormValues } from "@/components/product-form";
import { ProductForm } from "@/components/product-form";
import { ProductList } from "@/components/product-list";
import { Filters, type FilterOption } from "@/components/filters";
import { AppHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { PaginationControls } from "@/components/pagination-controls";

const ITEMS_PER_PAGE = 4;
const MAX_PRICE_HISTORY_ENTRIES = 5;
const ALL_CATEGORIES_FILTER_VALUE = "Todas las categorías";
const FAVORITES_FILTER_VALUE = "__FAVORITES__";
const TOAST_DURATION = 2000; 

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [userCategories, setUserCategories] = useState<ProductCategory[]>([...DEFAULT_PRODUCT_CATEGORIES]);
  const [clientHasMounted, setClientHasMounted] = useState(false);

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<ProductFormValues | null>(null); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_FILTER_VALUE);
  const [sortBy, setSortBy] = useState<string>("default"); 
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();

  useEffect(() => {
    setClientHasMounted(true);
  }, []);

  // Load data from localStorage once client has mounted
  useEffect(() => {
    if (clientHasMounted) {
      // Load products
      try {
        const storedProductsRaw = localStorage.getItem(LOCALSTORAGE_PRODUCTS_KEY);
        if (storedProductsRaw) {
          const parsedProducts = JSON.parse(storedProductsRaw);
          if (Array.isArray(parsedProducts)) {
            setProducts(parsedProducts);
          } else {
            console.warn("Invalid product data in localStorage. Using initial products for this session.");
            // If data is invalid, state remains initialProducts. We ensure localStorage gets initialProducts if it was empty.
            localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY, JSON.stringify(initialProducts));
          }
        } else {
          // No product data, initialize localStorage with initialProducts. State is already initialProducts.
          localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY, JSON.stringify(initialProducts));
        }
      } catch (error) {
        console.error("Error loading products from localStorage. Using initial products for this session:", error);
        // If parsing fails, state remains initialProducts. Initialize localStorage if it caused the error.
         localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY, JSON.stringify(initialProducts));
      }

      // Load categories
      try {
        const storedCategoriesRaw = localStorage.getItem(LOCALSTORAGE_CATEGORIES_KEY);
        if (storedCategoriesRaw) {
          const parsedCategories = JSON.parse(storedCategoriesRaw);
          if (Array.isArray(parsedCategories) && parsedCategories.every(cat => typeof cat === 'string')) {
            setUserCategories(parsedCategories);
          } else {
            console.warn("Invalid category data in localStorage. Using default categories for this session.");
            localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_PRODUCT_CATEGORIES));
          }
        } else {
          localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_PRODUCT_CATEGORIES));
        }
      } catch (error) {
        console.error("Error loading categories from localStorage. Using default categories for this session:", error);
        localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_PRODUCT_CATEGORIES));
      }
    }
  }, [clientHasMounted]);

  // Save products to localStorage when they change
  useEffect(() => {
    if (clientHasMounted) { 
        localStorage.setItem(LOCALSTORAGE_PRODUCTS_KEY, JSON.stringify(products));
    }
  }, [products, clientHasMounted]);

  // Save categories to localStorage when they change
  useEffect(() => {
    if (clientHasMounted) {
        localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(userCategories));
    }
  }, [userCategories, clientHasMounted]);


  const handleAddProduct = (values: ProductFormValues) => {
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
    setProducts((prev) => [newProduct, ...prev]);
    setShowFormDialog(false);
    setFormInitialValues(null); 
    setEditingProduct(null);
    setSelectedCategory(ALL_CATEGORIES_FILTER_VALUE); 
    toast({ title: "Producto Agregado", description: `${values.name} ha sido agregado exitosamente.`, duration: TOAST_DURATION });
  };

  const handleEditProduct = (values: ProductFormValues, id: string) => {
    const currentDate = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) => {
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
      })
    );
    setShowFormDialog(false);
    setEditingProduct(null);
    setFormInitialValues(null);
    toast({ title: "Producto Actualizado", description: `${values.name} ha sido actualizado.`, duration: TOAST_DURATION });
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast({ title: "Producto Eliminado", description: `${productToDelete.name} ha sido eliminado.`, variant: "destructive", duration: TOAST_DURATION });
      setProductToDelete(null);
    }
  };

  const handleToggleFavorite = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  const openFormForEdit = (product: Product) => {
    setEditingProduct(product);
    setFormInitialValues(null); 
    setShowFormDialog(true);
  };
  
  const openFormForAdd = () => {
    setEditingProduct(null);
    setFormInitialValues(null);
    setShowFormDialog(true);
  };

  const openFormForDuplicate = (productToDuplicate: Product) => {
    setEditingProduct(null); 
    const initialData: ProductFormValues = {
      name: productToDuplicate.name,
      price: productToDuplicate.price,
      category: productToDuplicate.category,
      storeName: productToDuplicate.storeName || "",
      latitude: productToDuplicate.latitude ?? undefined,
      longitude: productToDuplicate.longitude ?? undefined,
      notes: productToDuplicate.notes || "",
      isPurchased: false, 
    };
    setFormInitialValues(initialData);
    setShowFormDialog(true);
  };


  const baseFilteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...products];

    if (selectedCategory === FAVORITES_FILTER_VALUE) {
      tempProducts = tempProducts.filter(product => product.isFavorite);
    } else if (selectedCategory !== ALL_CATEGORIES_FILTER_VALUE) {
      tempProducts = tempProducts.filter(product => product.category === selectedCategory);
    }

    if (searchTerm.trim() !== "") {
        tempProducts = tempProducts.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.storeName && product.storeName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    if (sortBy !== "default") {
      tempProducts.sort((a, b) => {
        let comparison = 0;
        if (sortBy === "name") {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === "price") {
          comparison = a.price - b.price;
        } else if (sortBy === "storeName") {
          comparison = (a.storeName || '').localeCompare(b.storeName || '');
        } else if (sortBy === "lastPriceCheck") {
          comparison = new Date(b.lastPriceCheck).getTime() - new Date(a.lastPriceCheck).getTime(); 
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    } else {
       tempProducts.sort((a, b) => new Date(b.lastPriceCheck).getTime() - new Date(a.lastPriceCheck).getTime());
    }
    return tempProducts;
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(baseFilteredAndSortedProducts.length / ITEMS_PER_PAGE));
  }, [baseFilteredAndSortedProducts.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages); 
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    if (!clientHasMounted) { // Avoid slicing an empty array during SSR or before client hydration
        return initialProducts.slice(0, ITEMS_PER_PAGE); // Or return empty array: []
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return baseFilteredAndSortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [baseFilteredAndSortedProducts, currentPage, clientHasMounted]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const categoryFilterOptions = useMemo((): FilterOption[] => {
    const sortedUserCategories = [...userCategories].sort();
    return [
      { value: ALL_CATEGORIES_FILTER_VALUE, label: "Todas las categorías" },
      { value: FAVORITES_FILTER_VALUE, label: "Solo Favoritos" },
      ...sortedUserCategories.map(cat => ({ value: cat, label: cat }))
    ];
  }, [userCategories]);


  return (
    <div className="min-h-screen p-4 md:p-8">
      <AppHeader />
      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryFilterOptions={categoryFilterOptions}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
      <ProductList
        products={paginatedProducts}
        onEdit={openFormForEdit}
        onDelete={(product) => setProductToDelete(product)}
        onToggleFavorite={handleToggleFavorite}
        onDuplicate={openFormForDuplicate} 
      />
      
      {clientHasMounted && baseFilteredAndSortedProducts.length > ITEMS_PER_PAGE && (
         <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
      )}

      <Button
        onClick={openFormForAdd}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full p-0 shadow-lg hover:shadow-xl transition-shadow z-50 flex items-center justify-center"
        aria-label="Agregar Producto"
      >
        <Plus className="h-8 w-8" />
      </Button>

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
            userCategories={userCategories} 
            onSubmit={(values, id) => {
              if (id) { 
                handleEditProduct(values, id);
              } else { 
                handleAddProduct(values);
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
    

    