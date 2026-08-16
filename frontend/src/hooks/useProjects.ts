import { useCallback, useEffect, useState } from 'react'
import type { CounterCreate, PatternItem, PatternItemCreate, PatternItemUpdate, Project, ProjectCreate } from '../types'
import { reorderPatternItems, type ReorderDirection } from '../lib/reorderPatternItems'
import * as api from '../lib/api'
import { useAuthContext } from '../context/AuthContext'
import { useLocalProjects } from './useLocalProjects'
import { STORAGE_KEY } from '../lib/storage'

const MIGRATION_KEY = 'stitch-counter-migrated'

export function useProjects() {
  const { user, session } = useAuthContext()
  const local = useLocalProjects()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isCloud = Boolean(user && session?.access_token)

  const refreshCloudProjects = useCallback(async () => {
    const data = await api.fetchProjects()
    setProjects(data)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        if (isCloud) {
          const migrated = localStorage.getItem(MIGRATION_KEY)
          const localProjects = local.projects

          if (!migrated && localProjects.length > 0) {
            const migratedProjects = await api.migrateLocalProjects(localProjects)
            if (!cancelled) {
              setProjects(migratedProjects)
              local.clearProjects()
              localStorage.setItem(MIGRATION_KEY, 'true')
            }
          } else {
            const data = await api.fetchProjects()
            if (!cancelled) setProjects(data)
          }
        } else {
          if (!cancelled) setProjects(local.projects)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load projects')
          setProjects(local.projects)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isCloud, user?.id])

  useEffect(() => {
    if (!isCloud) {
      setProjects(local.projects)
    }
  }, [isCloud, local.projects])

  const addProject = useCallback(
    async (input: ProjectCreate) => {
      if (isCloud) {
        const project = await api.createProjectApi(input)
        setProjects((current) => [project, ...current])
        return project
      }
      return local.addProject(input)
    },
    [isCloud, local],
  )

  const updateProject = useCallback(
    async (projectId: string, name: string) => {
      if (isCloud) {
        const project = await api.updateProjectApi(projectId, name)
        setProjects((current) =>
          current.map((item) => (item.id === projectId ? project : item)),
        )
        return
      }
      local.updateProject(projectId, name)
    },
    [isCloud, local],
  )

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (isCloud) {
        await api.deleteProjectApi(projectId)
        setProjects((current) => current.filter((project) => project.id !== projectId))
        return
      }
      local.deleteProject(projectId)
    },
    [isCloud, local],
  )

  const addCounter = useCallback(
    async (projectId: string, input: CounterCreate) => {
      if (isCloud) {
        const counter = await api.createCounterApi(projectId, input)
        setProjects((current) =>
          current.map((project) =>
            project.id === projectId
              ? { ...project, counters: [...project.counters, counter] }
              : project,
          ),
        )
        return counter
      }
      return local.addCounter(projectId, input)
    },
    [isCloud, local],
  )

  const updateCounter = useCallback(
    async (projectId: string, counterId: string, value: number) => {
      if (isCloud) {
        const counter = await api.updateCounterApi(projectId, counterId, value)
        setProjects((current) =>
          current.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  counters: project.counters.map((item) =>
                    item.id === counterId ? counter : item,
                  ),
                }
              : project,
          ),
        )
        return
      }
      local.updateCounter(projectId, counterId, value)
    },
    [isCloud, local],
  )

  const deleteCounter = useCallback(
    async (projectId: string, counterId: string) => {
      if (isCloud) {
        await api.deleteCounterApi(projectId, counterId)
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
        return
      }
      local.deleteCounter(projectId, counterId)
    },
    [isCloud, local],
  )

  const addPatternItem = useCallback(
    async (projectId: string, input: PatternItemCreate) => {
      if (isCloud) {
        const item = await api.createPatternItemApi(projectId, input)
        setProjects((current) =>
          current.map((project) =>
            project.id === projectId
              ? { ...project, patternItems: [...project.patternItems, item] }
              : project,
          ),
        )
        return item
      }
      return local.addPatternItem(projectId, input)
    },
    [isCloud, local],
  )

  const updatePatternItem = useCallback(
    async (projectId: string, itemId: string, input: PatternItemUpdate) => {
      if (isCloud) {
        const item = await api.updatePatternItemApi(projectId, itemId, input)
        setProjects((current) =>
          current.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  patternItems: project.patternItems.map((existing) =>
                    existing.id === itemId ? item : existing,
                  ),
                }
              : project,
          ),
        )
        return item
      }
      local.updatePatternItem(projectId, itemId, input)
    },
    [isCloud, local],
  )

  const deletePatternItem = useCallback(
    async (projectId: string, itemId: string) => {
      if (isCloud) {
        await api.deletePatternItemApi(projectId, itemId)
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
        return
      }
      local.deletePatternItem(projectId, itemId)
    },
    [isCloud, local],
  )

  const replacePatternItems = useCallback(
    async (projectId: string, items: PatternItem[]) => {
      if (isCloud) {
        const saved = await api.saveParsedPattern(projectId, items)
        setProjects((current) =>
          current.map((project) =>
            project.id === projectId ? { ...project, patternItems: saved } : project,
          ),
        )
        return saved
      }
      local.replacePatternItems(projectId, items)
      return items
    },
    [isCloud, local],
  )

  const reorderPatternItem = useCallback(
    async (projectId: string, itemId: string, direction: ReorderDirection) => {
      const currentItems = (isCloud ? projects : local.projects).find(
        (project) => project.id === projectId,
      )?.patternItems

      if (!currentItems) return

      const reordered = reorderPatternItems(currentItems, itemId, direction)
      const changed = reordered.filter((item) => {
        const before = currentItems.find((existing) => existing.id === item.id)
        return before && before.rowNumber !== item.rowNumber
      })

      if (changed.length === 0) return

      if (!isCloud) {
        local.reorderPatternItem(projectId, itemId, direction)
        return
      }

      const updated = await Promise.all(
        changed.map((item) =>
          api.updatePatternItemApi(projectId, item.id, { rowNumber: item.rowNumber }),
        ),
      )

      setProjects((current) =>
        current.map((project) =>
          project.id === projectId
            ? {
                ...project,
                patternItems: project.patternItems.map((item) => {
                  const next = updated.find((saved) => saved.id === item.id)
                  return next ?? item
                }),
              }
            : project,
        ),
      )
    },
    [isCloud, local, projects],
  )

  const parsePatternFile = useCallback(
    async (projectId: string, file: File) => {
      if (!isCloud) {
        throw new Error('Pattern parsing requires cloud sync. Please sign in first.')
      }
      return api.parsePatternFile(projectId, file)
    },
    [isCloud],
  )

  return {
    projects: isCloud ? projects : local.projects,
    loading,
    error,
    isCloud,
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
    parsePatternFile,
    refreshCloudProjects,
    storageKey: STORAGE_KEY,
  }
}

export type ProjectsApi = ReturnType<typeof useProjects>
