'use client'
import { motion } from 'motion/react'
import Link from 'next/link'

const SECTIONS = [
  {
    emoji: '🔍',
    title: '감정으로 검색하기',
    desc: '"외롭고 힘들어요", "감사한 일이 있어요" 같이 마음을 말하면 AI가 꼭 맞는 성경 구절을 찾아줍니다.',
    steps: ['홈 화면에서 마음을 입력하세요', '"✝️ 말씀 찾기" 버튼을 누르세요', 'AI가 추천한 구절을 읽어보세요'],
  },
  {
    emoji: '📖',
    title: '직접 구절 찾기',
    desc: '"요한복음 3장 16절", "시편 23:1-6", "창 1:1" 등 구절 주소를 직접 입력해서 찾을 수 있습니다.',
    steps: ['검색창에 구절 주소를 입력하세요', '책 이름 + 장 + 절 형식으로 입력', '약어도 가능: 요 3:16, 창 1:1'],
  },
  {
    emoji: '🎤',
    title: '음성으로 검색하기',
    desc: '마이크 버튼을 누르고 말하면 음성이 텍스트로 변환되어 자동 검색됩니다.',
    steps: ['검색창 옆 🎤 버튼을 누르세요', '마이크 권한을 허용해주세요', '말하면 자동으로 검색됩니다'],
  },
  {
    emoji: '📚',
    title: '성경 읽기',
    desc: '개역개정 66권 31,088절 전체를 읽을 수 있습니다. 구약 39권, 신약 27권.',
    steps: ['하단 "읽기" 탭을 누르세요', '구약/신약 선택 후 책을 고르세요', '장을 선택하면 절이 표시됩니다'],
  },
  {
    emoji: '⭐',
    title: '구절 저장하기',
    desc: '마음에 드는 구절을 북마크에 저장하고 나중에 다시 볼 수 있습니다.',
    steps: ['구절 옆 ⭐ 버튼을 누르세요', '하단 "저장" 탭에서 확인하세요', '저장한 구절은 기기에 보관됩니다'],
  },
  {
    emoji: '🎵',
    title: '테마별 말씀',
    desc: '사랑, 용기, 위로, 감사 등 10가지 테마로 분류된 구절을 바로 읽을 수 있습니다.',
    steps: ['하단 "테마" 탭을 누르세요', '원하는 테마 카드를 선택하세요', '테마당 6개의 엄선된 구절이 있습니다'],
  },
  {
    emoji: '🔊',
    title: '구절 듣기 (TTS)',
    desc: '구절을 음성으로 들을 수 있습니다. 한국어 음성 합성을 사용합니다.',
    steps: ['구절 옆 🔊 버튼을 누르세요', '기기 음량을 확인해주세요', '다시 누르면 멈춥니다'],
  },
  {
    emoji: '가',
    title: '글씨 크기 조절',
    desc: '오른쪽 하단의 "가" 버튼으로 글씨 크기를 4단계로 조절할 수 있습니다.',
    steps: ['오른쪽 하단 "가" 버튼을 누르세요', '작게 / 보통 / 크게 / 아주 크게 선택', '설정은 자동 저장됩니다'],
  },
]

export default function GuidePage() {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 16px' }}>
      <div className="ambient-bg" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '14px', marginBottom: '16px' }}>
          ← 홈으로
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg, #C4B5FD, #F9A8D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📖 사용 가이드
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px', marginTop: '8px', lineHeight: 1.6 }}>
          말씀찾기의 모든 기능을 알려드려요
        </p>
      </motion.div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {SECTIONS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="gradient-border" style={{ background: 'var(--bg-card)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {s.emoji}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{s.title}</div>
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>{s.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {s.steps.map((step, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-bright)', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>{j + 1}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--text-dim)' }}>
        <p>말씀찾기 by LightOn+ Lab</p>
        <p style={{ marginTop: '4px', opacity: 0.6 }}>문의: psh0825@gmail.com</p>
      </div>
    </div>
  )
}
