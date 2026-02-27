'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getBookmarks, removeBookmark } from '@/lib/storage'
import { speakVerse, stopSpeaking } from '@/lib/tts'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [speakingIdx, setSpeakingIdx] = useState(-1)

  useEffect(() => { loadBookmarks() }, [])

  async function loadBookmarks() {
    const bm = await getBookmarks()
    setBookmarks(bm)
  }

  async function remove(ref: string) {
    await removeBookmark(ref)
    setBookmarks(prev => prev.filter(b => b.reference !== ref))
  }

  function speak(text: string, idx: number) {
    if (speakingIdx === idx) { stopSpeaking(); setSpeakingIdx(-1); return }
    setSpeakingIdx(idx)
    speakVerse(text, () => setSpeakingIdx(-1))
  }

  return (
    <div className="relative z-10 max-w-lg mx-auto px-5 pt-6">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>⭐ 저장한 말씀</h1>
      {bookmarks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📑</div>
          <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>아직 저장한 말씀이 없어요</p>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '8px' }}>말씀 옆의 ⭐을 눌러 저장해보세요</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{bookmarks.length}개 저장됨</p>
          <AnimatePresence>
            {bookmarks.map((bm, i) => (
              <motion.div key={bm.reference} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }}
                className="glass" style={{ borderRadius: '16px', padding: '18px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 600, marginBottom: '6px' }}>{bm.reference}</p>
                <p style={{ fontSize: '15px', lineHeight: 1.8 }}>"{bm.text}"</p>
                <div style={{ display: 'flex', gap: '4px', marginTop: '10px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => speak(bm.text, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: speakingIdx === i ? 1 : 0.5, padding: '4px' }}>{speakingIdx === i ? '⏹️' : '🔊'}</button>
                    <button onClick={() => navigator.clipboard.writeText(`${bm.text}\n- ${bm.reference}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.5, padding: '4px' }}>📋</button>
                    <button onClick={() => { if(navigator.share) navigator.share({ title: '말씀찾기', text: `${bm.text}\n- ${bm.reference}` }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.5, padding: '4px' }}>🔗</button>
                  </div>
                  <button onClick={() => remove(bm.reference)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#ef4444', padding: '4px' }}>삭제</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
