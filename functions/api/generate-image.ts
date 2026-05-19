export async function onRequest(context) {
  const { request, env } = context

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = env.SILICONFLOW_API_KEY
  if (!apiKey) {
    return Response.json({ error: '请设置 SILICONFLOW_API_KEY 环境变量' }, { status: 400 })
  }

  try {
    const { prompt, cardType } = await request.json()

    const stylePrompt = cardType === 'game'
      ? '游戏卡片设计，炫酷风格'
      : '美食卡片设计，诱人风格'

    const fullPrompt = prompt ? `${stylePrompt}，${prompt}` : stylePrompt

    const res = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Kwai-Kolors/Kolors',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('SiliconFlow error:', err)
      return Response.json({ error: '生成失败，请检查 API Key 或稍后重试' }, { status: 500 })
    }

    const data = await res.json()
    const imageUrl = data.images?.[0]?.url || data.data?.[0]?.url

    if (!imageUrl) {
      return Response.json({ error: '未获取到图片' }, { status: 500 })
    }

    return Response.json({ imageUrl })
  } catch (e) {
    console.error('Generate error:', e)
    return Response.json({ error: '网络错误' }, { status: 500 })
  }
}
