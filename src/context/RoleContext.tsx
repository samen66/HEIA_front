import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "@/lib/roles";

const STORAGE_KEY = "heia-selected-role";

interface RoleContextValue {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function readStoredRole(): UserRole | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return raw as UserRole;
  } catch {
    return null;
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(readStoredRole);

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next);
    sessionStorage.setItem(STORAGE_KEY, next);
  }, []);

  const clearRole = useCallback(() => {
    setRoleState(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ role, setRole, clearRole }),
    [role, setRole, clearRole],
  );

  return (
    <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return ctx;
}
