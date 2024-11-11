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
    const checkAuth = async () => {
      try {
        if (!token) {
          clearToken();
          router.replace("/");
          return;
        }

        const isValid = await verifyToken();
        if (!isValid) {
          clearToken();
          router.replace("/");
          toast({
            title: "Sessão expirada",
            description: "Por favor, faça login novamente.",
            variant: "destructive",
          });
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        clearToken();
        router.replace("/");
      }
    };

    checkAuth();
  }, [token, router, clearToken, verifyToken, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}
