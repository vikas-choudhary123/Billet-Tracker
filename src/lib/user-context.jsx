"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

// Define user roles and their permissions
const rolePermissions = {
  admin: ["dashboard", "production", "receiving", "labTesting", "tmtPlanning"],
  supervisor: ["dashboard", "production", "receiving", "labTesting", "tmtPlanning"],
  operator: ["production", "receiving", "labTesting", "tmtPlanning"],
  viewer: ["dashboard"],
}

const UserContext = createContext(undefined)

// Initial users with permissions (without passwords)
const initialUsers = [
  {
    id: "1",
    username: "admin",
    role: "admin",
    name: "Administrator",
    permissions: {
      dashboard: true,
      production: true,
      receiving: true,
      labTesting: true,
      tmtPlanning: true,
    },
  },
  {
    id: "2",
    username: "operator",
    role: "operator",
    name: "Default Operator",
    permissions: {
      dashboard: true,
      production: true,
      receiving: true,
      labTesting: false,
      tmtPlanning: false,
    },
  },
]

export function UserProvider({ children }) {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState(initialUsers)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Update current user when auth user changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && authUser) {
        // Find the user in our users array
        const foundUser = users.find((u) => u.username === authUser.username)
        setCurrentUser(foundUser || null)
      } else {
        setCurrentUser(null)
      }
      setIsLoading(false)
    }
  }, [authUser, isAuthenticated, users, authLoading])

  const addUser = (newUser) => {
    const id = (users.length + 1).toString()
    setUsers([...users, { ...newUser, id }])
  }

  const updateUser = (id, updates) => {
    const updatedUsers = users.map((user) => (user.id === id ? { ...user, ...updates } : user))
    setUsers(updatedUsers)

    // If the updated user is the current user, update the current user state
    if (currentUser && currentUser.id === id) {
      setCurrentUser({ ...currentUser, ...updates })
    }
  }

  const deleteUser = (id) => {
    // Prevent deleting the last admin
    const remainingAdmins = users.filter((u) => u.role === "admin" && u.id !== id).length
    if (users.find((u) => u.id === id)?.role === "admin" && remainingAdmins === 0) {
      console.error("Cannot delete the last admin user")
      return false
    }

    setUsers(users.filter((user) => user.id !== id))

    // If the deleted user is the current user, set current user to null
    if (currentUser && currentUser.id === id) {
      setCurrentUser(null)
    }
    
    return true
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}