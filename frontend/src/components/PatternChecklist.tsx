import { useState } from 'react'
import type { PatternItem } from '../types'
import TrashIcon from './icons/TrashIcon'

interface PatternChecklistProps {
  items: PatternItem[]
  onToggle: (itemId: string, completed: boolean) => void
  onNotesChange: (itemId: string, notes: string) => void
  onDelete: (itemId: string) => void
  onAddRow: (rowNumber: number, instruction: string) => void
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
      />
    </svg>
  )
}

export default function PatternChecklist({
  items,
  onToggle,
  onNotesChange,
  onDelete,
  onAddRow,
}: PatternChecklistProps) {
  const [instruction, setInstruction] = useState('')
  const [openNotesId, setOpenNotesId] = useState<string | null>(null)
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

  function toggleNotes(itemId: string) {
    setOpenNotesId((current) => (current === itemId ? null : itemId))
  }

  function handleDelete(item: PatternItem) {
    if (window.confirm(`Delete row ${item.rowNumber}?`)) {
      onDelete(item.id)
    }
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
        {sortedItems.map((item) => {
          const hasNote = Boolean(item.notes.trim())
          const isEditingNote = openNotesId === item.id

          return (
            <div key={item.id} className="card space-y-2">
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
                    <span className="text-sm font-semibold text-yarn-500">
                      Row {item.rowNumber}
                    </span>
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
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleNotes(item.id)}
                    className={`rounded-lg p-1.5 transition ${
                      hasNote || isEditingNote
                        ? 'text-yarn-700 hover:bg-yarn-100'
                        : 'text-yarn-400 hover:bg-yarn-100 hover:text-yarn-700'
                    }`}
                    aria-label={hasNote ? 'Edit note' : 'Add note'}
                    aria-expanded={isEditingNote}
                  >
                    <ChatBubbleIcon className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-lg p-1.5 text-yarn-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete row ${item.rowNumber}`}
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              </div>

              {hasNote && !isEditingNote && (
                <p className="ml-9 border-l-2 border-yarn-200 pl-3 text-sm text-yarn-600">
                  {item.notes}
                </p>
              )}

              {isEditingNote && (
                <textarea
                  className="input-field ml-9 min-h-[4rem] resize-y"
                  placeholder="Notes for this row..."
                  value={item.notes}
                  autoFocus
                  onChange={(event) => onNotesChange(item.id, event.target.value)}
                  onBlur={() => setOpenNotesId(null)}
                />
              )}
            </div>
          )
        })}
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
