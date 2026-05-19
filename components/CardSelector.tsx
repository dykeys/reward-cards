'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Pizza, X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (type: 'game' | 'pizzahut') => void
  title?: string
}

export default function CardSelector({ open, onClose, onConfirm, title = '选择奖励卡片' }: Props) {
  const [type, setType] = useState<'game' | 'pizzahut' | null>(null)

  const handleConfirm = () => {
    if (!type) return
    onConfirm(type)
    setType(null)
  }

  const handleClose = () => {
    setType(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button onClick={handleClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setType('game')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  type === 'game'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <Gamepad2 className={`h-10 w-10 ${type === 'game' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${type === 'game' ? 'text-purple-700' : 'text-gray-600'}`}>游戏卡</span>
              </button>
              <button
                onClick={() => setType('pizzahut')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  type === 'pizzahut'
                    ? 'border-red-500 bg-red-50 shadow-md'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                <Pizza className={`h-10 w-10 ${type === 'pizzahut' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`font-semibold ${type === 'pizzahut' ? 'text-red-700' : 'text-gray-600'}`}>美食卡</span>
              </button>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!type}
              className={`w-full rounded-xl py-3 font-bold text-white transition-all ${
                type
                  ? 'bg-gradient-to-r from-purple-500 to-amber-500 shadow-lg hover:shadow-xl active:scale-[0.98]'
                  : 'cursor-not-allowed bg-gray-300'
              }`}
            >
              确认
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
