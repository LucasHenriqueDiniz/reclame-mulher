"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  metadata?: Record<string, string>;
  mustChangePassword?: boolean;
}

export interface AuthProfile {
  name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  role?: "USER" | "COMPANY" | "ADMIN" | null;
}

interface MeResponse {
  user?: AuthUser | null;
  profile?: AuthProfile | null;
  companyMembership?: {
    companyId: string;
    companyName: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
  } | null;
}

interface AuthStateValue {
  user: AuthUser | null;
  profile: AuthProfile | null;
  companyMembership: MeResponse["companyMembership"];
  loading: boolean;
  isLoggedIn: boolean;
  isCompany: boolean;
  isAdmin: boolean;
  mustChangePassword: boolean;
  refresh: () => Promise<void>;
  clear: () => void;
}

const AuthStateContext = createContext<AuthStateValue | null>(null);

export function AuthStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [companyMembership, setCompanyMembership] = useState<MeResponse["companyMembership"]>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/me", { cache: "no-store" });
      const data: MeResponse | null = response.ok ? await response.json() : null;

      setUser(data?.user ?? null);
      setProfile(data?.profile ?? null);
      setCompanyMembership(data?.companyMembership ?? null);
    } catch {
      setUser(null);
      setProfile(null);
      setCompanyMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const clear = useCallback(() => {
    setUser(null);
    setProfile(null);
    setCompanyMembership(null);
    setLoading(false);
  }, []);

  const value = useMemo<AuthStateValue>(
    () => ({
      user,
      profile,
      companyMembership,
      loading,
      isLoggedIn: !!user,
      isCompany: !!companyMembership,
      isAdmin: profile?.role === "ADMIN",
      mustChangePassword: !!user?.mustChangePassword,
      refresh,
      clear,
    }),
    [user, profile, companyMembership, loading, refresh, clear]
  );

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw new Error("useAuthState must be used within AuthStateProvider");
  }

  return context;
}

export function useIsAdmin() {
  const { isAdmin, loading, profile } = useAuthState();

  return {
    isAdmin,
    loading,
    profile,
  };
}
