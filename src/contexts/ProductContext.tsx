"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import type { Product, ProductCategory } from '@/types';
import { productService } from '@/lib/services/firebase';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: Error | null;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  error: null,
  addProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
  toggleFavorite: async () => {},
});

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Cargar productos cuando el usuario está autenticado
  useEffect(() => {
    async function loadProducts() {
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedProducts = await productService.getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [user, toast]);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agregar productos",
        variant: "destructive",
      });
      return;
    }

    try {
      const newProductId = await productService.addProduct(productData);
      const newProduct = { ...productData, id: newProductId };
      setProducts(prev => [newProduct, ...prev]);
      toast({
        title: "Éxito",
        description: "Producto agregado correctamente",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!user) return;

    try {
      await productService.updateProduct(id, productData);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...productData } : p))
      );
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;

    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!user) return;

    const product = products.find(p => p.id === id);
    if (!product) return;

    try {
      const newFavoriteStatus = !product.isFavorite;
      await productService.updateProduct(id, { isFavorite: newFavoriteStatus });
      setProducts(prev =>
        prev.map(p =>
          p.id === id ? { ...p, isFavorite: newFavoriteStatus } : p
        )
      );
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de favorito",
        variant: "destructive",
      });
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleFavorite,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext); 