'use client'

import { useState } from 'react'
import { useReading } from '@/hooks/useReading'
import { useRewards } from '@/hooks/useRewards'
import CardSelector from '@/components/CardSelector'
import RewardAnimation from '@/components/RewardAnimation'
import { BookOpen, CheckCircle, Bookmark, Trash2, Sparkles } from 'lucide-react'

export default function ReadingPage() {
  const { challenges, active, loading, addChallenge, markRedeemed, deleteChallenge } = useReading()
  const { addReward } = useRewards()

  const [showAdd, setShowAdd] = useState(false)
  const [bookName, setBookName] = useState('')
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0])
  const [showSelector, setShowSelector] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [animCard, setAnimCard] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!bookName.trim()) return
    await addChallenge(bookName.trim(), completedDate)
    setBookName('')
    setShowAdd(false)
  }

  const handleRedeem = (challengeId: string) => {
    setRedeemingId(challengeId)
    setShowSelector(true)
  }

  const handleSelectorConfirm = async (type: 'game' | 'pizzahut') => {
    if (!redeemingId) return
    const card = await addReward(type, undefined, 'reading', redeemingId)
    await markRedeemed(redeemingId, card.id)
    setShowSelector(false)
    setRedeemingId(null)
    setAnimCard(card.name)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-300 border-t-green-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">阅读挑战</h1>
          <p className="text-sm text-gray-500">读完一本书，兑换一张奖励卡</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-green-500 to-teal-500 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:self-auto"
        >
          <BookOpen className="h-5 w-5" /> 添加书籍
        </button>
      </div>

      {/* active challenges */}
      {active.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-gray-700">
              可兑换 ({active.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {active.map(challenge => (
              <div key={challenge.id} className="rounded-2xl border-2 border-green-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                <div className="mb-1 flex items-start justify-between">
                  <h3 className="text-lg font-bold text-gray-800">{challenge.bookName}</h3>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    可兑换
                  </span>
                </div>
                <p className="mb-3 text-sm text-gray-400">
                  完成于 {new Date(challenge.completedDate).toLocaleDateString('zh-CN')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRedeem(challenge.id)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 py-2.5 text-sm font-semibold text-white shadow transition-all hover:shadow-md active:scale-95"
                  >
                    兑换奖励卡
                  </button>
                  <button
                    onClick={() => deleteChallenge(challenge.id)}
                    className="rounded-xl bg-gray-100 p-2.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* history */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">历史记录</h2>
        {challenges.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-gray-400 shadow-sm">
            <BookOpen className="h-12 w-12" />
            <p>还没有阅读记录</p>
          </div>
        ) : (
          <div className="space-y-2">
            {challenges.filter(c => c.status === 'redeemed').map(challenge => (
              <div key={challenge.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{challenge.bookName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(challenge.completedDate).toLocaleDateString('zh-CN')}
                    {challenge.redeemedAt && ` · 兑换于 ${new Date(challenge.redeemedAt).toLocaleDateString('zh-CN')}`}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">已兑换</span>
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
            <h2 className="mb-4 text-lg font-bold text-gray-800">添加阅读记录</h2>
            <input
              type="text"
              value={bookName}
              onChange={e => setBookName(e.target.value)}
              placeholder="书籍名称"
              className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-green-400"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <label className="mb-1 block text-sm text-gray-500">完成日期</label>
            <input
              type="date"
              value={completedDate}
              onChange={e => setCompletedDate(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-green-400"
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
                disabled={!bookName.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 py-2.5 font-semibold text-white disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      <CardSelector
        open={showSelector}
        onClose={() => { setShowSelector(false); setRedeemingId(null) }}
        onConfirm={handleSelectorConfirm}
        title="兑换奖励卡"
      />

      <RewardAnimation
        open={!!animCard}
        onClose={() => setAnimCard(null)}
        cardName={animCard ?? undefined}
      />
    </div>
  )
}
