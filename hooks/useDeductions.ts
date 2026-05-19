'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import { uid } from '@/lib/id'
import type { Deduction } from '@/lib/types'

export function useDeductions() {
  const [records, setRecords] = useState<Deduction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) { setLoading(false); return }
    const timer = setTimeout(() => setLoading(false), 3000)
    try {
      db.deductions.orderBy('createdAt').reverse().toArray().then(data => {
        clearTimeout(timer)
        setRecords(data)
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

  const totalUnredeemed = records.filter(r => !r.redeemed).reduce((sum, r) => sum + r.points, 0)
  const redeemableBatches = Math.floor(totalUnredeemed / 10)
  const progress = totalUnredeemed % 10

  const addDeduction = useCallback(async (reason: string, points: number) => {
    const record: Deduction = {
      id: uid(),
      reason,
      points,
      date: new Date().toISOString().split('T')[0],
      redeemed: false,
      createdAt: new Date().toISOString(),
    }
    if (db) {
      try { await db.deductions.add(record) } catch {}
    }
    setRecords(prev => [record, ...prev])
    return record
  }, [])

  const markRedeemed = useCallback(async () => {
    const unredeemed = [...records].filter(r => !r.redeemed)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    let remaining = 10
    const toMark: string[] = []
    for (const r of unredeemed) {
      if (remaining <= 0) break
      toMark.push(r.id)
      remaining -= r.points
    }
    const batchId = uid()
    if (db && toMark.length > 0) {
      try {
        await db.deductions.where('id').anyOf(toMark).modify({
          redeemed: true,
          redeemedBatchId: batchId,
        })
      } catch {}
    }
    setRecords(prev => prev.map(r =>
      toMark.includes(r.id) ? { ...r, redeemed: true, redeemedBatchId: batchId } : r
    ))
    return batchId
  }, [records])

  const deleteRecord = useCallback(async (id: string) => {
    if (db) {
      try { await db.deductions.delete(id) } catch {}
    }
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  return {
    records, loading,
    totalUnredeemed, redeemableBatches, progress,
    addDeduction, markRedeemed, deleteRecord,
  }
}
