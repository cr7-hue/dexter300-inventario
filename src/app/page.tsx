"use client";

import type { Product } from "@/types";
import { DEFAULT_PRODUCT_CATEGORIES } from "@/types";
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
import { useState, useMemo } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoryContext";
import { AiChat } from "@/components/ai-chat";

const ITEMS_PER_PAGE = 4;
const ALL_CATEGORIES_FILTER_VALUE = "Todas las categorías";
const FAVORITES_FILTER_VALUE = "__FAVORITES__";

export default function HomePage() {
  const { user } = useAuth();
  const { products, loading, addProduct, updateProduct, deleteProduct, toggleFavorite } = useProducts();
  const { categories } = useCategories();
  
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<ProductFormValues | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_FILTER_VALUE);
  const [sortBy, setSortBy] = useState<string>("default");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const categoryFilterOptions: FilterOption[] = useMemo(() => [
    { value: ALL_CATEGORIES_FILTER_VALUE, label: "Todas las categorías" },
    { value: FAVORITES_FILTER_VALUE, label: "Solo Favoritos" },
    ...categories.map(category => ({
      value: category,
      label: category
    }))
  ], [categories]);

  const handleAddProduct = (values: ProductFormValues) => {
    const currentDate = new Date().toISOString();
    const newProduct: Product = {
      ...values,
      id: Date.now().toString(),
      isFavorite: false,
      lastPriceCheck: currentDate,
      priceHistory: [{ price: values.price, date: currentDate }],
      isPurchased: values.isPurchased || false,
      purchaseDate: values.isPurchased ? currentDate : undefined,
      storeName: values.storeName?.trim() === "" ? undefined : values.storeName,
      latitude: values.latitude === undefined || values.latitude === null || isNaN(values.latitude) ? null : values.latitude,
      longitude: values.longitude === undefined || values.longitude === null || isNaN(values.longitude) ? null : values.longitude,
    };
    addProduct(newProduct);
    setShowFormDialog(false);
    setFormInitialValues(null);
  };

  const handleEditProduct = (values: ProductFormValues, id: string) => {
    if (!id) return;
    
    const productToUpdate = products.find(p => p.id === id);
    if (!productToUpdate) return;

    const currentDate = new Date().toISOString();
    let updatedPriceHistory = productToUpdate.priceHistory ? [...productToUpdate.priceHistory] : [];
    
    if (values.price !== productToUpdate.price) {
      updatedPriceHistory.unshift({ price: productToUpdate.price, date: productToUpdate.lastPriceCheck });
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
      latitude: values.latitude === undefined || values.latitude === null || isNaN(values.latitude) ? null : values.latitude,
      longitude: values.longitude === undefined || values.longitude === null || isNaN(values.longitude) ? null : values.longitude,
      lastPriceCheck: currentDate,
      priceHistory: updatedPriceHistory,
      isPurchased: isNowPurchased,
      purchaseDate: newPurchaseDate,
    };

    updateProduct(id,updatedProduct);
    setShowFormDialog(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite(productId);
  };

  const openFormForEdit = (product: Product) => {
    setEditingProduct(product);
    setFormInitialValues(null);
    setShowFormDialog(true);
  };

  const openFormForDuplicate = (product: Product) => {
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

  const totalPages = Math.max(1, Math.ceil(baseFilteredAndSortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = baseFilteredAndSortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFormSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      handleEditProduct(values, editingProduct.id);
    } else {
      handleAddProduct(values);
    }
  };

  const resetFormState = () => {
    setShowFormDialog(false);
    setEditingProduct(null);
    setFormInitialValues(null);
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
      
      {user ? (
        <>
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

          {baseFilteredAndSortedProducts.length > ITEMS_PER_PAGE && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          <Button
            onClick={() => {
              setEditingProduct(null);
              setFormInitialValues(null);
              setShowFormDialog(true);
            }}
            className="fixed bottom-8 right-8 h-16 w-16 rounded-full p-0 shadow-lg hover:shadow-xl transition-shadow z-50"
            aria-label="Agregar Producto"
          >
            <Plus className="h-8 w-8" />
          </Button>

          <Dialog open={showFormDialog} onOpenChange={(isOpen) => {
            if (!isOpen) resetFormState();
            else setShowFormDialog(true);
          }}>
            <DialogContent className="max-w-[95vw] sm:max-w-xl">
              <ProductForm
                productToEdit={editingProduct}
                initialDataForNew={formInitialValues}
                onSubmit={(values, id) => {
                  if (id) {
                    handleEditProduct(values, id);
                  } else {
                    handleAddProduct(values);
                  }
                }}
                onCancel={resetFormState}
              />
            </DialogContent>
          </Dialog>

          <AiChat products={products} />

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
        </>
      ) : (
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold mb-4">¡Bienvenido a Dexter3000!</h2>
          <p className="text-muted-foreground mb-4">
            Inicia sesión para comenzar a gestionar tus productos y comparar precios entre diferentes ferias.
          </p>
        </div>
      )}
    </div>
  );
}
    

    