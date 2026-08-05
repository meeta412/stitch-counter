import { useEffect, useState } from 'react'
import { loadFromStorage, saveToStorage } from '../lib/storage'

const STORAGE_KEY = 'stitch-counter-quick-counters'

interface QuickCounterState {
  stitches: number
  rows: number
}

const defaultState: QuickCounterState = { stitches: 0, rows: 0 }

export function useQuickCounters() {
  const [state, setState] = useState<QuickCounterState>(() =>
    loadFromStorage(STORAGE_KEY, defaultState),
  )

  useEffect(() => {
    saveToStorage(STORAGE_KEY, state)
  }, [state])

  function setStitches(value: number) {
    setState((current) => ({ ...current, stitches: Math.max(0, value) }))
  }

  function setRows(value: number) {
    setState((current) => ({ ...current, rows: Math.max(0, value) }))
  }

  function resetStitches() {
    setState((current) => ({
      stitches: 0,
      rows: current.rows + 1,
    }))
  }

  function resetRows() {
    setState((current) => ({ ...current, rows: 0 }))
  }

  return {
    stitches: state.stitches,
    rows: state.rows,
    setStitches,
    setRows,
    resetStitches,
    resetRows,
  }
}
