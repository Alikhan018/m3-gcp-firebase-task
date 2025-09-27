import React, { useEffect, useState, useContext, type ReactNode } from 'react';
import { onAuthStateChanged, getIdToken, type User } from 'firebase/auth';
import { auth } from "../configs/firebase.config"

// Define the shape of the AuthContext
interface AuthContextType {
    user: User | null;
    idToken: string | null;
}

// Create the AuthContext with TypeScript type
const AuthContext = React.createContext<AuthContextType | null>(null);

// Props interface for AuthProvider
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [idToken, setIdToken] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const token = await getIdToken(firebaseUser, true);
                setIdToken(token);
            } else {
                setUser(null);
                setIdToken(null);
            }
        });
        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ user, idToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}