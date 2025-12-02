import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { authClient } from "../lib/auth-client";

type User = typeof authClient.$Infer.Session.user;
type Session = typeof authClient.$Infer.Session.session;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  setAuthUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: sessionData, isPending } = authClient.useSession();
  // Local override for user
  const [userOverride, setUserOverride] = useState<User | null>(() => {
    // Restore guest user from localStorage if available
    try {
      const isGuest = localStorage.getItem("fitted_guest_mode");
      if (isGuest === "true") {
        const guestUserStr = localStorage.getItem("fitted_guest_user");
        if (guestUserStr) {
          return JSON.parse(guestUserStr) as User;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return null;
  });

  // Derive user and session from sessionData, with local override support
  const user = userOverride ?? sessionData?.user ?? null;
  const session = sessionData?.session ?? null;

  // Clear guest mode if user logs in with real account
  useEffect(() => {
    if (
      sessionData?.user &&
      userOverride &&
      userOverride.id?.startsWith("guest-")
    ) {
      // Real user logged in, clear guest mode
      localStorage.removeItem("fitted_guest_mode");
      localStorage.removeItem("fitted_guest_user");
      setUserOverride(null);
    }
  }, [sessionData?.user, userOverride]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading: isPending,
      isAuthenticated: !!user,
      setAuthUser: setUserOverride,
    }),
    [user, session, isPending]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
