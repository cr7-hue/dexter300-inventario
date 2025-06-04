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

export const LOCALSTORAGE_PRODUCTS_KEY = "shelfview_products";
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

// Added initialProducts directly here for easier management with page.tsx
export const initialProducts: Product[] = [
  { id: '1', name: 'Leche Entera 1L', price: 0.99, category: 'Supermercado', storeName: 'Mercadona Plaza Mayor', isFavorite: false, notes: 'Oferta semanal', lastPriceCheck: new Date(Date.now() - 86400000 * 2).toISOString(), latitude: 40.416775, longitude: -3.703790, priceHistory: [{ price: 0.99, date: new Date(Date.now() - 86400000 * 2).toISOString() }], isPurchased: true, purchaseDate: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '2', name: 'Auriculares Bluetooth XYZ', price: 49.95, category: 'Electrónica', storeName: 'TechWorld', isFavorite: true, notes: 'Buena calidad de sonido, cancelación de ruido', lastPriceCheck: new Date().toISOString(), latitude: 40.420000, longitude: -3.700000, priceHistory: [{ price: 49.95, date: new Date().toISOString() }], isPurchased: false },
  { id: '3', name: 'Vaqueros Slim Fit', price: 35.00, category: 'Ropa y Accesorios', storeName: 'ModaTotal', isFavorite: false, notes: 'Talla M, color azul oscuro', lastPriceCheck: new Date(Date.now() - 86400000 * 5).toISOString(), latitude: 40.418000, longitude: -3.705000, priceHistory: [{ price: 35.00, date: new Date(Date.now() - 86400000 * 5).toISOString() }], isPurchased: true, purchaseDate: new Date(Date.now() - 86400000 * 5).toISOString()},
  { id: '4', name: 'Taladro Percutor 500W', price: 59.99, category: 'Ferretería', isFavorite: true, notes: 'Incluye juego de brocas', lastPriceCheck: new Date(Date.now() - 86400000 * 1).toISOString(), latitude: 40.410000, longitude: -3.710000, priceHistory: [{ price: 59.99, date: new Date(Date.now() - 86400000 * 1).toISOString() }], isPurchased: false },
  { id: '5', name: 'Café Molido Natural (250g)', price: 2.75, category: 'Supermercado', storeName: 'Super Ahorro', isFavorite: false, notes: 'Origen Colombia', lastPriceCheck: new Date(Date.now() - 86400000 * 3).toISOString(), latitude: 40.412000, longitude: -3.708000, priceHistory: [{ price: 2.75, date: new Date(Date.now() - 86400000 * 3).toISOString() }], isPurchased: true, purchaseDate: new Date(Date.now() - 86400000 * 4).toISOString() },
];
