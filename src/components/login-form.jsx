"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useToast } from "./ui/use-toast"
import { Factory } from "lucide-react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Check if user is already authenticated
  const { isAuthenticated } = useAuth()
  
  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  // Combine component's submitting state with auth context loading state
  const isButtonDisabled = isSubmitting || isLoading

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter both username and password.",
      })
      return
    }
    
    setIsSubmitting(true)

    try {
      // Attempt login with username and password
      const success = await login(username, password)

      if (success) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${username}!`,
        })
        
        // Add a short delay before navigation to ensure context updates
        setTimeout(() => {
          navigate("/dashboard")
        }, 300)
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid username or password. Please try again.",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-teal-200 dark:border-teal-800">
      <CardHeader className="space-y-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white dark:from-teal-800 dark:to-cyan-800 rounded-t-lg">
        <div className="flex justify-center mb-2">
          <Factory className="h-12 w-12" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">Billet Tracking System</CardTitle>
        <CardDescription className="text-center text-teal-100">
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isButtonDisabled}
              className="border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isButtonDisabled}
              className="border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            disabled={isButtonDisabled}
          >
            {isButtonDisabled ? "Logging in..." : "Login"}
          </Button>

          <div className="text-sm text-muted-foreground text-center pt-2 border-t border-teal-100 dark:border-teal-800 w-full">
            <p className="font-medium text-teal-700 dark:text-teal-400 mb-1">Test Accounts:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded">
                <p className="font-bold">Admin</p>
                <p>admin / admin123</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded">
                <p className="font-bold">Operator</p>
                <p>operator / op123</p>
              </div>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}