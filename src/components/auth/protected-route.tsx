// src/components/auth/protected-route.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, verifyToken } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyToken();
      setIsVerifying(false);

      if (!isValid) {
        router.push("/");
      }
    };

    checkAuth();
  }, [verifyToken, router]);

  if (isVerifying) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}
