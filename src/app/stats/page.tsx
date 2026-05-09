"use client";

import { useMemo } from "react";
import Link from 'next/link';
import { AppHeader } from "@/components/header";
import { InventoryStats } from "@/components/InventoryStats";
import { ProductList } from "@/components/product-list";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteProductDialog } from "@/components/delete-product-dialog";
import { useProductFormState } from "@/hooks/use-product-form-state";
import { useProducts } from "@/contexts/ProductContext";

export default function StatsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct, toggleFavorite } = useProducts();

  const {
    editingProduct,
    productToDelete,
    setProductToDelete,
    showFormDialog,
    formInitialValues,
    openFormForEdit,
    openFormForDuplicate,
    resetFormState,
    handleFormSubmit,
  } = useProductFormState({ products, addProduct, updateProduct });

  const purchasedProducts = useMemo(() =>
    products
      .filter(p => p.isPurchased)
      .sort((a, b) => new Date(b.purchaseDate || 0).getTime() - new Date(a.purchaseDate || 0).getTime()),
    [products]
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
        onDelete={setProductToDelete}
        onToggleFavorite={toggleFavorite}
        onDuplicate={openFormForDuplicate}
      />
      {purchasedProducts.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          Aún no has marcado ningún producto como comprado.
        </p>
      )}

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

      <DeleteProductDialog
        product={productToDelete}
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
