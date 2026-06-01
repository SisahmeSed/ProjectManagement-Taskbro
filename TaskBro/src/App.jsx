import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth }      from "./store/AuthContext"
import { ProjectProvider }            from "./store/ProjectContext"
import { ChangelogProvider }          from "./store/ChangelogContext"
import { MemberProvider }             from "./store/MemberContext"
import { TaskProvider }               from "./store/TaskContext"
import { ToastProvider }              from "./components/ui/Toast"
import AppLayout    from "./components/layout/AppLayout"
import AuthPage     from "./pages/AuthPage"
import ProjectsPage from "./pages/ProjectsPage"
import BoardPage    from "./pages/BoardPage"
import ActivityPage from "./pages/ActivityPage"
import SettingsPage from "./pages/SettingsPage"

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen text-heading">
      Loading...
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/"
        element={isAuthenticated ? <Navigate to="/projects" replace /> : <AuthPage />}
      />
      <Route path="/projects" element={
        <ProtectedRoute>
          <AppLayout><ProjectsPage /></AppLayout>
        </ProtectedRoute>
      }/>
      <Route path="/board/:projectId" element={
        <ProtectedRoute>
          <AppLayout><BoardPage /></AppLayout>
        </ProtectedRoute>
      }/>
      <Route path="/activity" element={
        <ProtectedRoute>
          <AppLayout><ActivityPage /></AppLayout>
        </ProtectedRoute>
      }/>
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      }/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <ChangelogProvider>
          <MemberProvider>
            <TaskProvider>
              <ToastProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </ToastProvider>
            </TaskProvider>
          </MemberProvider>
        </ChangelogProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}