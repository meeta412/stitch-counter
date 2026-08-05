import { useRef, useState } from 'react'
import type { PatternItem } from '../types'

interface PatternImportProps {
  onParse: (file: File) => Promise<PatternItem[]>
  onSave: (items: PatternItem[]) => Promise<void>
}

export default function PatternImport({ onParse, onSave }: PatternImportProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<PatternItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setFileName(file.name)

    try {
      const items = await onParse(file)
      setPreview(items)
    } catch (err) {
      setPreview([])
      setError(err instanceof Error ? err.message : 'Failed to parse pattern')
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  async function handleSave() {
    if (preview.length === 0) return
    setLoading(true)
    setError(null)
    try {
      await onSave(preview)
      setPreview([])
      setFileName(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pattern')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-yarn-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 shrink-0 text-yarn-600"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>
          Import pattern
        </h3>
        <p className="text-sm text-yarn-600">
          Upload a PDF or image screenshot. AI will turn it into a row-by-row checklist.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="btn-secondary w-full"
      >
        {loading ? 'Processing...' : 'Choose PDF or image'}
      </button>

      {fileName && <p className="text-sm text-yarn-600">Selected: {fileName}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {preview.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-yarn-800">
            Preview ({preview.length} rows) — review before saving
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-yarn-200 p-3">
            {preview.map((item) => (
              <div key={`${item.rowNumber}-${item.instruction}`} className="text-sm">
                <span className="font-semibold text-yarn-600">Row {item.rowNumber}: </span>
                <span className="text-yarn-900">{item.instruction}</span>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleSave} disabled={loading} className="btn-primary w-full">
            Save checklist
          </button>
        </div>
      )}
    </div>
  )
}
