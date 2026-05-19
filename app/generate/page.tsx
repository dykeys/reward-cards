'use client'

import { useState } from 'react'
import { Gamepad2, Pizza, Sparkles, Download } from 'lucide-react'
import type { RewardCardType } from '@/lib/types'

export default function GeneratePage() {
  const [cardType, setCardType] = useState<RewardCardType>('game')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setImageUrl(null)

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cardType }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '生成失败')
      } else {
        setImageUrl(data.imageUrl)
      }
    } catch {
      setError('网络请求失败')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI 生成卡片图片</h1>
        <p className="text-sm text-gray-500">用 AI 生成炫酷的游戏卡和美食卡</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* type selector */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => { setCardType('game'); setImageUrl(null); setError(null) }}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              cardType === 'game'
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <Gamepad2 className={`h-8 w-8 ${cardType === 'game' ? 'text-purple-600' : 'text-gray-400'}`} />
            <span className={`font-semibold ${cardType === 'game' ? 'text-purple-700' : 'text-gray-500'}`}>游戏卡</span>
          </button>
          <button
            onClick={() => { setCardType('pizzahut'); setImageUrl(null); setError(null) }}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              cardType === 'pizzahut'
                ? 'border-red-500 bg-red-50 shadow-md'
                : 'border-gray-200 hover:border-red-300'
            }`}
          >
            <Pizza className={`h-8 w-8 ${cardType === 'pizzahut' ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={`font-semibold ${cardType === 'pizzahut' ? 'text-red-700' : 'text-gray-500'}`}>美食卡</span>
          </button>
        </div>

        {/* prompt */}
        <div className="mb-5">
          <label className="mb-1 block text-sm font-medium text-gray-600">描述你想要的风格（可选）</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={cardType === 'game' ? '例如：赛博朋克风格，霓虹灯光，炫酷机甲...' : '例如：温馨美食风格，诱人的披萨，暖色调...'}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-lg transition-all active:scale-95 ${
            generating
              ? 'cursor-not-allowed bg-gray-300'
              : 'bg-gradient-to-r from-purple-500 to-amber-500 hover:shadow-xl'
          }`}
        >
          {generating ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" /> 生成图片
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* result */}
      {imageUrl && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <img
            src={imageUrl}
            alt="生成的卡片"
            className="w-full rounded-xl object-cover shadow-md"
            style={{ maxHeight: 400 }}
          />
          <button
            onClick={() => {
              const a = document.createElement('a')
              a.href = imageUrl
              a.download = `reward-card-${cardType}.png`
              a.click()
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Download className="h-4 w-4" /> 下载图片
          </button>
        </div>
      )}
    </div>
  )
}
