import { Link } from 'react-router-dom'
import type { Project } from '../types'

interface ProjectListProps {
  projects: Project[]
  activeProjectId?: string
}

export default function ProjectList({ projects, activeProjectId }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="card text-sm text-yarn-600">
        No projects yet. Create one to start counting stitches and rows.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const isActive = project.id === activeProjectId
        return (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className={`block rounded-2xl border px-4 py-3 transition ${
              isActive
                ? 'border-yarn-700 bg-yarn-700 text-white'
                : 'border-yarn-200 bg-white text-yarn-900 hover:border-yarn-400 hover:bg-yarn-50'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{project.name}</p>
                <p className={`text-sm capitalize ${isActive ? 'text-yarn-100' : 'text-yarn-600'}`}>
                  {project.craftType}
                </p>
              </div>
              <div className={`text-sm ${isActive ? 'text-yarn-100' : 'text-yarn-600'}`}>
                {project.patternItems.filter((item) => !item.completed).length} rows left
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
