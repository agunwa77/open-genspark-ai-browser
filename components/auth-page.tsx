"use client"

import type React from "react"

import { useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Loader2 } from "lucide-react"

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const { login, signup, isLoading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (isSignUp) {
        await signup(email, password, name)
      } else {
        await login(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-900">
      <Card className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3 justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white dark:text-black" />
            </div>
            <span className="text-2xl font-bold text-black dark:text-white">Genspark AI</span>
          </div>
          <CardTitle className="text-center text-2xl text-black dark:text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center text-zinc-600 dark:text-zinc-400">
            {isSignUp
              ? "Sign up to access your AGI assistant with persistent memory"
              : "Login to continue your conversation with context awareness"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium text-black dark:text-white">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-black dark:text-white">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black dark:text-white">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-black dark:text-white"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? "Creating account..." : "Logging in..."}
                </>
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent border-zinc-200 dark:border-zinc-700 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError("")
            }}
          >
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign up"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
