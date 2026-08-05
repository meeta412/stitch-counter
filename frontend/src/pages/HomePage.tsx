import { useState } from 'react'
import Counter from '../components/Counter'
import NewProjectForm from '../components/NewProjectForm'
import ProjectList from '../components/ProjectList'
import { useProjectsContext } from '../context/ProjectsContext'
import { useQuickCounters } from '../hooks/useQuickCounters'

export default function HomePage() {
  const { projects, loading, error, isCloud, addProject } = useProjectsContext()
  const {
    stitches,
    rows,
    setStitches,
    setRows,
    resetStitches,
    resetRows,
  } = useQuickCounters()
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
        <h1 className="text-3xl font-bold text-yarn-900">Projects</h1>
        <p className="text-yarn-600">
          Count stitches and rows, track pattern progress, and sync across devices.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-sm text-yarn-600">Loading projects...</div>
      ) : (
        <ProjectList projects={projects} />
      )}

      <NewProjectForm onCreate={(name, craftType) => void handleCreate(name, craftType)} />

      {creating && <p className="text-sm text-yarn-600">Creating project...</p>}

      {!isCloud && (
        <p className="text-sm text-yarn-600">
          Projects are saved locally in this browser. Sign in to sync them to the cloud.
        </p>
      )}
      <hr></hr>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-yarn-900">Quick Counters</h1>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <Counter
            counter={{ id: 'quick-stitch', label: 'Stitch', value: stitches, type: 'stitch' }}
            onIncrement={() => setStitches(stitches + 1)}
            onDecrement={() => setStitches(stitches - 1)}
            onReset={resetStitches}
          />
          <Counter
            counter={{ id: 'quick-row', label: 'Row', value: rows, type: 'row' }}
            onIncrement={() => setRows(rows + 1)}
            onDecrement={() => setRows(rows - 1)}
            onReset={resetRows}
          />
        </div>
    </div>
  )
}
