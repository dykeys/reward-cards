import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, cardType } = await req.json()

  const apiKey = process.env.SILICONFLOW_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: '请设置 SILICONFLOW_API_KEY 环境变量' }, { status: 400 })
  }

  const model = 'Kwai-Kolors/Kolors'
  const stylePrompt = cardType === 'game'
    ? '游戏卡片设计，炫酷风格'
    : '美食卡片设计，诱人风格'

  const fullPrompt = prompt
    ? `${stylePrompt}，${prompt}`
    : stylePrompt

  try {
    const res = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('SiliconFlow error:', err)
      return NextResponse.json({ error: '生成失败，请检查 API Key 或稍后重试' }, { status: 500 })
    }

    const data = await res.json()
    const imageUrl = data.images?.[0]?.url || data.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: '未获取到图片' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: '网络错误' }, { status: 500 })
  }
}
