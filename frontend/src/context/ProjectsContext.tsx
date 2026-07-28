import { createContext, useContext, type ReactNode } from 'react'
import { useProjects, type ProjectsApi } from '../hooks/useProjects'

const ProjectsContext = createContext<ProjectsApi | null>(null)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const projectsApi = useProjects()
  return <ProjectsContext.Provider value={projectsApi}>{children}</ProjectsContext.Provider>
}

export function useProjectsContext(): ProjectsApi {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjectsContext must be used within ProjectsProvider')
  }
  return context
}
