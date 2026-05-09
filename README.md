# dexter3000 — Inventario inteligente de precios

App web para registrar productos, recordar dónde los compraste y comparar precios entre tiendas. Pensada para uso personal en móvil, con asistente IA integrado para consultar tu inventario en lenguaje natural.

## Características

- **Inventario por usuario** — cada cuenta de Google ve solo sus propios productos
- **Historial de precios** — cada vez que editas el precio se guarda la versión anterior
- **Geolocalización** — guarda lat/lon de la tienda y abre en Google Maps
- **Categorías personalizables** — 14 por defecto, puedes añadir las tuyas
- **Asistente IA (Gemini 2.5 Flash)** — pregunta cosas como "¿cuánto gasté en total?" o "¿cuál es mi favorito sin comprar?"
- **Sugerencia de categoría con IA** — escribe el nombre del producto y Gemini sugiere la categoría
- **Estadísticas** — gasto total, productos comprados, favoritos
- **Modo oscuro premium** — paleta azul noche + violeta + dorado, glassmorphism

## Stack

- **Framework**: Next.js 15 App Router · React 18 · TypeScript
- **Auth + DB**: Firebase Authentication (Google OAuth) + Cloud Firestore
- **IA**: Google Genkit + Gemini 2.5 Flash
- **UI**: shadcn/ui (Radix UI primitives) · Tailwind CSS · Lucide icons
- **Forms**: React Hook Form + Zod
- **Tipografía**: Inter (Google Fonts)

## Setup

### 1. Variables de entorno

Crea un archivo `.env.local` en la raíz con:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GOOGLE_GENAI_API_KEY=...
```

### 2. Reglas de Firestore (importante)

En **Firebase Console → Firestore Database → Rules**, pega esto y publica:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/products/{productId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Sin estas reglas el guardado falla con `Missing or insufficient permissions`. Cada usuario tiene su propia subcolección `users/{uid}/products/`, garantizando aislamiento.

### 3. Instalar y correr

```bash
npm install
npm run dev          # http://localhost:9002 (Turbopack)
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack en puerto 9002 |
| `npm run build` | Build de producción (valida TS + ESLint) |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run genkit:dev` | UI de Genkit para inspeccionar/probar flows de IA |

## Estructura

```
src/
├── ai/                       # Configuración Genkit (Gemini 2.5 Flash)
├── app/
│   ├── api/ai/
│   │   ├── chat/             # POST: chat con asistente IA
│   │   └── suggest-category/ # POST: sugiere categoría dado nombre
│   ├── settings/categories/  # Gestión de categorías personalizadas
│   ├── stats/                # Estadísticas + productos comprados
│   ├── globals.css           # Paleta + utility classes (glass, gradients)
│   ├── layout.tsx            # Root layout, fuente Inter, dark mode forzado
│   ├── page.tsx              # Inventario principal
│   └── providers.tsx         # Auth → Category → Product context tree
├── components/
│   ├── ui/                   # Primitivos shadcn/ui
│   ├── auth/LoginButton.tsx
│   ├── ai-chat.tsx           # FAB + dialog del asistente IA
│   ├── delete-product-dialog.tsx
│   ├── filters.tsx
│   ├── header.tsx
│   ├── InventoryStats.tsx
│   ├── loading-spinner.tsx
│   ├── pagination-controls.tsx
│   ├── product-card.tsx
│   ├── product-form.tsx
│   └── product-list.tsx
├── contexts/
│   ├── AuthContext.tsx       # Firebase Google OAuth
│   ├── CategoryContext.tsx   # Categorías en localStorage
│   └── ProductContext.tsx    # Productos desde Firestore (optimistic updates)
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-product-form-state.ts  # Estado + handlers compartidos del form
│   └── use-toast.ts
├── lib/
│   ├── firebase/config.ts    # SDK init
│   ├── services/firebase.ts  # productService (per-user subcollection)
│   └── utils.ts              # cn() helper
└── types/index.ts            # Product, ProductCategory, etc.
```

## Sistema de diseño

**Paleta** (definida en `src/app/globals.css`):
- Background: azul noche `hsl(230 35% 7%)`
- Primary: violeta `hsl(263 75% 65%)`
- Acento: dorado `hsl(38 92% 60%)`
- Cards: glass con backdrop-blur

**Utility classes propias**:
- `.glass`, `.glass-strong` — fondos translúcidos con `backdrop-blur` y borde sutil
- `.gradient-violet`, `.gradient-violet-gold` — gradientes para botones/badges
- `.gradient-text` — texto con gradiente violeta→dorado (usado en logo y títulos)
- `.glow-primary`, `.glow-card` — sombras con glow violeta
- `.tabular` — `font-variant-numeric: tabular-nums` para precios

El modo oscuro está **forzado** vía `<html className="dark">` en `layout.tsx` (la paleta está optimizada para dark).

## Notas

- Las **categorías** se guardan en `localStorage` (key `shelfview_user_categories`), no en Firestore — si cambias de dispositivo o navegador, vuelven a las predeterminadas.
- Los **productos** sí se persisten en Firestore por usuario.
- `next.config.ts` ya **NO** suprime errores de TypeScript/ESLint en build. Si rompes algo, el build falla.
