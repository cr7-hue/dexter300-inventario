import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import type { Product, ProductCategory } from '@/types';

// Interfaces para los servicios
interface FirestoreProduct extends Omit<Product, 'id'> {
  createdAt: any;
  updatedAt: any;
}

// Función para validar y transformar los datos del producto
const validateAndTransformProduct = (id: string, data: any): Product => {
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
    priceHistory: Array.isArray(data.priceHistory) ? data.priceHistory.map((entry: any) => ({
      price: typeof entry.price === 'number' ? entry.price : 0,
      date: entry.date || new Date().toISOString()
    })) : []
  };
};

// Función para limpiar campos undefined
const cleanUndefinedFields = (data: any) => {
  const cleanedData = { ...data };
  Object.keys(cleanedData).forEach(key => {
    if (cleanedData[key] === undefined) {
      delete cleanedData[key];
    }
  });
  return cleanedData;
};

// Servicios para productos
export const productService = {
  // Obtener todos los productos
  async getProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      
      return snapshot.docs.map(doc => validateAndTransformProduct(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Añadir un nuevo producto
  async addProduct(productData: Omit<Product, 'id'>): Promise<string> {
    try {
      const productsRef = collection(db, 'products');
      const cleanedData = cleanUndefinedFields({
        ...productData,
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

  // Actualizar un producto
  async updateProduct(productId: string, productData: Partial<Product>): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      const cleanedData = cleanUndefinedFields({
        ...productData,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(productRef, cleanedData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Eliminar un producto
  async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Servicios para categorías
export const categoryService = {
  // Obtener todas las categorías
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      return snapshot.docs.map(doc => doc.data().name as ProductCategory);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Añadir una nueva categoría
  async addCategory(categoryName: ProductCategory): Promise<void> {
    try {
      const categoriesRef = collection(db, 'categories');
      await addDoc(categoriesRef, {
        name: categoryName,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Eliminar una categoría
  async deleteCategory(categoryName: ProductCategory): Promise<void> {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(
        categoriesRef, 
        where('name', '==', categoryName)
      );
      const snapshot = await getDocs(q);
      
      // Eliminar todos los documentos que coincidan
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}; 