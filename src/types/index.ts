export type ProductCategory = string; 

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Supermercado",
  "Alimentos",
  "Electrónica",
  "Tecnología",
  "Ropa y Accesorios",
  "Hogar y Decoración",
  "Ferretería",
  "Farmacia",
  "Libros y Papelería",
  "Juguetes",
  "Deportes",
  "Restaurantes",
  "Servicios",
  "Otros",
];

export const LOCALSTORAGE_CATEGORIES_KEY = "shelfview_user_categories";


export interface PriceHistoryEntry {
  price: number;
  date: string;
}

export interface Product {
  id: string;
  name: string; 
  price: number; 
  category: ProductCategory; 
  storeName?: string | null; 
  notes?: string | null; 
  isFavorite: boolean; 
  lastPriceCheck: string; 
  latitude?: number | null; 
  longitude?: number | null; 
  priceHistory?: PriceHistoryEntry[]; 
  isPurchased: boolean;
  purchaseDate?: string | null; 
}

export interface ProductFormValues {
  name: string;
  price: number;
  category: ProductCategory;
  storeName?: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
  isPurchased?: boolean;
}

