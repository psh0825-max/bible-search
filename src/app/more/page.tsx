'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { searchBible } from '@/lib/bible-utils'
import { getHistory, clearHistory } from '@/lib/storage'
import { speakVerse, stopSpeaking } from '@/lib/tts'
import { addBookmark } from '@/lib/storage'

export default function MorePage() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<{ reference: string; text: string }[]>([])
  const [searched, setSearched] = useState(false)
  const [history, setHistory] = useState<{ query: string; timestamp: number }[]>([])
  const [speakingIdx, setSpeakingIdx] = useState(-1)
  const [tab, setTab] = useState<'search' | 'history'>('search')

  useEffect(() => { loadHistory() }, [])

  async function loadHistory() {
    const h = await getHistory()
    setHistory(h)
  }

  const doSearch = useCallback(() => {
    if (!keyword.trim()) return
    const r = searchBible(keyword.trim())
    setResults(r)
    setSearched(true)
  }, [keyword])

  function speak(text: string, idx: number) {
    if (speakingIdx === idx) { stopSpeaking(); setSpeakingIdx(-1); return }
    setSpeakingIdx(idx)
    speakVerse(text, () => setSpeakingIdx(-1))
  }

  function highlightKeyword(text: string) {
    if (!keyword.trim()) return text
    const parts = text.split(new RegExp(`(${keyword.trim()})`, 'gi'))
    return parts.map((p, i) =>
      p.toLowerCase() === keyword.trim().toLowerCase()
        ? `<mark style="background:var(--accent);color:white;border-radius:3px;padding:0 2px">${p}</mark>`
        : p
    ).join('')
  }

  return (
    <div className="relative z-10 max-w-lg mx-auto px-5 pt-6">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>☰ 더보기</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['search', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600,
            background: tab === t ? 'var(--accent)' : 'var(--bg-card)', color: tab === t ? 'white' : 'var(--text-dim)',
          }}>
            {t === 'search' ? '🔎 키워드 검색' : '📜 검색 기록'}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <>
          {/* Search bar */}
          <div className="glass" style={{ borderRadius: '16px', padding: '12px', display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input value={keyword} onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doSearch() }}
              placeholder="성경에서 단어 검색 (예: 사랑, 믿음, 평안)"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '16px' }} />
            <motion.button whileTap={{ scale: 0.9 }} onClick={doSearch}
              style={{ background: 'var(--accent)', border: 'none', borderRadius: '10px', padding: '8px 16px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>검색</motion.button>
          </div>

          {searched && (
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
              {results.length > 0 ? `"${keyword}" ${results.length}개 발견 (최대 50개)` : `"${keyword}" 결과 없음`}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--accent-light)', fontWeight: 600, marginBottom: '4px' }}>{r.reference}</p>
                <p style={{ fontSize: '14px', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightKeyword(r.text) }} />
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  <button onClick={() => speak(r.text, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: speakingIdx === i ? 1 : 0.4, padding: '2px' }}>{speakingIdx === i ? '⏹️' : '🔊'}</button>
                  <button onClick={() => addBookmark({ reference: r.reference, text: r.text })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.4, padding: '2px' }}>⭐</button>
                  <button onClick={() => navigator.clipboard.writeText(`${r.text} - ${r.reference}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: 0.4, padding: '2px' }}>📋</button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {tab === 'history' && (
        <>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
              <p style={{ color: 'var(--text-dim)' }}>검색 기록이 없어요</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button onClick={async () => { await clearHistory(); setHistory([]) }}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '10px', padding: '6px 14px', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>전체 삭제</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map((h, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px' }}>"{h.query}"</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{new Date(h.timestamp).toLocaleDateString('ko-KR')}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
