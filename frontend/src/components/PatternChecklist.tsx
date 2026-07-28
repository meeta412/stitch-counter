import { useState } from 'react'
import type { PatternItem } from '../types'

interface PatternChecklistProps {
  items: PatternItem[]
  onToggle: (itemId: string, completed: boolean) => void
  onNotesChange: (itemId: string, notes: string) => void
  onDelete: (itemId: string) => void
  onAddRow: (rowNumber: number, instruction: string) => void
}

export default function PatternChecklist({
  items,
  onToggle,
  onNotesChange,
  onDelete,
  onAddRow,
}: PatternChecklistProps) {
  const [instruction, setInstruction] = useState('')
  const sortedItems = [...items].sort((a, b) => a.rowNumber - b.rowNumber)
  const nextRowNumber =
    sortedItems.length > 0 ? sortedItems[sortedItems.length - 1].rowNumber + 1 : 1

  function handleAddRow(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = instruction.trim()
    if (!trimmed) return
    onAddRow(nextRowNumber, trimmed)
    setInstruction('')
  }

  if (items.length === 0) {
    return (
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-yarn-900">Pattern checklist</h3>
          <p className="text-sm text-yarn-600">
            Add rows manually or import a pattern file to get started.
          </p>
        </div>
        <form onSubmit={handleAddRow} className="space-y-3">
          <input
            className="input-field"
            placeholder={`Row ${nextRowNumber} instruction`}
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
          />
          <button type="submit" className="btn-secondary w-full">
            Add first row
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-yarn-900">Pattern checklist</h3>
        <span className="text-sm text-yarn-600">
          {items.filter((item) => item.completed).length}/{items.length} done
        </span>
      </div>

      <div className="space-y-3">
        {sortedItems.map((item) => (
          <div key={item.id} className="card space-y-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggle(item.id, !item.completed)}
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                  item.completed
                    ? 'border-yarn-700 bg-yarn-700 text-white'
                    : 'border-yarn-300 bg-white text-transparent'
                }`}
                aria-label={`Mark row ${item.rowNumber} ${item.completed ? 'incomplete' : 'complete'}`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-yarn-500">Row {item.rowNumber}</span>
                  {item.stitchCount != null && (
                    <span className="rounded-full bg-yarn-100 px-2 py-0.5 text-xs text-yarn-700">
                      {item.stitchCount} sts
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-sm ${
                    item.completed ? 'text-yarn-500 line-through' : 'text-yarn-900'
                  }`}
                >
                  {item.instruction}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="text-sm text-yarn-500 transition hover:text-red-600"
              >
                Delete
              </button>
            </div>
            <textarea
              className="input-field min-h-[4rem] resize-y"
              placeholder="Notes for this row..."
              value={item.notes}
              onChange={(event) => onNotesChange(item.id, event.target.value)}
            />
          </div>
        ))}
      </div>

      <form onSubmit={handleAddRow} className="card space-y-3">
        <h4 className="font-medium text-yarn-900">Add row {nextRowNumber}</h4>
        <input
          className="input-field"
          placeholder="Instruction"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
        />
        <button type="submit" className="btn-secondary w-full">
          Add row
        </button>
      </form>
    </div>
  )
}
