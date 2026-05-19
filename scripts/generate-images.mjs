const GAME_PROMPTS = [
  '炫酷游戏卡设计，赛博朋克风格，霓虹灯光，机甲战士',
  '炫酷游戏卡设计，奇幻风格，龙与魔法，史诗感',
  '炫酷游戏卡设计，太空风格，星际战舰，银河星辰',
  '炫酷游戏卡设计，忍者风格，日式水墨，武士刀',
  '炫酷游戏卡设计，超级英雄风格，闪电，力量爆发',
  '炫酷游戏卡设计，恐龙时代，丛林冒险，远古',
  '炫酷游戏卡设计，赛车风格，极速赛道，未来科技',
  '炫酷游戏卡设计，城堡骑士，中世纪，盾牌与剑',
  '炫酷游戏卡设计，海盗风格，宝藏地图，大海航行',
  '炫酷游戏卡设计，忍者神龟，卡通炫酷，城市下水道',
]

const FOOD_PROMPTS = [
  '诱人美食卡设计，经典披萨，芝士拉丝，意大利风味',
  '诱人美食卡设计，美味汉堡，层次分明，美式快餐',
  '诱人美食卡设计，精致蛋糕，水果装饰，法式甜点',
  '诱人美食卡设计，日式寿司，新鲜三文鱼，精致摆盘',
  '诱人美食卡设计，意大利面，番茄酱，西式摆盘',
  '诱人美食卡设计，冰淇淋圣代，多彩糖针，夏日甜品',
  '诱人美食卡设计，中式点心，虾饺烧卖，蒸笼竹香',
  '诱人美食卡设计，牛排大餐，红酒搭配，高级西餐',
  '诱人美食卡设计，彩色甜甜圈，糖霜装饰，甜品台',
  '诱人美食卡设计，水果拼盘，芒果草莓，热带风情',
]

async function download(url, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 30000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (e) {
      if (i === retries - 1) throw e
      console.log(`  retry ${i + 1}/${retries}...`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
}

async function main() {
  const fs = await import('fs')
  const path = await import('path')

  const envPath = path.join(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const apiKey = envContent.match(/SILICONFLOW_API_KEY=(.+)/)?.[1]?.trim()
  if (!apiKey) throw new Error('API key not found')

  const results = { game: [], food: [] }
  const all = [
    ...GAME_PROMPTS.map(p => ({ prompt: p, type: 'game' })),
    ...FOOD_PROMPTS.map(p => ({ prompt: p, type: 'food' })),
  ]

  for (let i = 0; i < all.length; i++) {
    const { prompt, type } = all[i]
    const num = String(i + 1).padStart(2, '0')
    const filename = `${type}-${num}.png`
    const filepath = path.join(process.cwd(), 'public', 'images', filename)
    const urlPath = `/images/${filename}`

    if (fs.existsSync(filepath)) {
      console.log(`[${i + 1}/20] ${filename} already exists, skipping`)
      results[type].push(urlPath)
      continue
    }

    console.log(`[${i + 1}/20] ${type}: ${prompt.slice(0, 30)}...`)

    // delay between API calls to avoid rate limiting
    if (i > 0) await new Promise(r => setTimeout(r, 15000))

    try {
      const res = await fetch('https://api.siliconflow.cn/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'Kwai-Kolors/Kolors',
          prompt,
          n: 1,
          size: '1024x1024',
        }),
      })

      if (!res.ok) {
        console.error(`  API error: ${await res.text()}`)
        results[type].push('')
        continue
      }

      const data = await res.json()
      const imageUrl = data.images?.[0]?.url || data.data?.[0]?.url
      if (!imageUrl) {
        console.error('  No image URL')
        results[type].push('')
        continue
      }

      const buffer = await download(imageUrl)
      fs.writeFileSync(filepath, buffer)
      console.log(`  DONE: ${urlPath} (${(buffer.length / 1024).toFixed(0)}KB)`)
      results[type].push(urlPath)
    } catch (e) {
      console.error(`  FAIL: ${e.message}`)
      results[type].push('')
    }
  }

  const configPath = path.join(process.cwd(), 'lib', 'defaultImages.ts')
  fs.writeFileSync(configPath, `export const DEFAULT_IMAGES = ${JSON.stringify(results, null, 2)}\n`)
  console.log(`\nDone! Generated ${results.game.filter(Boolean).length} game + ${results.food.filter(Boolean).length} food images`)
}

main().catch(console.error)
