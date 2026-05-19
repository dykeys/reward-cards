'use client'

import { useState } from 'react'
import { useJumpRope } from '@/hooks/useJumpRope'
import { useRewards } from '@/hooks/useRewards'
import { usePet } from '@/hooks/usePet'
import CardSelector from '@/components/CardSelector'
import RewardAnimation from '@/components/RewardAnimation'
import ProgressRing from '@/components/ProgressRing'
import { uid } from '@/lib/id'
import { ArrowUpCircle, CheckCircle2, Flame, History, Trash2 } from 'lucide-react'

export default function JumpRopePage() {
  const { days, activeDays, loading, todayChecked, progress, canRedeem, checkIn, markBatchRedeemed, deleteDay } = useJumpRope()
  const { addReward } = useRewards()
  const { addPoint: addPetPoint } = usePet()

  const [showSelector, setShowSelector] = useState(false)
  const [animCard, setAnimCard] = useState<string | null>(null)

  const handleCheckIn = async () => {
    const day = await checkIn()
    if (day) {
      await addPetPoint('jump_rope', '跳绳打卡')
    }
  }

  const handleRedeem = () => {
    setShowSelector(true)
  }

  const handleSelectorConfirm = async (type: 'game' | 'pizzahut') => {
    const batchId = uid()
    const card = await addReward(type, undefined, 'jump_rope', batchId)
    await markBatchRedeemed(batchId, card.id)
    setShowSelector(false)
    setAnimCard(card.name)
  }

  const batchCount = Math.floor(activeDays.length / 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">跳绳挑战</h1>
        <p className="text-sm text-gray-500">每天跳 5 分钟，集 10 天换一张奖励卡</p>
      </div>

      {/* progress ring */}
      <div className="mb-6 flex flex-col items-center rounded-2xl bg-white p-8 shadow-sm">
        <ProgressRing progress={activeDays.length % 10 || 10} total={10} size={160} strokeWidth={12} />
        <p className="mt-4 text-sm text-gray-500">
          累计打卡 <span className="font-bold text-blue-600">{activeDays.length}</span> 天
        </p>
        {batchCount > 0 && (
          <p className="text-sm text-gray-400">
            已兑换 <span className="font-bold text-green-600">{batchCount}</span> 张奖励卡
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCheckIn}
            disabled={todayChecked}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all active:scale-95 ${
              todayChecked
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-xl'
            }`}
          >
            {todayChecked ? (
              <>
                <CheckCircle2 className="h-5 w-5" /> 今日已打卡
              </>
            ) : (
              <>
                <Flame className="h-5 w-5" /> 打卡！跳了 5 分钟
              </>
            )}
          </button>

          {canRedeem && (
            <button
              onClick={handleRedeem}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
            >
              <ArrowUpCircle className="h-5 w-5" /> 兑换奖励卡
            </button>
          )}
        </div>
      </div>

      {/* recent days */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">打卡记录</h2>
        </div>
        {days.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 text-gray-400 shadow-sm">
            <ArrowUpCircle className="h-12 w-12" />
            <p>还没有跳绳记录，今天开始吧</p>
          </div>
        ) : (
          <div className="space-y-2">
            {days.slice(0, 30).map(day => (
              <div key={day.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                <div className={`h-2.5 w-2.5 rounded-full ${day.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{day.date}</p>
                  {day.note && <p className="text-xs text-gray-400">{day.note}</p>}
                </div>
                {day.status === 'redeemed' && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">已兑换</span>
                )}
                <button
                  onClick={() => deleteDay(day.id)}
                  className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CardSelector
        open={showSelector}
        onClose={() => setShowSelector(false)}
        onConfirm={handleSelectorConfirm}
        title="跳绳兑换奖励卡"
      />

      <RewardAnimation
        open={!!animCard}
        onClose={() => setAnimCard(null)}
        cardName={animCard ?? undefined}
      />
    </div>
  )
}
