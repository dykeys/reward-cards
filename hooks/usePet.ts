'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import { uid } from '@/lib/id'
import type { PetPoint } from '@/lib/types'

export function usePet() {
  const [points, setPoints] = useState<PetPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const timer = setTimeout(() => setLoading(false), 3000)
    try {
      db.petPoints.orderBy('createdAt').reverse().toArray().then(data => {
        clearTimeout(timer)
        setPoints(data)
        setLoading(false)
      }).catch(() => {
        clearTimeout(timer)
        setLoading(false)
      })
    } catch {
      clearTimeout(timer)
      setLoading(false)
    }
  }, [])

  const available = points.filter(p => !p.spent).length
  const total = points.length

  const addPoint = useCallback(async (source: 'jump_rope' | 'behavior', reason: string) => {
    const point: PetPoint = {
      id: uid(),
      source,
      reason,
      date: new Date().toISOString().split('T')[0],
      spent: false,
      createdAt: new Date().toISOString(),
    }
    if (db) {
      try { await db.petPoints.add(point) } catch {}
    }
    setPoints(prev => [point, ...prev])
    return point
  }, [])

  const feed = useCallback(async () => {
    const oldest = [...points].filter(p => !p.spent)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
    if (!oldest) return null
    const now = new Date().toISOString()
    if (db) {
      try { await db.petPoints.update(oldest.id, { spent: true, spentAt: now }) } catch {}
    }
    setPoints(prev => prev.map(p => p.id === oldest.id ? { ...p, spent: true, spentAt: now } : p))
    return oldest
  }, [points])

  const deletePoint = useCallback(async (id: string) => {
    if (db) {
      try { await db.petPoints.delete(id) } catch {}
    }
    setPoints(prev => prev.filter(p => p.id !== id))
  }, [])

  const lastFed = points.filter(p => p.spent).sort(
    (a, b) => new Date(b.spentAt || 0).getTime() - new Date(a.spentAt || 0).getTime()
  )[0]

  return {
    points, available, total, loading,
    lastFed,
    addPoint, feed, deletePoint,
  }
}
