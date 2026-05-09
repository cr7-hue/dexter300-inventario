import { useState } from 'react';
import type { Product } from '@/types';
import type { ProductFormValues } from '@/components/product-form';

const MAX_PRICE_HISTORY = 5;

interface UseProductFormStateParams {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
}

const sanitizeCoord = (v: number | null | undefined): number | null =>
  v == null || isNaN(v) ? null : v;

const sanitizeStoreName = (v: string | undefined): string | undefined =>
  v?.trim() === '' ? undefined : v;

export function useProductFormState({ products, addProduct, updateProduct }: UseProductFormStateParams) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState<ProductFormValues | null>(null);

  const openFormForNew = () => {
    setEditingProduct(null);
    setFormInitialValues(null);
    setShowFormDialog(true);
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
      storeName: product.storeName ?? '',
      notes: product.notes ?? '',
      latitude: product.latitude ?? null,
      longitude: product.longitude ?? null,
      isPurchased: false,
    });
    setShowFormDialog(true);
  };

  const resetFormState = () => {
    setShowFormDialog(false);
    setEditingProduct(null);
    setFormInitialValues(null);
  };

  const handleAddProduct = (values: ProductFormValues) => {
    const currentDate = new Date().toISOString();
    addProduct({
      ...values,
      isFavorite: false,
      lastPriceCheck: currentDate,
      priceHistory: [{ price: values.price, date: currentDate }],
      isPurchased: values.isPurchased ?? false,
      purchaseDate: values.isPurchased ? currentDate : undefined,
      storeName: sanitizeStoreName(values.storeName),
      latitude: sanitizeCoord(values.latitude),
      longitude: sanitizeCoord(values.longitude),
    });
    resetFormState();
  };

  const handleEditProduct = (values: ProductFormValues, id: string) => {
    const productToUpdate = products.find(p => p.id === id);
    if (!productToUpdate) return;

    const currentDate = new Date().toISOString();
    let updatedPriceHistory = productToUpdate.priceHistory ? [...productToUpdate.priceHistory] : [];

    if (values.price !== productToUpdate.price) {
      updatedPriceHistory.unshift({ price: productToUpdate.price, date: productToUpdate.lastPriceCheck });
      if (updatedPriceHistory.length > MAX_PRICE_HISTORY) {
        updatedPriceHistory = updatedPriceHistory.slice(0, MAX_PRICE_HISTORY);
      }
    }

    const isNowPurchased = values.isPurchased ?? false;
    let newPurchaseDate = productToUpdate.purchaseDate;
    if (isNowPurchased && !productToUpdate.isPurchased) {
      newPurchaseDate = currentDate;
    } else if (!isNowPurchased) {
      newPurchaseDate = undefined;
    }

    updateProduct(id, {
      ...values,
      storeName: sanitizeStoreName(values.storeName),
      latitude: sanitizeCoord(values.latitude),
      longitude: sanitizeCoord(values.longitude),
      lastPriceCheck: currentDate,
      priceHistory: updatedPriceHistory,
      isPurchased: isNowPurchased,
      purchaseDate: newPurchaseDate,
    });
    resetFormState();
  };

  const handleFormSubmit = (values: ProductFormValues, id?: string) => {
    if (id) {
      handleEditProduct(values, id);
    } else {
      handleAddProduct(values);
    }
  };

  return {
    editingProduct,
    productToDelete,
    setProductToDelete,
    showFormDialog,
    setShowFormDialog,
    formInitialValues,
    openFormForNew,
    openFormForEdit,
    openFormForDuplicate,
    resetFormState,
    handleFormSubmit,
  };
}
