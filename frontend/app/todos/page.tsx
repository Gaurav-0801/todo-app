"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Edit2, LogOut } from "lucide-react"
import { authAPI } from "@/lib/auth"
import { todoAPI, type Todo } from "@/lib/todo-api"

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push("/signin")
      return
    }

    loadTodos()
  }, [router])

  const loadTodos = async () => {
    setLoading(true)
    const result = await todoAPI.getTodos()

    if (result.success && result.todos) {
      setTodos(result.todos)
    } else {
      setError(result.message || "Failed to load todos")
    }

    setLoading(false)
  }

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const result = await todoAPI.createTodo(newTask.trim())

    if (result.success && result.todo) {
      setTodos([...todos, result.todo])
      setNewTask("")
    } else {
      setError(result.message || "Failed to create todo")
    }
  }

  const handleToggleTodo = async (id: number) => {
    const result = await todoAPI.toggleTodo(id)

    if (result.success && result.todo) {
      setTodos(todos.map((todo) => (todo.todoid === id ? result.todo! : todo)))
    } else {
      setError(result.message || "Failed to toggle todo")
    }
  }

  const handleDeleteTodo = async (id: number) => {
    const result = await todoAPI.deleteTodo(id)

    if (result.success) {
      setTodos(todos.filter((todo) => todo.todoid !== id))
    } else {
      setError(result.message || "Failed to delete todo")
    }
  }

  const handleEditTodo = async (id: number) => {
    if (!editingText.trim()) return

    const todo = todos.find((t) => t.todoid === id)
    if (!todo) return

    const result = await todoAPI.updateTodo(id, editingText.trim(), todo.done)

    if (result.success && result.todo) {
      setTodos(todos.map((t) => (t.todoid === id ? result.todo! : t)))
      setEditingId(null)
      setEditingText("")
    } else {
      setError(result.message || "Failed to update todo")
    }
  }

  const handleSignOut = () => {
    authAPI.signOut()
    router.push("/signin")
  }

  const completedCount = todos.filter((todo) => todo.done).length
  const totalCount = todos.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading todos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
            <p className="text-gray-600 mt-1">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input
                placeholder="What needs to be done?"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newTask.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {todos.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No todos yet. Add one above to get started!
              </CardContent>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card key={todo.todoid} className={`transition-all ${todo.done ? "opacity-75" : ""}`}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={todo.done} onCheckedChange={() => handleToggleTodo(todo.todoid)} />

                    {editingId === todo.todoid ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleEditTodo(todo.todoid)
                            } else if (e.key === "Escape") {
                              setEditingId(null)
                              setEditingText("")
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleEditTodo(todo.todoid)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setEditingText("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 ${todo.done ? "line-through text-gray-500" : ""}`}>{todo.tasks}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(todo.todoid)
                              setEditingText(todo.tasks)
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTodo(todo.todoid)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
