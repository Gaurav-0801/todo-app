import { authAPI } from "./auth"

export interface Todo {
  todoid: number
  tasks: string
  done: boolean
  userId: string
  createdAt?: string
  updatedAt?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

const getAuthHeaders = () => {
  const token = authAPI.getToken()
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export const todoAPI = {
  async createTodo(tasks: string, done = false): Promise<{ success: boolean; todo?: Todo; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/todo`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ tasks, done }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, todo: data.todo }
      }

      return { success: false, message: data.message || "Failed to create todo" }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  },

  async getTodos(): Promise<{ success: boolean; todos?: Todo[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/todo`, {
        method: "GET",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, todos: data.getAll }
      }

      return { success: false, message: data.message || "Failed to fetch todos" }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  },

  async updateTodo(
    id: number,
    tasks: string,
    done: boolean,
  ): Promise<{ success: boolean; todo?: Todo; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/todo/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ tasks, done }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, todo: data.updateTodo }
      }

      return { success: false, message: data.message || "Failed to update todo" }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  },

  async deleteTodo(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/todo/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      }

      return { success: false, message: data.message || "Failed to delete todo" }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  },

  async toggleTodo(id: number): Promise<{ success: boolean; todo?: Todo; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/todo/${id}/toggle`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, todo: data.todo }
      }

      return { success: false, message: data.message || "Failed to toggle todo" }
    } catch (error) {
      return { success: false, message: "Network error" }
    }
  },
}
