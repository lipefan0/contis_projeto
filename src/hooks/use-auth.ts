// src/hooks/use-auth.ts
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
        set({ token, isAuthenticated: true });
      },

      clearToken: () => {
        set({ token: null, isAuthenticated: false });
      },

      verifyToken: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await fetch(`${BACKEND_URL}/auth/verify-token`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const isValid = response.status === 200;
          if (!isValid) {
            get().clearToken();
          }

          return isValid;
        } catch (error) {
          console.error("Error verifying token:", error);
          get().clearToken();
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
