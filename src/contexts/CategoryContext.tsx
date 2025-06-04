"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEFAULT_PRODUCT_CATEGORIES, LOCALSTORAGE_CATEGORIES_KEY, ProductCategory } from '@/types';

interface CategoryContextType {
  categories: ProductCategory[];
  addCategory: (category: ProductCategory) => void;
  deleteCategory: (category: ProductCategory) => void;
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = () => {
      const storedCategories = localStorage.getItem(LOCALSTORAGE_CATEGORIES_KEY);
      if (storedCategories) {
        try {
          const parsedCategories = JSON.parse(storedCategories);
          if (Array.isArray(parsedCategories) && parsedCategories.every(cat => typeof cat === 'string')) {
            setCategories(parsedCategories);
          } else {
            setCategories([...DEFAULT_PRODUCT_CATEGORIES]);
            localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_PRODUCT_CATEGORIES));
          }
        } catch (error) {
          console.error("Error parsing categories:", error);
          setCategories([...DEFAULT_PRODUCT_CATEGORIES]);
          localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_PRODUCT_CATEGORIES));
        }
      } else {
        setCategories([...DEFAULT_PRODUCT_CATEGORIES]);
        localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_PRODUCT_CATEGORIES));
      }
      setLoading(false);
    };

    loadCategories();
  }, []);

  const addCategory = (category: ProductCategory) => {
    const trimmedCategory = category.trim();
    if (!trimmedCategory) return;
    
    if (categories.some(cat => cat.toLowerCase() === trimmedCategory.toLowerCase())) return;
    
    const updatedCategories = [...categories, trimmedCategory].sort();
    setCategories(updatedCategories);
    localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(updatedCategories));
  };

  const deleteCategory = (category: ProductCategory) => {
    if (DEFAULT_PRODUCT_CATEGORIES.includes(category as any) && categories.length <= DEFAULT_PRODUCT_CATEGORIES.length) {
      return;
    }
    const updatedCategories = categories.filter(cat => cat !== category);
    setCategories(updatedCategories);
    localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(updatedCategories));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, loading }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
} 