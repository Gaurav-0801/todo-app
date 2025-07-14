interface User {
  userId: string
  email: string
  username?: string
  token: string
}

interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export const authAPI = {
  async signUp(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Your backend returns user.id, so we need to create a user object
        const user = {
          userId: data.user, // This is the user ID from your response
          email,
          username,
          token: "", // No token returned from signup
        }

        return { success: true, user, message: data.message }
      }

      return { success: false, message: data.message || "Sign up failed" }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        const user = {
          userId: data.user?.userId || "unknown",
          email,
          username: data.user?.username || "",
          token: data.token,
        }

        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(user))
        return { success: true, user, token: data.token }
      }

      return { success: false, message: data.message || "Sign in failed" }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  },

  signOut() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
