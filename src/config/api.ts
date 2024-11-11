// src/config/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const ENDPOINTS = {
  // Auth
  auth: {
    callback: `${API_URL}/auth/callback`,
    exchangeToken: `${API_URL}/auth/exchange-token`,
    verifyToken: `${API_URL}/auth/verify-token`,
  },

  // Products
  products: {
    base: `${API_URL}/products`,
    template: `${API_URL}/products/template`,
    upload: `${API_URL}/products/upload`,
  },

  // Customers
  customers: {
    base: `${API_URL}/customers`,
    template: `${API_URL}/customers/template`,
    upload: `${API_URL}/customers/upload`,
  },

  // Accounts Receivable
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

  // References
  reference: {
    formasPagamento: `${API_URL}/reference/formas-pagamento`,
    portadores: `${API_URL}/reference/portadores`,
    categorias: `${API_URL}/reference/categorias`,
  },
};
