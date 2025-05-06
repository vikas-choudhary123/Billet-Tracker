import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider } from "./lib/auth-context"
import { BilletDataProvider } from "./lib/billet-context"
import { UserProvider } from "./lib/user-context"

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
const ProtectedRoute = ({ children }) => {
  // This would normally check a real auth state
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="billet-tracker-theme">
      <AuthProvider>
        <UserProvider>
          <BilletDataProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receiving"
                  element={
                    <ProtectedRoute>
                      <ReceivingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tmt-production"
                  element={
                    <ProtectedRoute>
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
                    <ProtectedRoute>
                      <WorkflowEntryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/receiving"
                  element={
                    <ProtectedRoute>
                      <WorkflowReceivingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/lab-testing"
                  element={
                    <ProtectedRoute>
                      <LabTestingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workflow/tmt-planning"
                  element={
                    <ProtectedRoute>
                      <TmtPlanningPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/entry"
                  element={
                    <ProtectedRoute>
                      <EntryPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </BilletDataProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
