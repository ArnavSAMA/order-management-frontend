import React,{ createContext, useContext, useMemo, useState} from "react";
import type { Role, User } from '@/features/auth/types'

type AuthState = {
    user: User | null
    login: (role: Role) => void
    logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }){
    const [user, setUser] = useState<User | null>(null)

    const login = (role: Role) => {
        setUser({
            id: 'user001',
            name: 'Demo User',
            role,
        })
    } 
    const logout = () => setUser(null)

    const value = useMemo(() => ({ user, login, logout}), [user])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(){
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}