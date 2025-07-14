"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (authAPI.isAuthenticated()) {
      router.push("/todos")
    } else {
      router.push("/signin")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}
