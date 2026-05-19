'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import { uid } from '@/lib/id'
import type { JumpRopeDay } from '@/lib/types'

export function useJumpRope() {
  const [days, setDays] = useState<JumpRopeDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const timer = setTimeout(() => setLoading(false), 3000)
    try {
      db.jumpRopeDays.orderBy('date').reverse().toArray().then(data => {
        clearTimeout(timer)
        setDays(data)
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

  const todayStr = new Date().toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-')

  const todayChecked = days.some(d => d.date === todayStr)

  const activeDays = days.filter(d => d.status === 'active')
  const progress = activeDays.length % 10
  const canRedeem = activeDays.length >= 10

  const checkIn = useCallback(async () => {
    if (todayChecked) return null
    const day: JumpRopeDay = {
      id: uid(),
      date: todayStr,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    if (db) {
      try { await db.jumpRopeDays.add(day) } catch {}
    }
    setDays(prev => [day, ...prev])
    return day
  }, [todayChecked, todayStr])

  const markBatchRedeemed = useCallback(async (batchId: string, earnedCardId: string) => {
    const activeItems = days.filter(d => d.status === 'active').slice(0, 10)
    const ids = activeItems.map(d => d.id)
    if (db && ids.length > 0) {
      try {
        await db.jumpRopeDays.where('id').anyOf(ids).modify({
          status: 'redeemed' as const,
          redeemedBatchId: batchId,
        })
      } catch {}
    }
    setDays(prev => prev.map(d =>
      ids.includes(d.id) ? { ...d, status: 'redeemed' as const, redeemedBatchId: batchId } : d
    ))
  }, [days])

  const deleteDay = useCallback(async (id: string) => {
    if (db) {
      try { await db.jumpRopeDays.delete(id) } catch {}
    }
    setDays(prev => prev.filter(d => d.id !== id))
  }, [])

  return {
    days, activeDays, loading,
    todayChecked, progress, canRedeem,
    checkIn, markBatchRedeemed, deleteDay,
  }
}
