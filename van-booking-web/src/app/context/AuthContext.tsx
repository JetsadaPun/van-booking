'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Role } from '../types'

interface AuthContextType {
    user: any | null
    isLoading: boolean
    login: (credentials: { username?: string; email?: string; password: string }) => Promise<void>
    logout: () => void
    updateProfile: (data: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const updateProfile = (data: any) => {
        if (!user) return

        const updatedUser = { ...user, ...data }
        setUser(updatedUser)

        // Update session in localStorage if it exists
        const savedSession = localStorage.getItem('user_session')
        if (savedSession) {
            const session = JSON.parse(savedSession)
            const newSession = { ...session, ...data }
            localStorage.setItem('user_session', JSON.stringify(newSession))
        }
    }

    const login = async (credentials: { username?: string; email?: string; password: string }) => {
        setIsLoading(true)
        try {
            const res = await fetch(`http://localhost:8080/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await res.json()
            // data should contain { token: string, user: User }
            const sessionData = {
                ...data.user,
                token: data.token
            }

            setUser(sessionData)
            localStorage.setItem('user_session', JSON.stringify(sessionData))
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user_session')
    }

    useEffect(() => {
        const savedSession = localStorage.getItem('user_session')
        if (savedSession) {
            try {
                const parsedSession = JSON.parse(savedSession)
                if (parsedSession && parsedSession.token && (parsedSession.username || parsedSession.email)) {
                    setUser(parsedSession)
                } else {
                    localStorage.removeItem('user_session')
                }
            } catch (e) {
                localStorage.removeItem('user_session')
            }
        }
        setIsLoading(false)
    }, [])

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
