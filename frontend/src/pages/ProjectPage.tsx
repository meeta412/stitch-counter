import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AddCounterForm from '../components/AddCounterForm'
import Counter from '../components/Counter'
import PatternChecklist from '../components/PatternChecklist'
import PatternImport from '../components/PatternImport'
import TrashIcon from '../components/icons/TrashIcon'
import { useProjectsContext } from '../context/ProjectsContext'

type Tab = 'counters' | 'pattern'

export default function ProjectPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const {
    projects,
    isCloud,
    updateProject,
    deleteProject,
    addCounter,
    updateCounter,
    deleteCounter,
    addPatternItem,
    updatePatternItem,
    deletePatternItem,
    replacePatternItems,
    parsePatternFile,
  } = useProjectsContext()
  const [tab, setTab] = useState<Tab>('pattern')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projects, projectId],
  )

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="card space-y-3">
          <p className="text-yarn-700">Project not found.</p>
          <Link to="/" className="btn-secondary inline-block">
            Back to projects
          </Link>
        </div>
      </div>
    )
  }

  async function handleRename() {
    if (!project) return
    const trimmed = nameDraft.trim()
    if (!trimmed) return
    await updateProject(project.id, trimmed)
    setEditingName(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="space-y-4">
        <Link to="/" className="text-sm font-medium text-yarn-600 hover:text-yarn-800">
          ← All projects
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {editingName ? (
            <form
              className="flex flex-1 gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                void handleRename()
              }}
            >
              <input
                className="input-field"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary">
                Save
              </button>
            </form>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-yarn-900">{project.name}</h1>
              <p className="capitalize text-yarn-600">{project.craftType}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setNameDraft(project.name)
                setEditingName((current) => !current)
              }}
            >
              Rename
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-yarn-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Delete project"
              onClick={() => {
                if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                  void deleteProject(project.id).then(() => navigate('/'))
                }
              }}
            >
              <TrashIcon className="size-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 rounded-2xl bg-yarn-100 p-1">
          {(['pattern', 'counters'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
                tab === option ? 'bg-white text-yarn-900 shadow-sm' : 'text-yarn-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      {tab === 'counters' ? (
        <div className="space-y-4">
          {project.counters.length === 0 ? (
            <div className="card text-sm text-yarn-600">
              No counters yet. Add one below to start counting.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {project.counters.map((counter) => (
                <Counter
                  key={counter.id}
                  counter={counter}
                  onIncrement={() => void updateCounter(project.id, counter.id, counter.value + 1)}
                  onDecrement={() =>
                    void updateCounter(project.id, counter.id, Math.max(0, counter.value - 1))
                  }
                  onReset={() => void updateCounter(project.id, counter.id, 0)}
                  onDelete={() => void deleteCounter(project.id, counter.id)}
                />
              ))}
            </div>
          )}
          <AddCounterForm
            onAdd={(label, type) => void addCounter(project.id, { label, type })}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <PatternChecklist
            items={project.patternItems}
            onToggle={(itemId, completed) =>
              void updatePatternItem(project.id, itemId, { completed })
            }
            onNotesChange={(itemId, notes) =>
              void updatePatternItem(project.id, itemId, { notes })
            }
            onDelete={(itemId) => void deletePatternItem(project.id, itemId)}
            onAddRow={(rowNumber, instruction) =>
              void addPatternItem(project.id, { rowNumber, instruction })
            }
          />
          {isCloud && (
            <PatternImport
              onParse={(file) => parsePatternFile(project.id, file)}
              onSave={async (items) => {
                await replacePatternItems(project.id, items)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
