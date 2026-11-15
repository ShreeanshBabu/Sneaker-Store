import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const AuthContext = createContext(null)

export function AuthProvider({children}) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiFetch('/me')
            .then((data) => setUser(data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    async function login(email, password) {
        const data = await apiFetch('/login', {method: 'POST', body: {email, password}})
        setUser(data.user)
    }

    async function register(name, email, password) {
        const data = await apiFetch('/register', {method: 'POST', body: {name, email, password}})
        setUser(data.user)
    }

    async function logout() {
        await apiFetch('/logout', {method: 'POST'})
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}