import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProjectsProvider } from './context/ProjectsContext'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'

export default function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:projectId" element={<ProjectPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProjectsProvider>
    </AuthProvider>
  )
}
