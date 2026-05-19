'use client'

import { useState } from 'react'
import { useRewards } from '@/hooks/useRewards'
import RewardAnimation from '@/components/RewardAnimation'
import type { RewardCardType } from '@/lib/types'
import { Gamepad2, Pizza, Plus, Trash2, Sparkles, X } from 'lucide-react'

const TYPE_ICONS: Record<RewardCardType, typeof Gamepad2> = { game: Gamepad2, pizzahut: Pizza }
const TYPE_COLORS: Record<RewardCardType, string> = { game: 'purple', pizzahut: 'red' }
const TYPE_LABELS: Record<RewardCardType, string> = { game: '游戏卡', pizzahut: '美食卡' }

export default function CardsPage() {
  const { rewards, active, used, loading, addReward, markUsed, deleteReward } = useRewards()
  const [showAdd, setShowAdd] = useState(false)
  const [newType, setNewType] = useState<RewardCardType>('game')
  const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | RewardCardType>('all')
  const [detailCard, setDetailCard] = useState<(typeof rewards)[number] | null>(null)
  const [animCardId, setAnimCardId] = useState<string | null>(null)

  const handleAdd = async () => {
    await addReward(newType)
    setShowAdd(false)
  }

  const handleUse = async () => {
    if (!detailCard) return
    const id = detailCard.id
    setDetailCard(null)
    setAnimCardId(id)
  }

  const handleAnimClose = () => {
    if (animCardId) {
      markUsed(animCardId)
      setAnimCardId(null)
    }
  }

  const filtered = rewards.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (filter === 'active' && r.status !== 'active') return false
    if (filter === 'used' && r.status !== 'used') return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">奖励卡</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-purple-500 to-amber-500 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:self-auto"
        >
          <Plus className="h-5 w-5" /> 添加卡片
        </button>
      </div>

      {/* stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">可用</p>
          <p className="text-2xl font-bold text-purple-600">{active.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">已用</p>
          <p className="text-2xl font-bold text-gray-400">{used.length}</p>
        </div>
      </div>

      {/* filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(['all', 'active', 'used'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            {{ all: '全部', active: '可用', used: '已使用' }[f]}
          </button>
        ))}
        <div className="w-px bg-gray-200 mx-1" />
        {(['all', 'game', 'pizzahut'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === t ? (t === 'game' ? 'bg-purple-600 text-white' : 'bg-red-500 text-white') : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            {{ all: '全部', game: '游戏卡', pizzahut: '美食卡' }[t]}
          </button>
        ))}
      </div>

      {/* card list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-20 text-gray-400 shadow-sm">
          <Sparkles className="h-12 w-12" />
          <p className="text-lg">还没有卡片，添加一张吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(card => {
            const Icon = TYPE_ICONS[card.type]
            const color = TYPE_COLORS[card.type]
            return (
              <div
                key={card.id}
                onClick={() => setDetailCard(card)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 shadow-sm transition-all hover:shadow-md ${
                  card.status === 'used'
                    ? 'border-gray-200 opacity-60'
                    : card.type === 'game'
                      ? 'border-purple-200'
                      : 'border-red-200'
                }`}
              >
                {/* background image */}
                {card.imageUrl && (
                  <div className="absolute inset-0">
                    <img src={card.imageUrl} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </div>
                )}

                {/* content overlay */}
                <div className={`relative flex h-52 flex-col justify-end p-4 ${!card.imageUrl ? (card.type === 'game' ? 'bg-purple-50' : 'bg-red-50') : 'text-white'}`}>
                  {/* top-left icon + type */}
                  {!card.imageUrl && (
                    <div className="mb-2 flex items-center gap-2">
                      <div className={`rounded-lg p-2 ${
                        card.type === 'game' ? 'bg-purple-100' : 'bg-red-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${card.type === 'game' ? 'text-purple-600' : 'text-red-500'}`} />
                      </div>
                      <span className={`text-sm font-medium ${card.type === 'game' ? 'text-purple-600' : 'text-red-500'}`}>{TYPE_LABELS[card.type]}</span>
                    </div>
                  )}

                  <h3 className={`mb-2 text-lg font-bold ${card.imageUrl ? 'drop-shadow-lg' : ''}`}>{TYPE_LABELS[card.type]}</h3>

                  <div className={`mb-3 flex flex-wrap gap-1.5 text-xs ${card.imageUrl ? 'text-white/80' : 'text-gray-400'}`}>
                    <span className={`rounded-full px-2 py-0.5 ${
                      card.imageUrl
                        ? 'bg-white/20 backdrop-blur-sm'
                        : card.source === 'reading' ? 'bg-green-100 text-green-600'
                        : card.source === 'jump_rope' ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {{ manual: '手动', reading: '阅读', jump_rope: '跳绳' }[card.source]}
                    </span>
                    {card.status === 'used' && (
                      <span className={`rounded-full px-2 py-0.5 ${card.imageUrl ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'} text-gray-500`}>
                        已用
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {card.status === 'active' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDetailCard(card) }}
                        className={`flex-1 rounded-xl py-2 text-sm font-semibold shadow transition-all active:scale-95 ${
                          card.imageUrl
                            ? 'bg-white/90 text-gray-800 hover:bg-white'
                            : card.type === 'game'
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        使用
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteReward(card.id) }}
                      className={`rounded-xl p-2 transition-colors ${
                        card.imageUrl
                          ? 'bg-white/20 text-white/70 hover:bg-white/30 backdrop-blur-sm'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {card.status === 'used' && card.usedAt && (
                    <p className={`mt-2 text-xs ${card.imageUrl ? 'text-white/60' : 'text-gray-400'}`}>
                      使用于 {new Date(card.usedAt).toLocaleDateString('zh-CN')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* add dialog */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-bold text-gray-800">添加奖励卡</h2>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setNewType('game')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 ${
                  newType === 'game' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <Gamepad2 className={`h-8 w-8 ${newType === 'game' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${newType === 'game' ? 'text-purple-700' : 'text-gray-500'}`}>游戏卡</span>
              </button>
              <button
                onClick={() => setNewType('pizzahut')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 ${
                  newType === 'pizzahut' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              >
                <Pizza className={`h-8 w-8 ${newType === 'pizzahut' ? 'text-red-500' : 'text-gray-400'}`} />
                <span className={`font-semibold ${newType === 'pizzahut' ? 'text-red-700' : 'text-gray-500'}`}>美食卡</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 font-medium text-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-amber-500 py-2.5 font-semibold text-white shadow-lg hover:shadow-xl active:scale-95"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* card detail modal */}
      {detailCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDetailCard(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* image */}
            {detailCard.imageUrl ? (
              <div className="relative h-64">
                <img src={detailCard.imageUrl} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setDetailCard(null)}
                  className="absolute right-3 top-3 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm hover:bg-black/50"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-lg font-bold drop-shadow-lg">{TYPE_LABELS[detailCard.type]}</p>
                  <p className="text-sm text-white/80 drop-shadow">
                    {{ manual: '手动', reading: '阅读', jump_rope: '跳绳' }[detailCard.source]}
                  </p>
                </div>
              </div>
            ) : (
              <div className={`flex h-48 flex-col items-center justify-center gap-3 ${
                detailCard.type === 'game' ? 'bg-purple-100' : 'bg-red-100'
              }`}>
                <div className={`rounded-2xl p-4 ${detailCard.type === 'game' ? 'bg-purple-200' : 'bg-red-200'}`}>
                  {detailCard.type === 'game'
                    ? <Gamepad2 className="h-12 w-12 text-purple-600" />
                    : <Pizza className="h-12 w-12 text-red-500" />
                  }
                </div>
                <p className="text-lg font-bold text-gray-800">{TYPE_LABELS[detailCard.type]}</p>
                <button
                  onClick={() => setDetailCard(null)}
                  className="absolute right-3 top-3 rounded-full bg-black/20 p-1.5 text-gray-500 hover:bg-black/30"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* info */}
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">来源</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                  {{ manual: '手动添加', reading: '阅读挑战', jump_rope: '跳绳挑战' }[detailCard.source]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">状态</span>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                  detailCard.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {detailCard.status === 'active' ? '可用' : '已使用'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">创建时间</span>
                <span className="text-sm text-gray-600">
                  {new Date(detailCard.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              {detailCard.usedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">使用时间</span>
                  <span className="text-sm text-gray-600">
                    {new Date(detailCard.usedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}

              {detailCard.status === 'active' && (
                <button
                  onClick={handleUse}
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-purple-500 to-amber-500 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
                >
                  使用此卡片
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <RewardAnimation
        open={!!animCardId}
        onClose={handleAnimClose}
      />
    </div>
  )
}
