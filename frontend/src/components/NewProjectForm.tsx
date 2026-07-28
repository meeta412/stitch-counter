import { useState } from 'react'

interface NewProjectFormProps {
  onCreate: (name: string, craftType: string) => void
}

export default function NewProjectForm({ onCreate }: NewProjectFormProps) {
  const [name, setName] = useState('')
  const [craftType, setCraftType] = useState('knitting')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, craftType)
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h2 className="text-xl font-semibold text-yarn-900">New project</h2>
      <input
        className="input-field"
        placeholder="Project name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <select
        className="input-field"
        value={craftType}
        onChange={(event) => setCraftType(event.target.value)}
      >
        <option value="knitting">Knitting</option>
        <option value="crochet">Crochet</option>
        <option value="other">Other</option>
      </select>
      <button type="submit" className="btn-primary w-full">
        Create project
      </button>
    </form>
  )
}
