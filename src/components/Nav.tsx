'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: '찾기', icon: (active: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#A78BFA' : '#64748B'} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
  )},
  { href: '/read', label: '읽기', icon: (active: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#A78BFA' : '#64748B'} strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  )},
  { href: '/categories', label: '테마', icon: (active: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#A78BFA' : '#64748B'} strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  )},
  { href: '/bookmarks', label: '저장', icon: (active: boolean) => (
    <svg viewBox="0 0 24 24" fill={active ? '#A78BFA' : 'none'} stroke={active ? '#A78BFA' : '#64748B'} strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
  )},
  { href: '/more', label: '더보기', icon: (active: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={active ? '#A78BFA' : '#64748B'} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
  )},
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bottom-nav">
      <div style={{ display: 'flex', maxWidth: '448px', margin: '0 auto' }}>
        {TABS.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} className="nav-item"
              style={{ color: active ? 'var(--accent-bright)' : 'var(--text-dim)', fontWeight: active ? 700 : 500 }}>
              <div style={{ width: '24px', height: '24px' }}>{tab.icon(active)}</div>
              <span>{tab.label}</span>
              {active && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', marginTop: '-1px' }} />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
