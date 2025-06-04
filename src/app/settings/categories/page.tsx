
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, ArrowLeft, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_PRODUCT_CATEGORIES, LOCALSTORAGE_CATEGORIES_KEY, ProductCategory } from '@/types';
import { AppHeader } from '@/components/header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TOAST_DURATION = 2000;

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([...DEFAULT_PRODUCT_CATEGORIES]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedCategories = localStorage.getItem(LOCALSTORAGE_CATEGORIES_KEY);
    if (storedCategories) {
      try {
        const parsedCategories = JSON.parse(storedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.every(cat => typeof cat === 'string')) {
          setCategories(parsedCategories);
        } else {
          console.warn("Invalid category data in localStorage. Using default categories for this session.");
          setCategories([...DEFAULT_PRODUCT_CATEGORIES]);
          // DO NOT save default categories to localStorage if stored data was invalid
        }
      } catch (error) {
        console.error("Error parsing categories from localStorage. Using default categories for this session:", error);
        setCategories([...DEFAULT_PRODUCT_CATEGORIES]);
        // DO NOT save default categories to localStorage on parse error
      }
    } else {
      // No categories stored, use defaults and save them
      setCategories([...DEFAULT_PRODUCT_CATEGORIES]);
      localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify([...DEFAULT_PRODUCT_CATEGORIES]));
    }
  }, []);

  const saveCategories = (updatedCategories: ProductCategory[]) => {
    setCategories(updatedCategories);
    localStorage.setItem(LOCALSTORAGE_CATEGORIES_KEY, JSON.stringify(updatedCategories));
  };

  const handleAddCategory = (e: FormEvent) => {
    e.preventDefault();
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      toast({
        title: 'Categoría Vacía',
        description: 'El nombre de la categoría no puede estar vacío.',
        variant: 'destructive',
        duration: TOAST_DURATION,
      });
      return;
    }
    if (categories.some(cat => cat.toLowerCase() === trimmedCategory.toLowerCase())) {
      toast({
        title: 'Categoría Duplicada',
        description: `La categoría "${trimmedCategory}" ya existe.`,
        variant: 'destructive',
        duration: TOAST_DURATION,
      });
      return;
    }
    const updatedCategories = [...categories, trimmedCategory].sort();
    saveCategories(updatedCategories);
    setNewCategory('');
    toast({
      title: 'Categoría Agregada',
      description: `"${trimmedCategory}" ha sido agregada.`,
      duration: TOAST_DURATION,
    });
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      if (DEFAULT_PRODUCT_CATEGORIES.includes(categoryToDelete as any) && categories.length <= DEFAULT_PRODUCT_CATEGORIES.length) {
         toast({
          title: 'Acción no permitida',
          description: `La categoría predeterminada "${categoryToDelete}" no se puede eliminar si no hay categorías personalizadas adicionales.`,
          variant: 'destructive',
          duration: TOAST_DURATION * 1.5,
        });
        setCategoryToDelete(null);
        return;
      }
      const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
      saveCategories(updatedCategories);
      toast({
        title: 'Categoría Eliminada',
        description: `"${categoryToDelete}" ha sido eliminada.`,
        variant: 'destructive',
        duration: TOAST_DURATION,
      });
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <AppHeader />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <ListChecks className="mr-3 h-8 w-8 text-primary" /> Gestionar Categorías
        </h1>
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Inicio
          </Button>
        </Link>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Agregar Nueva Categoría</CardTitle>
          <CardDescription>
            Añade nuevas categorías para organizar mejor tus productos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex items-center space-x-2">
            <Input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nombre de la nueva categoría"
              className="flex-grow"
            />
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Categorías Existentes ({categories.length})</CardTitle>
          <CardDescription>
            Visualiza y elimina categorías de tu lista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay categorías definidas.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li
                  key={category}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                >
                  <span className="text-foreground">{category}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => setCategoryToDelete(category)}
                    aria-label={`Eliminar categoría ${category}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la categoría "{categoryToDelete}". 
              Esta acción no se puede deshacer. Los productos que usen esta categoría no se verán afectados directamente, pero la categoría ya no estará disponible para nuevas asignaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
