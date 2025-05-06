import React from "react"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { useAuth } from "../lib/auth-context"
import { ModeToggle } from "./mode-toggle"
import { LayoutDashboard, FileInput, Layers, LogOut, Menu, X, FlaskRoundIcon as Flask, Workflow } from 'lucide-react'
import { useState } from "react"

export default function Header() {
  const { user, logout, hasPermission } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 w-8 h-8 rounded-md flex items-center justify-center text-white font-bold mr-2">
                B
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">BilletTracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {hasPermission("dashboard") && (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}
            {hasPermission("production") && (
              <Link to="/entry">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
                  <FileInput className="h-4 w-4 mr-2" />
                  Billet Production
                </Button>
              </Link>
            )}
            {hasPermission("receiving") && (
              <Link to="/receiving">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
                  <Layers className="h-4 w-4 mr-2" />
                 Billet Receiving
                </Button>
              </Link>
            )}
            {hasPermission("tmtPlanning") && (
              <Link to="/workflow">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
                  <Workflow className="h-4 w-4 mr-2" />
                  Lab Testing
                </Button>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            <ModeToggle />
            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 dark:text-slate-300">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-2">
              {hasPermission("dashboard") && (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600 dark:text-slate-300">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}
              {hasPermission("production") && (
                <Link to="/entry" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600 dark:text-slate-300">
                    <FileInput className="h-4 w-4 mr-2" />
                    Production
                  </Button>
                </Link>
              )}
              {hasPermission("receiving") && (
                <Link to="/receiving" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600 dark:text-slate-300">
                    <Layers className="h-4 w-4 mr-2" />
                    Receiving
                  </Button>
                </Link>
              )}
              {hasPermission("tmtPlanning") && (
                <Link to="/workflow" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600 dark:text-slate-300">
                    <Workflow className="h-4 w-4 mr-2" />
                    Workflow
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}