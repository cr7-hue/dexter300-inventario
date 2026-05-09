"use client";

import { Package, Moon, Sun, Menu as MenuIcon, Home, BarChart3, Settings, LayoutList } from 'lucide-react';
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
import { LoginButton } from './auth/LoginButton';
import { useAuth } from '@/contexts/AuthContext';

export function AppHeader() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
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
      <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-secondary/50 hover:bg-primary/15 hover:text-primary"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] glass-strong border-r border-border/60">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl flex items-center">
                  <div className="h-9 w-9 rounded-xl gradient-violet flex items-center justify-center mr-2 shadow-lg shadow-primary/30">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <span className="gradient-text font-bold">|dexter3000~</span>
                </SheetTitle>
                <SheetDescription>
                  Menú de navegación principal.
                </SheetDescription>
              </SheetHeader>
              <Separator className="mb-4 opacity-50" />
              <nav className="flex flex-col space-y-1.5">
                <SheetClose asChild>
                  <Link href="/" passHref>
                    <Button variant="ghost" className="w-full justify-start text-base py-5 rounded-xl hover:bg-primary/10 hover:text-primary">
                      <Home className="mr-3 h-5 w-5" />
                      Inicio
                    </Button>
                  </Link>
                </SheetClose>
                {user && (
                  <>
                    <SheetClose asChild>
                      <Link href="/stats" passHref>
                        <Button variant="ghost" className="w-full justify-start text-base py-5 rounded-xl hover:bg-primary/10 hover:text-primary">
                          <BarChart3 className="mr-3 h-5 w-5" />
                          Estadísticas
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/settings/categories" passHref>
                        <Button variant="ghost" className="w-full justify-start text-base py-5 rounded-xl hover:bg-primary/10 hover:text-primary">
                          <LayoutList className="mr-3 h-5 w-5" />
                          Gestionar Categorías
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" className="w-full justify-start text-base py-5 rounded-xl opacity-50" disabled>
                        <Settings className="mr-3 h-5 w-5" />
                        Otros Ajustes (Próximamente)
                      </Button>
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="h-10 w-10 rounded-xl gradient-violet flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight gradient-text">
              |dexter3000~
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-2 py-1 rounded-full bg-secondary/50">
            <Sun className={`h-4 w-4 transition-colors ${isDarkMode ? 'text-muted-foreground' : 'text-[hsl(var(--gold))]'}`} />
            <Switch
              id="theme-switcher"
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
              aria-label="Cambiar tema"
            />
            <Moon className={`h-4 w-4 transition-colors ${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="sm:hidden h-10 w-10 rounded-xl bg-secondary/50 hover:bg-primary/15"
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-[hsl(var(--gold))]" />}
          </Button>
          <LoginButton />
        </div>
      </div>
      <p className="text-muted-foreground mt-3 text-sm pl-1">
        Encuentra los mejores precios, ¡y recuerda dónde!
      </p>
    </header>
  );
}
