import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import type { Product } from '@/types';

const validateAndTransformProduct = (id: string, data: DocumentData): Product => {
  return {
    id,
    name: data.name || '',
    price: typeof data.price === 'number' ? data.price : 0,
    category: data.category || '',
    storeName: data.storeName || null,
    notes: data.notes || null,
    isFavorite: Boolean(data.isFavorite),
    isPurchased: Boolean(data.isPurchased),
    lastPriceCheck: data.lastPriceCheck || new Date().toISOString(),
    purchaseDate: data.isPurchased ? (data.purchaseDate || data.lastPriceCheck) : null,
    latitude: typeof data.latitude === 'number' ? data.latitude : null,
    longitude: typeof data.longitude === 'number' ? data.longitude : null,
    priceHistory: Array.isArray(data.priceHistory)
      ? data.priceHistory.map((entry: DocumentData) => ({
          price: typeof entry.price === 'number' ? entry.price : 0,
          date: entry.date || new Date().toISOString(),
        }))
      : [],
  };
};

const cleanUndefinedFields = (data: Record<string, unknown>): Record<string, unknown> => {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
};

// Servicios para productos — cada usuario tiene su propia subcollección
export const productService = {
  async getProducts(userId: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'users', userId, 'products');
      const snapshot = await getDocs(productsRef);
      return snapshot.docs.map(doc => validateAndTransformProduct(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  async addProduct(userId: string, productData: Omit<Product, 'id'>): Promise<string> {
    try {
      const productsRef = collection(db, 'users', userId, 'products');
      const cleanedData = cleanUndefinedFields({
        ...(productData as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const docRef = await addDoc(productsRef, cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  async updateProduct(userId: string, productId: string, productData: Partial<Product>): Promise<void> {
    try {
      const productRef = doc(db, 'users', userId, 'products', productId);
      const cleanedData = cleanUndefinedFields({
        ...(productData as Record<string, unknown>),
        updatedAt: serverTimestamp(),
      });
      await updateDoc(productRef, cleanedData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(userId: string, productId: string): Promise<void> {
    try {
      const productRef = doc(db, 'users', userId, 'products', productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};
