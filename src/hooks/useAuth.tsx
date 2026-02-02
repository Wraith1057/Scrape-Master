import React from "react";

// Auth removed — minimal no-op hook and provider to avoid breaking imports.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export function useAuth() {
  return {
    user: null,
    session: null,
    loading: false,
    signUp: async (_email: string, _password: string, _fullName?: string) => ({ error: null as Error | null }),
    signIn: async (_email: string, _password: string) => ({ error: null as Error | null }),
    signOut: async () => {},
  };
}
