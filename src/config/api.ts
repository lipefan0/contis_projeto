// src/config/api.ts
import axios, { AxiosError, AxiosInstance } from "axios";

// URLs base
export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(
  "http://",
  "https://"
);

// Criação da instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Interceptor para adicionar token e logging em desenvolvimento
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bling_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("Request:", {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.error("Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("bling_token");
      window.location.href = "/";
    }

    if (error.response?.status === 403) {
      console.error("CORS or Authorization Error:", error);
    }

    return Promise.reject(error);
  }
);

// Tipos para os endpoints
interface Endpoints {
  auth: {
    callback: string;
    exchangeToken: string;
    verifyToken: string;
  };
  products: {
    base: string;
    template: string;
    upload: string;
  };
  customers: {
    base: string;
    template: string;
    upload: string;
  };
  accountsReceivable: {
    base: string;
    template: string;
    upload: string;
  };
  accountsPayable: {
    base: string;
    template: string;
    upload: string;
  };
  reference: {
    formasPagamento: string;
    portadores: string;
    categorias: string;
  };
}

// Endpoints da API - Usando CALLBACK_URL fixo para auth.callback
export const ENDPOINTS: Endpoints = {
  auth: {
    callback: `${API_URL}/auth/callback`, // URL fixa do Render
    exchangeToken: `${API_URL}/auth/exchange-token`,
    verifyToken: `${API_URL}/auth/verify-token`,
  },
  products: {
    base: `${API_URL}/products`,
    template: `${API_URL}/products/template`,
    upload: `${API_URL}/products/upload`,
  },
  customers: {
    base: `${API_URL}/customers`,
    template: `${API_URL}/customers/template`,
    upload: `${API_URL}/customers/upload`,
  },
  accountsReceivable: {
    base: `${API_URL}/accounts/receivable`,
    template: `${API_URL}/accounts/receivable/template`,
    upload: `${API_URL}/accounts/receivable/upload`,
  },
  accountsPayable: {
    base: `${API_URL}/accounts/payble`,
    template: `${API_URL}/accounts/payble/template`,
    upload: `${API_URL}/accounts/payble/upload`,
  },
  reference: {
    formasPagamento: `${API_URL}/reference/formas-pagamento`,
    portadores: `${API_URL}/reference/portadores`,
    categorias: `${API_URL}/reference/categorias`,
  },
};

// Funções auxiliares para requests comuns com melhor tratamento de erros
export const apiService = {
  async get<T>(url: string) {
    try {
      const response = await api.get<T>(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  },

  async post<T>(url: string, data?: any) {
    try {
      const response = await api.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  },

  async put<T>(url: string, data: any) {
    try {
      const response = await api.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  },

  async delete(url: string) {
    try {
      await api.delete(url);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  },

  handleError(error: AxiosError) {
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    if (error.response?.status === 404) {
      return new Error("Recurso não encontrado");
    }

    if (error.response?.status === 400) {
      const message =
        error.response.data && typeof error.response.data === "object"
          ? (error.response.data as { message?: string }).message
          : "Dados inválidos";
      return new Error(message || "Dados inválidos");
    }

    if (error.response?.status === 403) {
      return new Error("Acesso não autorizado");
    }

    return new Error("Erro ao processar requisição");
  },
};

export default api;
