import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid'
import type { Counter as CounterType } from '../types'

interface CounterProps {
  counter: CounterType
  onIncrement: () => void
  onDecrement: () => void
  onReset: () => void
  onDelete?: () => void
}

export default function Counter({
  counter,
  onIncrement,
  onDecrement,
  onReset,
  onDelete,
}: CounterProps) {
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-yarn-500">
            {counter.type}
          </p>
          <h3 className="text-lg font-semibold text-yarn-900">{counter.label}</h3>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-yarn-500 transition hover:text-red-600"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onDecrement}
          aria-label={`Decrease ${counter.label}`}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yarn-100 text-yarn-800 transition hover:bg-yarn-200 active:scale-95"
        >
          <MinusIcon className="h-8 w-8" />
        </button>

        <div className="min-w-[5rem] text-center">
          <span className="text-5xl font-bold tabular-nums text-yarn-900">{counter.value}</span>
        </div>

        <button
          type="button"
          onClick={onIncrement}
          aria-label={`Increase ${counter.label}`}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yarn-700 text-white transition hover:bg-yarn-800 active:scale-95"
        >
          <PlusIcon className="h-8 w-8" />
        </button>
      </div>

      <button type="button" onClick={onReset} className="btn-secondary w-full">
        Reset to 0
      </button>
    </div>
  )
}
