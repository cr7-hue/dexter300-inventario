"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, LogOut } from "lucide-react";

export function LoginButton() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return user ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut()}
      className="h-10 rounded-xl bg-secondary/50 hover:bg-destructive/15 hover:text-destructive transition-colors"
    >
      <LogOut className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Cerrar Sesión</span>
    </Button>
  ) : (
    <Button
      onClick={() => signInWithGoogle()}
      className="h-10 rounded-xl gradient-violet border-0 text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
    >
      <LogIn className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Iniciar Sesión</span>
    </Button>
  );
}
