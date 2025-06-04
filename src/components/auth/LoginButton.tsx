import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function LoginButton() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return user ? (
    <Button 
      variant="outline" 
      onClick={() => signOut()}
    >
      Cerrar Sesión
    </Button>
  ) : (
    <Button 
      variant="default" 
      onClick={() => signInWithGoogle()}
    >
      Iniciar Sesión con Google
    </Button>
  );
} 