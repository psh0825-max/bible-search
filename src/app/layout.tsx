import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '말씀찾기 - 마음을 말하면 성경 구절을 찾아줍니다',
  description: '힘들 때, 감사할 때, 외로울 때... 지금 당신의 마음에 맞는 성경 구절을 AI가 찾아드립니다.',
  icons: { icon: '/favicon.ico' },
}
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0F0F1A',
}

import ClientProviders from '@/components/ClientProviders'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
