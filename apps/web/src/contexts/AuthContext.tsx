import {
  createContext,
  useContext,
  useState,
  useMemo,
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
  // Local override for user (e.g., for manual updates)
  const [userOverride, setUserOverride] = useState<User | null>(null);

  // Derive user and session from sessionData, with local override support
  const user = userOverride ?? sessionData?.user ?? null;
  const session = sessionData?.session ?? null;

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
