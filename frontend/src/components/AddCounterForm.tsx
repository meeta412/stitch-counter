import { useState } from 'react'
import type { CounterType } from '../types'

interface AddCounterFormProps {
  onAdd: (label: string, type: CounterType) => void
}

export default function AddCounterForm({ onAdd }: AddCounterFormProps) {
  const [label, setLabel] = useState('')
  const [type, setType] = useState<CounterType>('stitch')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) return
    onAdd(trimmed, type)
    setLabel('')
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="text-lg font-semibold text-yarn-900">Add counter</h3>
      <input
        className="input-field"
        placeholder="Label (e.g. Body stitches)"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
      />
      <div className="flex gap-2">
        {(['stitch', 'row'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
              type === option
                ? 'bg-yarn-700 text-white'
                : 'border border-yarn-300 bg-white text-yarn-700 hover:bg-yarn-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <button type="submit" className="btn-primary w-full">
        Add counter
      </button>
    </form>
  )
}
