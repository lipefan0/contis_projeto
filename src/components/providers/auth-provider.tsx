// src/components/providers/auth-provider.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { verifyToken, token } = useAuth();

  useEffect(() => {
    // Aguarda a hidratação do Zustand
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isHydrated && token) {
      verifyToken(); // Verifica o token apenas quando a hidratação está completa
    }
  }, [isHydrated, token, verifyToken]);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
