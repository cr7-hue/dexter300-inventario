
"use client";

import { Package, Moon, Sun, Menu as MenuIcon, Home, BarChart3, Settings, LayoutList } from 'lucide-react'; // Added LayoutList
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Separator } from './ui/separator';

export function AppHeader() {
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl flex items-center">
                  <Package className="h-7 w-7 mr-2 text-primary" /> |dexter3000~
                </SheetTitle>
                <SheetDescription>
                  Menú de navegación principal.
                </SheetDescription>
              </SheetHeader>
              <Separator className="mb-4" />
              <nav className="flex flex-col space-y-2">
                <SheetClose asChild>
                  <Link href="/" passHref>
                    <Button variant="ghost" className="w-full justify-start text-base py-3">
                      <Home className="mr-3 h-5 w-5" />
                      Inicio
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/stats" passHref>
                    <Button variant="ghost" className="w-full justify-start text-base py-3">
                      <BarChart3 className="mr-3 h-5 w-5" />
                      Estadísticas
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/settings/categories" passHref>
                    <Button variant="ghost" className="w-full justify-start text-base py-3">
                      <LayoutList className="mr-3 h-5 w-5" />
                      Gestionar Categorías
                    </Button>
                  </Link>
                </SheetClose>
                 <SheetClose asChild>
                  <Button variant="ghost" className="w-full justify-start text-base py-3" disabled>
                    <Settings className="mr-3 h-5 w-5" />
                    Otros Ajustes (Próximamente)
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
          <Package className="h-10 w-10 text-primary hidden sm:block" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
            |dexter3000~
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Sun className={`h-5 w-5 ${isDarkMode ? 'text-muted-foreground' : 'text-yellow-500'}`} />
          <Switch
            id="theme-switcher"
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            aria-label="Cambiar tema"
          />
          <Moon className={`h-5 w-5 ${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>
      <p className="text-muted-foreground mt-1 pl-[52px] sm:pl-0">
        Encuentra los mejores precios, ¡y recuerda dónde!
      </p>
    </header>
  );
}
