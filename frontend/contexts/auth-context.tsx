"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem("isAuthenticated") === "true"
      const storedUser = localStorage.getItem("user")

      if (isAuth && storedUser) {
        try {
          setUser(JSON.parse(storedUser)) // Safely parse JSON
        } catch (error) {
          console.error("Error parsing user from localStorage:", error)
          localStorage.removeItem("user") // Clear invalid data
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Protect routes - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading) {
      const isAuth = localStorage.getItem("isAuthenticated") === "true"
      const isAuthPage = pathname === "/login" || pathname === "/signup"

      if (!isAuth && !isAuthPage && pathname !== "/forgot-password") {
        router.push("/login")
      } else if (isAuth && isAuthPage) {
        router.push("/")
      }
    }
  }, [isLoading, pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!email || !password) {
        return { success: false, message: "Email and password are required" }
      }

      // Mock successful login
      if (email === "user@example.com" && password === "password") {
        const userData = {
          id: "1",
          name: "Demo User",
          email: "user@example.com",
        }

        setUser(userData)
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("user", JSON.stringify(userData))

        return { success: true }
      }

      return { success: false, message: "Invalid email or password" }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!name || !email || !password) {
        return { success: false, message: "All fields are required" }
      }

      // Mock successful registration
      const userData = {
        id: "2",
        name,
        email,
      }

      setUser(userData)
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("user", JSON.stringify(userData))

      return { success: true }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

