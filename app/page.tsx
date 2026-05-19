'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import type { RewardCard, ReadingChallenge, JumpRopeDay, PetPoint } from '@/lib/types'
import { Gift, BookOpen, ArrowUpCircle, Sparkles, Gamepad2, Pizza, ChevronRight, AlertTriangle, Heart } from 'lucide-react'

export default function Dashboard() {
  const [rewards, setRewards] = useState<RewardCard[]>([])
  const [readingActive, setReadingActive] = useState(0)
  const [ropeDays, setRopeDays] = useState<JumpRopeDay[]>([])
  const [petAvailable, setPetAvailable] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(false)

  useEffect(() => {
    if (!db) { setDbError(true); setLoading(false); return }
    const timer = setTimeout(() => { setDbError(true); setLoading(false) }, 3000)
    try {
      Promise.all([
        db.rewards.toArray(),
        db.readingChallenges.where('status').equals('active').toArray(),
        db.jumpRopeDays.where('status').equals('active').toArray(),
        db.petPoints.toArray(),
      ]).then(([r, rd, jr, pp]) => {
        clearTimeout(timer)
        setRewards(r)
        setReadingActive(rd.length)
        setRopeDays(jr)
        setPetAvailable(pp.filter((p: PetPoint) => !p.spent).length)
        setLoading(false)
      }).catch(() => {
        clearTimeout(timer)
        setDbError(true)
        setLoading(false)
      })
    } catch {
      clearTimeout(timer)
      setDbError(true)
      setLoading(false)
    }
  }, [])

  const activeCards = rewards.filter(r => r.status === 'active')
  const ropeProgress = ropeDays.length % 10
  const canRedeemRope = ropeDays.length >= 10

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600" />
      </div>
    )
  }

  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm max-w-sm">
          <p className="text-lg text-gray-600">浏览器不支持本地存储</p>
          <p className="mt-2 text-sm text-gray-400">请使用 Chrome / Edge / 系统浏览器，部分轻量浏览器（如 Via）不支持 IndexedDB</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* welcome */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-amber-500 p-6 text-white shadow-lg md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">🌟 奖励卡片</h1>
      </div>

      {/* stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="/cards" className="group rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-purple-100 p-2">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{activeCards.length}</p>
          <p className="text-sm text-gray-500">可用奖励卡</p>
        </Link>

        <Link href="/cards" className="group rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-amber-100 p-2">
              <Gamepad2 className="h-5 w-5 text-amber-600" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{activeCards.filter(r => r.type === 'game').length}</p>
          <p className="text-sm text-gray-500">游戏卡</p>
        </Link>

        <Link href="/cards" className="group rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-red-100 p-2">
              <Pizza className="h-5 w-5 text-red-500" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{activeCards.filter(r => r.type === 'pizzahut').length}</p>
          <p className="text-sm text-gray-500">美食卡</p>
        </Link>

        <Link href="/pet" className="group rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-pink-100 p-2">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-pink-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{petAvailable}</p>
          <p className="text-sm text-gray-500">宠物积分</p>
        </Link>

        <Link href="/jump-rope" className="group rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-blue-100 p-2">
              <ArrowUpCircle className="h-5 w-5 text-blue-600" />
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{ropeProgress}/10</p>
          <p className="text-sm text-gray-500">跳绳进度</p>
        </Link>
      </div>

      {/* quick actions */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <Link
          href="/reading"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="rounded-xl bg-green-100 p-3">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">阅读挑战</p>
            <p className="text-sm text-gray-500">
              {readingActive > 0 ? `${readingActive} 本可兑换` : '添加阅读记录'}
            </p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 text-gray-300" />
        </Link>

        <Link
          href="/jump-rope"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="rounded-xl bg-blue-100 p-3">
            <ArrowUpCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">跳绳挑战</p>
            <p className="text-sm text-gray-500">
              {canRedeemRope ? '可兑换奖励卡！' : `${ropeProgress}/10 天`}
            </p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 text-gray-300" />
        </Link>

        <Link
          href="/pet"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="rounded-xl bg-pink-100 p-3">
            <Heart className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">宠物乐园</p>
            <p className="text-sm text-gray-500">{petAvailable} 积分可用</p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 text-gray-300" />
        </Link>

        <Link
          href="/generate"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="rounded-xl bg-amber-100 p-3">
            <Sparkles className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">AI 生图</p>
            <p className="text-sm text-gray-500">生成炫酷卡片图片</p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 text-gray-300" />
        </Link>

        <Link
          href="/discipline"
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="rounded-xl bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">行为管理</p>
            <p className="text-sm text-gray-500">扣分管理</p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 text-gray-300" />
        </Link>
      </div>

      {/* recent cards */}
      {activeCards.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">最近奖励卡</h2>
            <Link href="/cards" className="text-sm text-purple-600 hover:underline">查看全部</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {activeCards.slice(0, 8).map(card => (
              <div
                key={card.id}
                className={`group relative overflow-hidden rounded-xl border-2 ${
                  card.type === 'game' ? 'border-purple-200' : 'border-red-200'
                }`}
              >
                {card.imageUrl && (
                  <div className="absolute inset-0">
                    <img src={card.imageUrl} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <div className={`relative flex h-28 flex-col justify-end p-3 ${!card.imageUrl ? (card.type === 'game' ? 'bg-purple-50' : 'bg-red-50') : 'text-white'}`}>
                  {!card.imageUrl && (
                    <div className={`mb-1 inline-block rounded-lg p-1.5 ${
                      card.type === 'game' ? 'bg-purple-100' : 'bg-red-100'
                    }`}>
                      {card.type === 'game'
                        ? <Gamepad2 className="h-4 w-4 text-purple-600" />
                        : <Pizza className="h-4 w-4 text-red-500" />
                      }
                    </div>
                  )}
                  <p className={`text-sm font-semibold ${card.imageUrl ? 'drop-shadow' : ''}`}>
                    {card.type === 'game' ? '游戏卡' : '美食卡'}
                  </p>
                  <p className={`text-xs ${card.imageUrl ? 'text-white/70' : 'text-gray-400'}`}>
                    {{ manual: '手动', reading: '阅读', jump_rope: '跳绳' }[card.source]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
