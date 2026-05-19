'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import { uid } from '@/lib/id'
import type { ReadingChallenge } from '@/lib/types'

export function useReading() {
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const timer = setTimeout(() => setLoading(false), 3000)
    try {
      db.readingChallenges.orderBy('completedDate').reverse().toArray().then(data => {
        clearTimeout(timer)
        setChallenges(data)
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

  const addChallenge = useCallback(async (bookName: string, completedDate: string) => {
    const challenge: ReadingChallenge = {
      id: uid(),
      bookName,
      completedDate,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    if (db) {
      try { await db.readingChallenges.add(challenge) } catch {}
    }
    setChallenges(prev => [challenge, ...prev])
    return challenge
  }, [])

  const markRedeemed = useCallback(async (id: string, earnedCardId: string) => {
    const now = new Date().toISOString()
    if (db) {
      try { await db.readingChallenges.update(id, { status: 'redeemed', redeemedAt: now, earnedCardId }) } catch {}
    }
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, status: 'redeemed', redeemedAt: now, earnedCardId } : c))
  }, [])

  const deleteChallenge = useCallback(async (id: string) => {
    if (db) {
      try { await db.readingChallenges.delete(id) } catch {}
    }
    setChallenges(prev => prev.filter(c => c.id !== id))
  }, [])

  const active = challenges.filter(c => c.status === 'active')

  return { challenges, active, loading, addChallenge, markRedeemed, deleteChallenge }
}
