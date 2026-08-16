import type { PatternItem } from '../types'

export type ReorderDirection = 'up' | 'down'

export function reorderPatternItems(
  items: PatternItem[],
  itemId: string,
  direction: ReorderDirection,
): PatternItem[] {
  const sorted = [...items].sort((a, b) => a.rowNumber - b.rowNumber)
  const index = sorted.findIndex((item) => item.id === itemId)
  if (index === -1) return items

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= sorted.length) return items

  const current = sorted[index]
  const neighbor = sorted[swapIndex]
  const currentRow = current.rowNumber
  const neighborRow = neighbor.rowNumber

  return items.map((item) => {
    if (item.id === current.id) return { ...item, rowNumber: neighborRow }
    if (item.id === neighbor.id) return { ...item, rowNumber: currentRow }
    return item
  })
}
