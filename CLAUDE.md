# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:9002 (Turbopack)
npm run build        # Production build (validates TypeScript and ESLint)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run genkit:dev   # Start Genkit AI dev UI (for inspecting/testing AI flows)
```

## Environment Variables

A `.env.local` file is required with:
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` — Firebase project credentials
- `GOOGLE_GENAI_API_KEY` — Google AI key for Gemini (used by Genkit)

## Firestore rules (critical)

Products are stored per-user under `users/{uid}/products/{productId}`. The Firestore security rules must allow this; otherwise all writes fail with `Missing or insufficient permissions`. The required rules (set in Firebase Console → Firestore → Rules):

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

These rules are not versioned in the repo — they live only in Firebase Console.

## Architecture

**Stack:** Next.js 15 App Router · React 18 · TypeScript · Firebase (Auth + Firestore) · Google Genkit + Gemini 2.5 Flash · shadcn/ui (Radix UI) · Tailwind CSS · React Hook Form + Zod · Inter font

### Data flow

Three React contexts nested in `src/app/providers.tsx`:
1. `AuthContext` (`src/contexts/AuthContext.tsx`) — Firebase Google OAuth. Exposes `user`, `signInWithGoogle`, `signOut`.
2. `CategoryContext` (`src/contexts/CategoryContext.tsx`) — Manages product categories **in `localStorage`** (key: `shelfview_user_categories`). Seeded from `DEFAULT_PRODUCT_CATEGORIES` in `src/types/index.ts`. **Not persisted to Firebase.**
3. `ProductContext` (`src/contexts/ProductContext.tsx`) — Loads products from Firestore via `productService` only when `user` is non-null. Performs optimistic local updates after each Firestore write.

### Firestore service layer

Lives in `src/lib/services/firebase.ts`. **All `productService` methods take `userId` as the first argument** and operate on the `users/{userId}/products` subcollection:

```ts
productService.getProducts(userId)
productService.addProduct(userId, productData)
productService.updateProduct(userId, productId, partialData)
productService.deleteProduct(userId, productId)
```

`ProductContext` passes `user.uid` from `useAuth()` to every service call.

There is **no `categoryService`** — categories live only in localStorage via `CategoryContext`.

#### Typing pattern for `cleanedData`

`cleanUndefinedFields` returns `Record<string, unknown>` (intentionally strict — no `any`). The Firestore SDK's `addDoc` and `updateDoc` expect `WithFieldValue<T>` and `UpdateData<T>` respectively, which are stricter than `Record<string, unknown>`. The pattern in `addProduct`/`updateProduct` is:

```ts
const cleanedData = cleanUndefinedFields({ ... }) as UpdateData<DocumentData>;
await updateDoc(productRef, cleanedData);
```

Use the same cast pattern if you add new write methods. Don't fall back to `as any`.

### Shared form logic

`src/hooks/use-product-form-state.ts` (`useProductFormState`) centralizes all the dialog/form state and submit logic that's shared between `/` and `/stats`:
- State: `editingProduct`, `productToDelete`, `showFormDialog`, `formInitialValues`
- Actions: `openFormForNew`, `openFormForEdit`, `openFormForDuplicate`, `resetFormState`
- Handlers: `handleFormSubmit` (dispatches to internal `handleAddProduct` / `handleEditProduct` based on whether an id is passed)

The hook also enforces `MAX_PRICE_HISTORY = 5` (oldest entries dropped when full) and sanitizes `latitude`/`longitude`/`storeName` consistently.

When adding pages that manage products, use this hook instead of duplicating the form state.

### Shared UI components

- `src/components/loading-spinner.tsx` — used by all pages with `loading` state from `useProducts()` or `useCategories()`
- `src/components/delete-product-dialog.tsx` — confirmation `AlertDialog` for product deletion
- `src/components/product-form.tsx` — exported `ProductForm` + `ProductFormValues` Zod-derived type

### AI features

Genkit is configured in `src/ai/genkit.ts` with `googleai/gemini-2.5-flash`. Two Next.js API routes use it directly (no Genkit flows, just `ai.generate()`):
- `POST /api/ai/suggest-category` — given a product name, returns one of `DEFAULT_PRODUCT_CATEGORIES`. Falls back to "Otros" if the model returns something off-list.
- `POST /api/ai/chat` — given `{ question, products }`, returns a Spanish answer as an inventory assistant.

The floating `<AiChat>` component (`src/components/ai-chat.tsx`) calls the chat route and receives the current `products` array from the page.

### Pages

- `/` (`src/app/page.tsx`) — main inventory: filtering, sorting, pagination (4 items/page), AI chat FAB, FAB to add product. Uses `useProductFormState`.
- `/stats` (`src/app/stats/page.tsx`) — `InventoryStats` component + list of purchased products. Uses `useProductFormState`.
- `/settings/categories` (`src/app/settings/categories/page.tsx`) — manage custom categories (localStorage only).

### Key type: `Product`

Defined in `src/types/index.ts`. Worth noting:
- `priceHistory: PriceHistoryEntry[]` is prepended on each price edit by the hook
- `isPurchased` + `purchaseDate` track purchase state
- `latitude`/`longitude` are optional store coordinates

`DEFAULT_PRODUCT_CATEGORIES` and `LOCALSTORAGE_CATEGORIES_KEY` are also exported here.

## Design system

The app uses a "Premium financial" aesthetic (Revolut/N26 inspired). **Dark mode is forced** via `<html className="dark">` in `layout.tsx` — light mode tokens exist in `globals.css` but the UI is tuned for dark.

### Palette (defined in `src/app/globals.css`)
- `--background`: azul noche `230 35% 7%`
- `--primary`: violeta `263 75% 65%`
- `--gold`: dorado `38 92% 60%` (custom, not part of shadcn defaults)
- Card backgrounds use `glass` utility (translucent + backdrop-blur)
- Body has fixed radial-gradients for ambient glow

### Custom utility classes
Defined in `@layer components` of `globals.css`:
- `.glass`, `.glass-strong` — translucent backgrounds with `backdrop-blur` + saturate
- `.gradient-violet` — solid violet→magenta gradient (used by primary FAB, login button, dialog headers)
- `.gradient-violet-gold` — violet→gold gradient (used by AI buttons)
- `.gradient-text` — text with violet→gold gradient (used by logo and dialog titles)
- `.glow-primary` — multi-layer box-shadow with violet glow
- `.glow-card` — subtle shadow + inner border highlight for glass cards
- `.tabular` — `font-variant-numeric: tabular-nums` (use on prices and numerical stats)

### Typography
Font is **Inter** (Google Fonts), loaded in `src/app/layout.tsx` and exposed as `--font-inter` CSS variable. The `body` rule in `globals.css` uses `font-family: var(--font-inter), system-ui, -apple-system, sans-serif`. Do not re-introduce hardcoded `font-family: Arial` etc.

## Build notes

- `next.config.ts` **does not** suppress TypeScript or ESLint errors. A failing typecheck/lint will fail the build (locally and on Vercel).
- Always run `npm run typecheck` (or `npm run build`) before pushing to catch errors that the dev server is more permissive about.
- The codebase uses strict imports — when adding new shared logic, prefer extracting to `src/hooks/` or `src/components/` rather than inlining in pages.
