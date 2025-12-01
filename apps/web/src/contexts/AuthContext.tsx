import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authClient } from '../lib/auth-client';

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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data: sessionData, isPending } = authClient.useSession();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        if (sessionData) {
            setUser(sessionData.user);
            setSession(sessionData.session);
        } else {
            setUser(null);
            setSession(null);
        }
    }, [sessionData]);

    const value = {
        user,
        session,
        loading: isPending,
        isAuthenticated: !!user,
        setAuthUser: setUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
