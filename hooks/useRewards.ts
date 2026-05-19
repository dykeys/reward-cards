'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import { uid } from '@/lib/id'
import type { RewardCard, RewardCardType, CardSource } from '@/lib/types'
import { DEFAULT_IMAGES } from '@/lib/defaultImages'

export function useRewards() {
  const [rewards, setRewards] = useState<RewardCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const timer = setTimeout(() => setLoading(false), 3000)
    try {
      db.rewards.orderBy('createdAt').reverse().toArray().then(data => {
        clearTimeout(timer)
        setRewards(data)
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

  const TYPE_NAMES: Record<RewardCardType, string> = { game: '游戏卡', pizzahut: '美食卡' }

  const addReward = useCallback(async (
    type: RewardCardType,
    name?: string,
    source: CardSource = 'manual',
    sourceRef?: string,
  ) => {
    const pool = type === 'game' ? DEFAULT_IMAGES.game : DEFAULT_IMAGES.food
    const img = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : undefined
    const card: RewardCard = {
      id: uid(),
      type,
      name: name || TYPE_NAMES[type],
      imageUrl: img,
      source,
      sourceRef,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    if (db) {
      try { await db.rewards.add(card) } catch {}
    }
    setRewards(prev => [card, ...prev])
    return card
  }, [])

  const markUsed = useCallback(async (id: string) => {
    const now = new Date().toISOString()
    if (db) {
      try { await db.rewards.update(id, { status: 'used', usedAt: now }) } catch {}
    }
    setRewards(prev => prev.map(r => r.id === id ? { ...r, status: 'used', usedAt: now } : r))
  }, [])

  const deleteReward = useCallback(async (id: string) => {
    if (db) {
      try { await db.rewards.delete(id) } catch {}
    }
    setRewards(prev => prev.filter(r => r.id !== id))
  }, [])

  const active = rewards.filter(r => r.status === 'active')
  const used = rewards.filter(r => r.status === 'used')

  return { rewards, active, used, loading, addReward, markUsed, deleteReward }
}
