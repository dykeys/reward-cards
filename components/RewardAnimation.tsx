'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Star, Trophy, Frown, Trash2 } from 'lucide-react'

const REWARD_QUOTES = [
  '🔥 阅读的火焰点燃了奖励的宝箱！',
  '⚡ 跳绳小达人，兑换神之卡片！',
  '🎮 恭喜获得『游戏王』加持 —— 奖励卡解锁！',
  '🍕 力量已满！美食卡召唤激活！',
  '🌟 每滴汗水都变成了一张闪光卡片！',
  '💪 坚持就是力量，奖励属于你！',
  '🏆 冠军的奖赏从不缺席！',
  '🎉 努力值爆表！奖励卡降临！',
  '🌈 今天的汗水，明天的快乐！',
  '🚀 发射！奖励卡片正在飞向你！',
]

const ELIMINATE_QUOTES = [
  '😢 卡片被扣除了...下次要乖哦',
  '💔 因为不听话，一张卡片消失了',
  '📉 扣分太多，卡片飞走了',
  '😔 好可惜，下次要注意行为哦',
  '💨 一张卡片就这样离开了...',
  '🤷 规则就是规则，加油改正吧',
]

const PARTICLE_COUNT = 20

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
}

interface Props {
  open: boolean
  onClose: () => void
  cardName?: string
  mode?: 'reward' | 'eliminate'
}

const rewardColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98']
const eliminateColors = ['#9CA3AF', '#6B7280', '#4B5563', '#7C8BA0', '#A0AEC0', '#8B9DC3', '#9399A8', '#7F8C9B']

export default function RewardAnimation({ open, onClose, cardName, mode = 'reward' }: Props) {
  const isEliminate = mode === 'eliminate'
  const quotes = isEliminate ? ELIMINATE_QUOTES : REWARD_QUOTES
  const colors = isEliminate ? eliminateColors : rewardColors

  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!open) return
    const newParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 6,
      rotation: Math.random() * 360,
    }))
    setParticles(newParticles)
  }, [open])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
            isEliminate ? 'bg-black/70' : 'bg-black/60'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* particles */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute pointer-events-none"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              initial={{ scale: 0, rotate: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                rotate: p.rotation,
                opacity: [1, 0.8, 0],
                y: isEliminate
                  ? [0, 80 + Math.random() * 120]
                  : [0, -80 - Math.random() * 120],
                x: [0, (Math.random() - 0.5) * 100],
              }}
              transition={{ duration: 1.5 + Math.random(), ease: 'easeOut' }}
            >
              <div
                className="rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                }}
              />
            </motion.div>
          ))}

          {/* main card */}
          <motion.div
            className={`relative flex flex-col items-center gap-6 rounded-3xl p-10 shadow-2xl ${
              isEliminate
                ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-slate-600'
                : 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500'
            }`}
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0, rotateY: 180 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {isEliminate ? (
                <Frown className="h-16 w-16 text-white drop-shadow-lg" />
              ) : (
                <Trophy className="h-16 w-16 text-white drop-shadow-lg" />
              )}
            </motion.div>

            {!isEliminate && (
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, delay: 0.8 + i * 0.15, repeat: Infinity }}
                  >
                    <Star className="h-6 w-6 fill-white text-white" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.p
              className="text-center text-xl font-bold text-white drop-shadow-md md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {quote}
            </motion.p>

            {isEliminate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Trash2 className="h-8 w-8 text-gray-300" />
              </motion.div>
            )}

            {cardName && (
              <motion.p
                className="rounded-full bg-white/30 px-6 py-2 text-lg font-semibold text-white backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
              >
                {cardName}
              </motion.p>
            )}

            <motion.button
              className={`mt-2 rounded-full px-8 py-3 font-bold shadow-lg transition-colors ${
                isEliminate
                  ? 'bg-white/80 text-gray-700 hover:bg-white'
                  : 'bg-white text-amber-600 hover:bg-amber-50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              {isEliminate ? '知道了' : '太棒了！'}
            </motion.button>

            {isEliminate ? (
              <Trash2 className="absolute -right-2 -top-2 h-8 w-8 text-gray-300" />
            ) : (
              <>
                <Sparkles className="absolute -right-2 -top-2 h-8 w-8 text-yellow-200" />
                <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-200" />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
