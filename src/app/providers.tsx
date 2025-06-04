"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { CategoryProvider } from "@/contexts/CategoryContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CategoryProvider>
        <ProductProvider>
          {children}
        </ProductProvider>
      </CategoryProvider>
    </AuthProvider>
  );
} 