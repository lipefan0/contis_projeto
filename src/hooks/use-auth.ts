import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  isAuthenticated: boolean;
  verifyToken: () => Promise<boolean>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,

      setToken: (token: string) => {
        const expiration = Date.now() + 60 * 60 * 1000; // 1 hora
        set({ token, isAuthenticated: true });
        localStorage.setItem("bling_token", token);
        localStorage.setItem("bling_token_expiration", expiration.toString());
      },

      clearToken: () => {
        console.log("Clearing token...");
        localStorage.removeItem("bling_token");
        set({ token: null, isAuthenticated: false });
      },

      verifyToken: async () => {
        try {
          const token = get().token || localStorage.getItem("bling_token");
          console.log("Verifying token:", token);

          if (!token) {
            console.log("No token found during verification");
            return false;
          }

          const response = await fetch(`${BACKEND_URL}/auth/verify-token`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            console.log("Token is invalid (401), clearing token...");
            get().clearToken();
            return false;
          }

          return response.status === 200;
        } catch (error) {
          console.error("Error verifying token:", error);
          get().clearToken();
          return false;
        }
      },
    }),
    {
      name: "auth-storage", // Nome para o storage do Zustand
      skipHydration: true, // Importante para Next.js
    }
  )
);

// Adicione um useEffect para garantir que localStorage só seja acessado no lado do cliente
if (typeof window !== "undefined") {
  const tokenFromStorage = localStorage.getItem("bling_token");
}
