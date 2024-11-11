// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const { token, isAuthenticated, verifyToken, clearToken } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        console.log("Token not found, redirecting...");
        setIsLoading(false);
        router.replace("/"); // Evita múltiplos redirecionamentos
        return;
      }

      try {
        const isValid = await verifyToken();

        if (!isValid) {
          console.log("Invalid token, clearing...");
          clearToken();
          setIsLoading(false); // Definindo isLoading como false antes do redirecionamento
          router.replace("/"); // Evitar múltiplos redirecionamentos
          toast({
            title: "Sessão expirada",
            description: "Por favor, faça login novamente.",
            variant: "destructive",
          });
        } else {
          console.log("Token valid, proceeding...");
          setIsLoading(false); // Só altera o loading se o token for válido
        }
      } catch (error) {
        console.error("Erro na verificação do token:", error);
        clearToken();
        setIsLoading(false); // Definindo isLoading como false antes do redirecionamento
        router.replace("/"); // Evitar múltiplos redirecionamentos
      }
    };

    if (token) {
      initializeAuth();
    } else {
      setIsLoading(false);
    }
  }, [token, verifyToken, clearToken, router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}
