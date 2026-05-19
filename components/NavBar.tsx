'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Gift, BookOpen, ArrowUpCircle, Sparkles, AlertTriangle, Heart } from 'lucide-react'

const links = [
  { href: '/', label: '首页', icon: LayoutDashboard },
  { href: '/cards', label: '奖励卡', icon: Gift },
  { href: '/reading', label: '阅读', icon: BookOpen },
  { href: '/jump-rope', label: '跳绳', icon: ArrowUpCircle },
  { href: '/pet', label: '宠物', icon: Heart },
  { href: '/discipline', label: '扣分', icon: AlertTriangle },
  { href: '/generate', label: '生图', icon: Sparkles },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <>
      {/* mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                  active ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-purple-600' : ''}`} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* desktop sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-56 flex-col border-r border-gray-200 bg-white p-4 md:flex">
        <Link href="/" className="mb-8 mt-2 flex items-center gap-2 px-2">
          <Sparkles className="h-7 w-7 text-purple-600" />
          <span className="text-lg font-bold text-gray-800">奖励卡片</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                  active
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-purple-600' : ''}`} />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
