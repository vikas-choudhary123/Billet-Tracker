import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider, useAuth } from "./lib/auth-context"
import { BilletDataProvider } from "./lib/billet-context"
import { UserProvider } from "./lib/user-context"
import { Toaster } from "./components/ui/toaster"

import HomePage from "./pages/HomePage"
import DashboardPage from "./pages/DashboardPage"
import ReceivingPage from "./pages/ReceivingPage"
import TmtProductionPage from "./pages/TmtProductionPage"
import WorkflowPage from "./pages/WorkflowPage"
import WorkflowEntryPage from "./pages/WorkflowEntryPage"
import WorkflowReceivingPage from "./pages/WorkflowReceivingPage"
import LabTestingPage from "./pages/WorkflowLabTestingPage"
import TmtPlanningPage from "./pages/WorkflowTmtPlanningPage"
import EntryPage from "./pages/EntryPage"

// Protected route component
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, hasPermission, isLoading } = useAuth();

  // Show loading spinner while auth state is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to home page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check for required permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Unauthorized</h1>
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    );
  }

  // User is authenticated and has required permission, render the children
  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="billet-tracker-theme">
      <AuthProvider>
        <UserProvider>
          <BilletDataProvider>
            <Router>
              <Routes>
                {/* Public route - Home/Login page */}
                <Route path="/" element={<HomePage />} />
                
                {/* Protected routes with permission checks */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredPermission="dashboard">
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receiving"
                  element={
                    <ProtectedRoute requiredPermission="receiving">
                      <ReceivingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tmt-production"
                  element={
                    <ProtectedRoute requiredPermission="production">
                      <TmtProductionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow"
                  element={
                    <ProtectedRoute>
                      <WorkflowPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/entry"
                  element={
                    <ProtectedRoute requiredPermission="production">
                      <WorkflowEntryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/receiving"
                  element={
                    <ProtectedRoute requiredPermission="receiving">
                      <WorkflowReceivingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/lab-testing"
                  element={
                    <ProtectedRoute requiredPermission="labTesting">
                      <LabTestingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/tmt-planning"
                  element={
                    <ProtectedRoute requiredPermission="tmtPlanning">
                      <TmtPlanningPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/entry"
                  element={
                    <ProtectedRoute requiredPermission="production">
                      <EntryPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Fallback route - redirect to homepage */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
            
            {/* Toast notifications */}
            <Toaster />
          </BilletDataProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App