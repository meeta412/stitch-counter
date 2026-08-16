export type CounterType = 'stitch' | 'row'

export interface Counter {
  id: string
  label: string
  value: number
  type: CounterType
}

export interface PatternItem {
  id: string
  rowNumber: number
  instruction: string
  completed: boolean
  notes: string
  stitchCount?: number
}

export interface Project {
  id: string
  name: string
  craftType: string
  counters: Counter[]
  patternItems: PatternItem[]
  createdAt: string
}

export interface ProjectCreate {
  name: string
  craftType?: string
}

export interface CounterCreate {
  label: string
  type: CounterType
}

export interface PatternItemCreate {
  rowNumber: number
  instruction: string
  stitchCount?: number
}

export interface PatternItemUpdate {
  rowNumber?: number
  instruction?: string
  completed?: boolean
  notes?: string
  stitchCount?: number
}

export interface ParsedPatternRow {
  row: number
  instruction: string
  stitch_count?: number
}

export interface User {
  id: string
  email?: string
}
