import { useCallback, useEffect, useState } from 'react'
import type { Counter, CounterCreate, PatternItem, PatternItemCreate, PatternItemUpdate, Project, ProjectCreate } from '../types'
import { reorderPatternItems, type ReorderDirection } from '../lib/reorderPatternItems'
import { createId, loadFromStorage, saveToStorage, STORAGE_KEY } from '../lib/storage'

function createEmptyProject(name: string, craftType = 'knitting'): Project {
  return {
    id: createId(),
    name,
    craftType,
    counters: [],
    patternItems: [],
    createdAt: new Date().toISOString(),
  }
}

export function useLocalProjects() {
  const [projects, setProjects] = useState<Project[]>(() =>
    loadFromStorage<Project[]>(STORAGE_KEY, []),
  )

  useEffect(() => {
    saveToStorage(STORAGE_KEY, projects)
  }, [projects])

  const addProject = useCallback((input: ProjectCreate) => {
    const project = createEmptyProject(input.name, input.craftType)
    setProjects((current) => [project, ...current])
    return project
  }, [])

  const updateProject = useCallback((projectId: string, name: string) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId ? { ...project, name } : project,
      ),
    )
  }, [])

  const deleteProject = useCallback((projectId: string) => {
    setProjects((current) => current.filter((project) => project.id !== projectId))
  }, [])

  const addCounter = useCallback((projectId: string, input: CounterCreate) => {
    const counter: Counter = {
      id: createId(),
      label: input.label,
      value: 0,
      type: input.type,
    }
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? { ...project, counters: [...project.counters, counter] }
          : project,
      ),
    )
    return counter
  }, [])

  const updateCounter = useCallback((projectId: string, counterId: string, value: number) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              counters: project.counters.map((counter) =>
                counter.id === counterId ? { ...counter, value } : counter,
              ),
            }
          : project,
      ),
    )
  }, [])

  const deleteCounter = useCallback((projectId: string, counterId: string) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              counters: project.counters.filter((counter) => counter.id !== counterId),
            }
          : project,
      ),
    )
  }, [])

  const addPatternItem = useCallback((projectId: string, input: PatternItemCreate) => {
    const item: PatternItem = {
      id: createId(),
      rowNumber: input.rowNumber,
      instruction: input.instruction,
      completed: false,
      notes: '',
      stitchCount: input.stitchCount,
    }
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? { ...project, patternItems: [...project.patternItems, item] }
          : project,
      ),
    )
    return item
  }, [])

  const updatePatternItem = useCallback(
    (projectId: string, itemId: string, input: PatternItemUpdate) => {
      setProjects((current) =>
        current.map((project) =>
          project.id === projectId
            ? {
                ...project,
                patternItems: project.patternItems.map((item) =>
                  item.id === itemId ? { ...item, ...input } : item,
                ),
              }
            : project,
        ),
      )
    },
    [],
  )

  const deletePatternItem = useCallback((projectId: string, itemId: string) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              patternItems: project.patternItems.filter((item) => item.id !== itemId),
            }
          : project,
      ),
    )
  }, [])

  const replacePatternItems = useCallback((projectId: string, items: PatternItem[]) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId ? { ...project, patternItems: items } : project,
      ),
    )
  }, [])

  const reorderPatternItem = useCallback(
    (projectId: string, itemId: string, direction: ReorderDirection) => {
      setProjects((current) =>
        current.map((project) =>
          project.id === projectId
            ? {
                ...project,
                patternItems: reorderPatternItems(project.patternItems, itemId, direction),
              }
            : project,
        ),
      )
    },
    [],
  )

  const clearProjects = useCallback(() => {
    setProjects([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const importProjects = useCallback((nextProjects: Project[]) => {
    setProjects(nextProjects)
  }, [])

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addCounter,
    updateCounter,
    deleteCounter,
    addPatternItem,
    updatePatternItem,
    deletePatternItem,
    replacePatternItems,
    reorderPatternItem,
    clearProjects,
    importProjects,
  }
}
