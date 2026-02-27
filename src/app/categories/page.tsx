'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CATEGORIES, getCategoryVerses, CategoryVerse, getDailyVerse } from '@/lib/bible-utils'
import { speakVerse, stopSpeaking } from '@/lib/tts'
import { addBookmark } from '@/lib/storage'

export default function CategoriesPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [verses, setVerses] = useState<CategoryVerse[]>([])
  const [speakingIdx, setSpeakingIdx] = useState(-1)
  const daily = getDailyVerse()

  function selectCategory(id: string) {
    setSelectedCat(id)
    setVerses(getCategoryVerses(id))
  }

  function speak(text: string, idx: number) {
    if (speakingIdx === idx) { stopSpeaking(); setSpeakingIdx(-1); return }
    setSpeakingIdx(idx)
    speakVerse(text, () => setSpeakingIdx(-1))
  }

  const cat = CATEGORIES.find(c => c.id === selectedCat)

  return (
    <div className="relative z-10 max-w-lg mx-auto px-5 pt-6">
      <AnimatePresence mode="wait">
        {!selectedCat ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>💫 테마별 말씀</h1>

            {/* Daily Verse */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass" style={{ borderRadius: '20px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: '32px', marginBottom: '8px' }}>🌅</motion.div>
              <p style={{ fontSize: '12px', color: 'var(--accent-light)', fontWeight: 600, marginBottom: '8px' }}>오늘의 말씀</p>
              <p style={{ fontSize: '17px', lineHeight: 1.8, marginBottom: '8px' }}>"{daily.text}"</p>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{daily.reference}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => speakVerse(daily.text)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '13px' }}>🔊 듣기</button>
                <button onClick={() => { addBookmark({ reference: daily.reference, text: daily.text, mood: 'hope' }) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '13px' }}>⭐ 저장</button>
                <button onClick={() => navigator.clipboard.writeText(`${daily.text}\n- ${daily.reference}`)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 16px', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '13px' }}>📋 복사</button>
              </div>
            </motion.div>

            {/* Categories */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {CATEGORIES.map((cat, i) => (
                <motion.button key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => selectCategory(cat.id)}
                  style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '6px' }}>{cat.emoji}</div>
                  <div style={{ fontWeight: 600 }}>{cat.name}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedCat(null)}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 14px', color: 'var(--text)', cursor: 'pointer', fontSize: '14px' }}>← 뒤로</motion.button>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{cat?.emoji} {cat?.name}</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {verses.map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass" style={{ borderRadius: '16px', padding: '20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 600, marginBottom: '8px' }}>{v.reference}</p>
                  <p style={{ fontSize: '16px', lineHeight: 1.8 }}>"{v.text}"</p>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    <button onClick={() => speak(v.text, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: speakingIdx === i ? 1 : 0.5, padding: '4px' }}>{speakingIdx === i ? '⏹️' : '🔊'}</button>
                    <button onClick={() => addBookmark({ reference: v.reference, text: v.text, mood: cat?.id })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.5, padding: '4px' }}>⭐</button>
                    <button onClick={() => navigator.clipboard.writeText(`${v.text}\n- ${v.reference}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.5, padding: '4px' }}>📋</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
