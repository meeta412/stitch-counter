import { useState } from 'react'
import AuthPanel from '../components/AuthPanel'
import NewProjectForm from '../components/NewProjectForm'
import ProjectList from '../components/ProjectList'
import { useProjectsContext } from '../context/ProjectsContext'

export default function HomePage() {
  const { projects, loading, error, isCloud, addProject } = useProjectsContext()
  const [creating, setCreating] = useState(false)

  async function handleCreate(name: string, craftType: string) {
    setCreating(true)
    try {
      await addProject({ name, craftType })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-yarn-600">Stitch Counter</p>
        <h1 className="text-3xl font-bold text-yarn-900">Your projects</h1>
        <p className="text-yarn-600">
          Count stitches and rows, track pattern progress, and sync across devices.
        </p>
      </header>

      <AuthPanel />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <NewProjectForm onCreate={(name, craftType) => void handleCreate(name, craftType)} />

      {loading ? (
        <div className="card text-sm text-yarn-600">Loading projects...</div>
      ) : (
        <ProjectList projects={projects} />
      )}

      {creating && <p className="text-sm text-yarn-600">Creating project...</p>}

      {!isCloud && (
        <p className="text-sm text-yarn-600">
          Projects are saved locally in this browser. Sign in to sync them to the cloud.
        </p>
      )}
    </div>
  )
}
