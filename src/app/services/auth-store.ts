// src/app/shared/auth-store.ts
export const AuthStore = {
  username: null as string | null,
  productId: null as string | null,
  isAuthenticated: false,

  setAuthInfo(username: string, productId: string): void {
    this.username = username;
    this.productId = productId;
    this.isAuthenticated = true;
  },

  clearAuthInfo(): void {
    this.username = null;
    this.productId = null;
    this.isAuthenticated = false;
  }
};
