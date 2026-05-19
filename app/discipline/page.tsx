'use client'

import { useState } from 'react'
import { useDeductions } from '@/hooks/useDeductions'
import { useRewards } from '@/hooks/useRewards'
import RewardAnimation from '@/components/RewardAnimation'
import { AlertTriangle, Plus, Trash2, X, Gamepad2, Pizza, Sparkles } from 'lucide-react'

export default function DisciplinePage() {
  const { records, loading, totalUnredeemed, redeemableBatches, addDeduction, markRedeemed, deleteRecord } = useDeductions()
  const { active: activeCards, markUsed } = useRewards()

  const [showAdd, setShowAdd] = useState(false)
  const [reason, setReason] = useState('')
  const [points, setPoints] = useState(5)
  const [showEliminate, setShowEliminate] = useState(false)
  const [animOpen, setAnimOpen] = useState(false)

  const handleAdd = async () => {
    if (!reason.trim()) return
    await addDeduction(reason.trim(), points)
    setReason('')
    setPoints(5)
    setShowAdd(false)
  }

  const handleEliminate = async (cardId: string) => {
    await markUsed(cardId)
    await markRedeemed()
    setShowEliminate(false)
    setAnimOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-300 border-t-red-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">行为管理</h1>
          <p className="text-sm text-gray-500">记录不良行为，积累扣分消除奖励卡</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:self-auto"
        >
          <Plus className="h-5 w-5" /> 记录扣分
        </button>
      </div>

      {/* progress */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">累计扣分</span>
          <span className="text-3xl font-bold text-red-500">{totalUnredeemed}</span>
        </div>
        <div className="mb-1 h-3 w-full overflow-hidden rounded-full bg-red-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-500"
            style={{ width: `${Math.min((totalUnredeemed % 10) / 10 * 100, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">
          {redeemableBatches > 0
            ? `可消除 ${redeemableBatches} 张奖励卡`
            : `${10 - (totalUnredeemed % 10)} 分可消除一张卡`}
        </p>

        {redeemableBatches > 0 && activeCards.length > 0 && (
          <button
            onClick={() => setShowEliminate(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
          >
            <AlertTriangle className="h-5 w-5" /> 消除一张奖励卡
          </button>
        )}

        {redeemableBatches > 0 && activeCards.length === 0 && (
          <p className="mt-3 text-sm text-orange-600">没有可消除的奖励卡</p>
        )}
      </div>

      {/* records */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">扣分记录</h2>
        {records.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-gray-400 shadow-sm">
            <Sparkles className="h-12 w-12" />
            <p>还没有扣分记录</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <div key={r.id} className={`flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ${r.redeemed ? 'opacity-50' : ''}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white ${r.redeemed ? 'bg-gray-300' : 'bg-red-500'}`}>
                  {r.points}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{r.reason}</p>
                  <p className="text-xs text-gray-400">{r.date}{r.redeemed ? ' · 已消除' : ''}</p>
                </div>
                <button
                  onClick={() => deleteRecord(r.id)}
                  className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">记录扣分</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-500">原因</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="如：不听话、打架..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-red-400"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-500">扣分</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 5, 8, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setPoints(n)}
                    className={`rounded-xl border-2 py-2 font-bold transition-all ${
                      points === n
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:border-red-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
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
                disabled={!reason.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-2.5 font-semibold text-white disabled:opacity-50"
              >
                记录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* eliminate dialog */}
      {showEliminate && activeCards.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowEliminate(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">选择要消除的卡片</h2>
              <button onClick={() => setShowEliminate(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 flex max-h-60 flex-col gap-2 overflow-y-auto">
              {activeCards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleEliminate(card.id)}
                  className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                    card.type === 'game' ? 'border-purple-200 hover:border-purple-400' : 'border-red-200 hover:border-red-400'
                  }`}
                >
                  {card.imageUrl && (
                    <div className="absolute inset-0">
                      <img src={card.imageUrl} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                    </div>
                  )}
                  <div className={`relative z-10 rounded-lg p-2 ${card.type === 'game' ? 'bg-purple-200/80 backdrop-blur-sm' : 'bg-red-200/80 backdrop-blur-sm'}`}>
                    {card.type === 'game'
                      ? <Gamepad2 className="h-5 w-5 text-purple-700" />
                      : <Pizza className="h-5 w-5 text-red-600" />
                    }
                  </div>
                  <div className="relative z-10">
                    <p className={`font-semibold ${card.imageUrl ? 'text-white drop-shadow' : 'text-gray-800'}`}>{card.type === 'game' ? '游戏卡' : '美食卡'}</p>
                    <p className={`text-xs ${card.imageUrl ? 'text-white/70' : 'text-gray-400'}`}>
                      {{ manual: '手动', reading: '阅读', jump_rope: '跳绳' }[card.source]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEliminate(false)}
              className="w-full rounded-xl border border-gray-300 py-2.5 font-medium text-gray-600"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <RewardAnimation
        open={animOpen}
        onClose={() => setAnimOpen(false)}
        mode="eliminate"
      />
    </div>
  )
}
