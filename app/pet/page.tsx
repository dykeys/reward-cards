'use client'

import { useState, useMemo } from 'react'
import { usePet } from '@/hooks/usePet'
import { db } from '@/lib/db'
import { Heart, Bone, Plus, X, Sparkles, ArrowUpCircle, Hand, Pizza, Trash2 } from 'lucide-react'

const FACES: Record<string, { emoji: string; bg: string; status: string; color: string }> = {
  happy: { emoji: '😄', bg: 'from-yellow-300 to-amber-400', status: '开心', color: 'text-yellow-600' },
  normal: { emoji: '😊', bg: 'from-yellow-200 to-amber-300', status: '一般', color: 'text-amber-600' },
  hungry: { emoji: '😢', bg: 'from-gray-200 to-slate-300', status: '饿了', color: 'text-gray-500' },
}

export default function PetPage() {
  const { points, available, total, loading, lastFed, addPoint, feed, deletePoint } = usePet()
  const [showAdd, setShowAdd] = useState(false)
  const [reason, setReason] = useState('')
  const [feedAnim, setFeedAnim] = useState(false)
  const [feedMsg, setFeedMsg] = useState<string | null>(null)

  const hoursSinceFed = useMemo(() => {
    if (!lastFed?.spentAt) return 99
    return (Date.now() - new Date(lastFed.spentAt).getTime()) / 3600000
  }, [lastFed])

  const state = hoursSinceFed < 2 ? 'happy' : hoursSinceFed < 6 ? 'normal' : 'hungry'
  const face = FACES[state]

  const handleFeed = async () => {
    if (available < 1) return
    const result = await feed()
    if (result) {
      setFeedAnim(true)
      setFeedMsg(`🐾 ${result.source === 'jump_rope' ? '跳绳' : result.reason}换来的美食！`)
      setTimeout(() => { setFeedAnim(false); setFeedMsg(null) }, 2000)
    }
  }

  const handleAdd = async () => {
    if (!reason.trim() || !db) return
    await addPoint('behavior', reason.trim())
    setReason('')
    setShowAdd(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-300 border-t-pink-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🐾 宠物乐园</h1>
        <p className="text-sm text-gray-500">跳绳和做好事赚积分，喂饱小宠物</p>
      </div>

      {/* pet display */}
      <div className={`mb-6 overflow-hidden rounded-3xl bg-gradient-to-br ${face.bg} p-8 text-center shadow-lg`}>
        <div className={`relative inline-block text-8xl transition-all duration-500 ${feedAnim ? 'scale-125' : 'scale-100'}`}>
          {face.emoji}
          {feedAnim && (
            <span className="absolute -right-4 -top-4 animate-bounce text-3xl">🍕</span>
          )}
        </div>
        <p className="mt-3 text-2xl font-bold text-white drop-shadow-md">
          宠物 {face.status}
        </p>
        {feedMsg && (
          <p className="mt-2 animate-pulse text-sm font-medium text-white/80">{feedMsg}</p>
        )}
      </div>

      {/* stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <Heart className="mx-auto mb-1 h-5 w-5 text-pink-500" />
          <p className="text-xl font-bold text-gray-800">{available}</p>
          <p className="text-xs text-gray-500">可用积分</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <Bone className="mx-auto mb-1 h-5 w-5 text-amber-500" />
          <p className="text-xl font-bold text-gray-800">{points.filter(p => p.spent).length}</p>
          <p className="text-xs text-gray-500">已喂食</p>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <Sparkles className="mx-auto mb-1 h-5 w-5 text-purple-500" />
          <p className="text-xl font-bold text-gray-800">{total}</p>
          <p className="text-xs text-gray-500">总积分</p>
        </div>
      </div>

      {/* feed + add actions */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={handleFeed}
          disabled={available < 1}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-lg transition-all active:scale-95 ${
            available < 1
              ? 'cursor-not-allowed bg-gray-300'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-xl'
          }`}
        >
          <Pizza className="h-5 w-5" /> 喂食 (1 积分)
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
        >
          <Plus className="h-5 w-5" /> 加分
        </button>
      </div>

      {/* point history */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">积分记录</h2>
        {points.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-gray-400 shadow-sm">
            <Sparkles className="h-12 w-12" />
            <p>还没有积分</p>
          </div>
        ) : (
          <div className="space-y-2">
            {points.slice(0, 50).map(p => (
              <div key={p.id} className={`flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ${p.spent ? 'opacity-50' : ''}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-white ${
                  p.source === 'jump_rope' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {p.source === 'jump_rope' ? <ArrowUpCircle className="h-5 w-5" /> : <Hand className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-700">
                    {p.source === 'jump_rope' ? '跳绳打卡' : p.reason}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.date} {p.spent ? '· 已用于喂食' : ''}
                  </p>
                </div>
                <button
                  onClick={() => deletePoint(p.id)}
                  className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* add point dialog */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">加分</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-3 text-sm text-gray-500">记录一个值得鼓励的行为，加 1 积分</p>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="如：主动做家务、按时完成作业..."
              className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-green-400"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 font-medium text-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!reason.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 py-2.5 font-semibold text-white disabled:opacity-50"
              >
                加分
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
