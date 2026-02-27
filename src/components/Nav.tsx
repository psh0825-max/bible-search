'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', icon: '🔍', label: '찾기' },
  { href: '/read', icon: '📖', label: '읽기' },
  { href: '/categories', icon: '💫', label: '테마' },
  { href: '/bookmarks', icon: '⭐', label: '저장' },
  { href: '/more', icon: '☰', label: '더보기' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(15, 15, 26, 0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      padding: '8px 0 env(safe-area-inset-bottom)',
    }}>
      <div style={{ display: 'flex', maxWidth: '448px', margin: '0 auto' }}>
        {TABS.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              padding: '8px 4px', textDecoration: 'none',
              color: active ? 'var(--accent-light)' : 'var(--text-dim)',
              fontSize: '10px', fontWeight: active ? 700 : 400,
              transition: 'color 0.2s',
            }}>
              <span style={{ fontSize: '20px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {active && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', marginTop: '-2px' }} />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
