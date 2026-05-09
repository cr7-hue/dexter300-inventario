"use client";

import { ProductForm } from "@/components/product-form";
import { ProductList } from "@/components/product-list";
import { Filters, type FilterOption } from "@/components/filters";
import { AppHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoryContext";
import { AiChat } from "@/components/ai-chat";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteProductDialog } from "@/components/delete-product-dialog";
import { useProductFormState } from "@/hooks/use-product-form-state";

const ITEMS_PER_PAGE = 4;
const ALL_CATEGORIES_FILTER_VALUE = "Todas las categorías";
const FAVORITES_FILTER_VALUE = "__FAVORITES__";

export default function HomePage() {
  const { user } = useAuth();
  const { products, loading, addProduct, updateProduct, deleteProduct, toggleFavorite } = useProducts();
  const { categories } = useCategories();

  const {
    editingProduct,
    productToDelete,
    setProductToDelete,
    showFormDialog,
    formInitialValues,
    openFormForNew,
    openFormForEdit,
    openFormForDuplicate,
    resetFormState,
    handleFormSubmit,
  } = useProductFormState({ products, addProduct, updateProduct });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_FILTER_VALUE);
  const [sortBy, setSortBy] = useState<string>("default");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const categoryFilterOptions: FilterOption[] = useMemo(() => [
    { value: ALL_CATEGORIES_FILTER_VALUE, label: "Todas las categorías" },
    { value: FAVORITES_FILTER_VALUE, label: "Solo Favoritos" },
    ...categories.map(category => ({ value: category, label: category })),
  ], [categories]);

  const baseFilteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...products];

    if (selectedCategory === FAVORITES_FILTER_VALUE) {
      tempProducts = tempProducts.filter(p => p.isFavorite);
    } else if (selectedCategory !== ALL_CATEGORIES_FILTER_VALUE) {
      tempProducts = tempProducts.filter(p => p.category === selectedCategory);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.storeName && p.storeName.toLowerCase().includes(term))
      );
    }

    if (sortBy !== "default") {
      tempProducts.sort((a, b) => {
        let comparison = 0;
        if (sortBy === "name") comparison = a.name.localeCompare(b.name);
        else if (sortBy === "price") comparison = a.price - b.price;
        else if (sortBy === "storeName") comparison = (a.storeName || '').localeCompare(b.storeName || '');
        else if (sortBy === "lastPriceCheck") comparison = new Date(b.lastPriceCheck).getTime() - new Date(a.lastPriceCheck).getTime();
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

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  if (loading) return <LoadingSpinner />;

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
            onDelete={setProductToDelete}
            onToggleFavorite={toggleFavorite}
            onDuplicate={openFormForDuplicate}
          />

          {baseFilteredAndSortedProducts.length > ITEMS_PER_PAGE && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          <Button
            onClick={openFormForNew}
            className="fixed bottom-6 right-6 h-16 w-16 rounded-2xl p-0 gradient-violet glow-primary border-0 hover:scale-105 active:scale-95 transition-transform z-50"
            aria-label="Agregar Producto"
          >
            <Plus className="h-7 w-7 text-white" />
          </Button>

          <Dialog open={showFormDialog} onOpenChange={(isOpen) => { if (!isOpen) resetFormState(); }}>
            <DialogContent className="max-w-[95vw] sm:max-w-xl glass-strong rounded-3xl border-border/60 p-5 sm:p-6">
              <ProductForm
                productToEdit={editingProduct}
                initialDataForNew={formInitialValues}
                onSubmit={handleFormSubmit}
                onCancel={resetFormState}
              />
            </DialogContent>
          </Dialog>

          <AiChat products={products} />

          <DeleteProductDialog
            product={productToDelete}
            onConfirm={handleDeleteProduct}
            onCancel={() => setProductToDelete(null)}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center mt-12 sm:mt-20 px-4">
          <div className="glass glow-card rounded-3xl p-8 sm:p-12 max-w-md w-full text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl bg-primary/20 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl bg-amber-500/15 pointer-events-none" />
            <h2 className="relative text-3xl sm:text-4xl font-bold mb-3 gradient-text">
              Bienvenido
            </h2>
            <p className="relative text-muted-foreground mb-2">
              Tu inventario inteligente de precios.
            </p>
            <p className="relative text-sm text-muted-foreground/80 mb-6">
              Inicia sesión para comenzar a gestionar tus productos y comparar precios entre diferentes ferias.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
