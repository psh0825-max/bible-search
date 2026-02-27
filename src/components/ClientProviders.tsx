'use client'
import { FontSizeProvider } from '@/components/FontSizeControl'
import FontSizeControl from '@/components/FontSizeControl'
import Nav from '@/components/Nav'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <FontSizeProvider>
      <div style={{ paddingBottom: '72px' }}>{children}</div>
      <FontSizeControl />
      <Nav />
    </FontSizeProvider>
  )
}
