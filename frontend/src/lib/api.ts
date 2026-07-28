import type {
  Counter,
  CounterCreate,
  PatternItem,
  PatternItemCreate,
  PatternItemUpdate,
  Project,
  ProjectCreate,
} from '../types'
import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function authHeaders(): Promise<HeadersInit> {
  if (!supabase) return { 'Content-Type': 'application/json' }

  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders()
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export interface ApiProject {
  id: string
  name: string
  craft_type: string
  created_at: string
  counters: ApiCounter[]
  pattern_items: ApiPatternItem[]
}

export interface ApiCounter {
  id: string
  label: string
  value: number
  type: 'stitch' | 'row'
}

export interface ApiPatternItem {
  id: string
  row_number: number
  instruction: string
  completed: boolean
  notes: string
  stitch_count?: number | null
}

function mapProject(api: ApiProject): Project {
  return {
    id: api.id,
    name: api.name,
    craftType: api.craft_type,
    createdAt: api.created_at,
    counters: api.counters.map(mapCounter),
    patternItems: api.pattern_items.map(mapPatternItem),
  }
}

function mapCounter(api: ApiCounter): Counter {
  return {
    id: api.id,
    label: api.label,
    value: api.value,
    type: api.type,
  }
}

function mapPatternItem(api: ApiPatternItem): PatternItem {
  return {
    id: api.id,
    rowNumber: api.row_number,
    instruction: api.instruction,
    completed: api.completed,
    notes: api.notes,
    stitchCount: api.stitch_count ?? undefined,
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const data = await request<ApiProject[]>('/projects')
  return data.map(mapProject)
}

export async function createProjectApi(input: ProjectCreate): Promise<Project> {
  const data = await request<ApiProject>('/projects', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      craft_type: input.craftType ?? 'knitting',
    }),
  })
  return mapProject(data)
}

export async function updateProjectApi(id: string, name: string): Promise<Project> {
  const data = await request<ApiProject>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
  return mapProject(data)
}

export async function deleteProjectApi(id: string): Promise<void> {
  await request<void>(`/projects/${id}`, { method: 'DELETE' })
}

export async function createCounterApi(projectId: string, input: CounterCreate): Promise<Counter> {
  const data = await request<ApiCounter>(`/projects/${projectId}/counters`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return mapCounter(data)
}

export async function updateCounterApi(
  projectId: string,
  counterId: string,
  value: number,
): Promise<Counter> {
  const data = await request<ApiCounter>(`/projects/${projectId}/counters/${counterId}`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  })
  return mapCounter(data)
}

export async function deleteCounterApi(projectId: string, counterId: string): Promise<void> {
  await request<void>(`/projects/${projectId}/counters/${counterId}`, { method: 'DELETE' })
}

export async function createPatternItemApi(
  projectId: string,
  input: PatternItemCreate,
): Promise<PatternItem> {
  const data = await request<ApiPatternItem>(`/projects/${projectId}/pattern-items`, {
    method: 'POST',
    body: JSON.stringify({
      row_number: input.rowNumber,
      instruction: input.instruction,
      stitch_count: input.stitchCount,
    }),
  })
  return mapPatternItem(data)
}

export async function updatePatternItemApi(
  projectId: string,
  itemId: string,
  input: PatternItemUpdate,
): Promise<PatternItem> {
  const data = await request<ApiPatternItem>(`/projects/${projectId}/pattern-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      instruction: input.instruction,
      completed: input.completed,
      notes: input.notes,
      stitch_count: input.stitchCount,
    }),
  })
  return mapPatternItem(data)
}

export async function deletePatternItemApi(projectId: string, itemId: string): Promise<void> {
  await request<void>(`/projects/${projectId}/pattern-items/${itemId}`, { method: 'DELETE' })
}

export async function migrateLocalProjects(projects: Project[]): Promise<Project[]> {
  const data = await request<ApiProject[]>('/projects/migrate', {
    method: 'POST',
    body: JSON.stringify({
      projects: projects.map((project) => ({
        name: project.name,
        craft_type: project.craftType,
        counters: project.counters.map((counter) => ({
          label: counter.label,
          value: counter.value,
          type: counter.type,
        })),
        pattern_items: project.patternItems.map((item) => ({
          row_number: item.rowNumber,
          instruction: item.instruction,
          completed: item.completed,
          notes: item.notes,
          stitch_count: item.stitchCount,
        })),
      })),
    }),
  })
  return data.map(mapProject)
}

export async function parsePatternFile(
  projectId: string,
  file: File,
): Promise<PatternItem[]> {
  const headers = await authHeaders()
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/projects/${projectId}/parse-pattern`, {
    method: 'POST',
    headers: {
      Authorization: (headers as Record<string, string>).Authorization ?? '',
    },
    body: formData,
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || 'Failed to parse pattern')
  }

  const data = await response.json() as ApiPatternItem[]
  return data.map(mapPatternItem)
}

export async function saveParsedPattern(
  projectId: string,
  items: PatternItem[],
): Promise<PatternItem[]> {
  const data = await request<ApiPatternItem[]>(`/projects/${projectId}/pattern-items/bulk`, {
    method: 'POST',
    body: JSON.stringify({
      items: items.map((item) => ({
        row_number: item.rowNumber,
        instruction: item.instruction,
        completed: item.completed,
        notes: item.notes,
        stitch_count: item.stitchCount,
      })),
    }),
  })
  return data.map(mapPatternItem)
}
