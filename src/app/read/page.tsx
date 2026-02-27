'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getBooks, getChapter, BookInfo } from '@/lib/bible-utils'
import { speakVerse, stopSpeaking } from '@/lib/tts'
import { addBookmark, removeBookmark, isBookmarked } from '@/lib/storage'

type View = 'books' | 'chapters' | 'reading'

export default function ReadPage() {
  const [view, setView] = useState<View>('books')
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [verses, setVerses] = useState<string[]>([])
  const [speakingVerse, setSpeakingVerse] = useState(-1)
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set())
  const [testament, setTestament] = useState<'old' | 'new'>('old')
  const books = getBooks()

  function selectBook(book: BookInfo) {
    setSelectedBook(book)
    setView('chapters')
  }

  async function selectChapter(cn: number) {
    if (!selectedBook) return
    setSelectedChapter(cn)
    const v = getChapter(selectedBook.vl, cn)
    setVerses(v)
    setView('reading')
    // Check bookmarks
    const bm = new Set<string>()
    for (let i = 0; i < v.length; i++) {
      const ref = `${selectedBook.name} ${cn}:${i + 1}`
      if (await isBookmarked(ref)) bm.add(ref)
    }
    setBookmarkedVerses(bm)
  }

  function speak(text: string, idx: number) {
    if (speakingVerse === idx) { stopSpeaking(); setSpeakingVerse(-1); return }
    setSpeakingVerse(idx)
    speakVerse(text, () => setSpeakingVerse(-1))
  }

  async function toggleBookmark(idx: number) {
    if (!selectedBook) return
    const ref = `${selectedBook.name} ${selectedChapter}:${idx + 1}`
    const bm = new Set(bookmarkedVerses)
    if (bm.has(ref)) {
      await removeBookmark(ref)
      bm.delete(ref)
    } else {
      await addBookmark({ reference: ref, text: verses[idx] })
      bm.add(ref)
    }
    setBookmarkedVerses(bm)
  }

  function goNextChapter() {
    if (!selectedBook || selectedChapter >= selectedBook.chapters) return
    selectChapter(selectedChapter + 1)
    window.scrollTo(0, 0)
  }
  function goPrevChapter() {
    if (selectedChapter <= 1) return
    selectChapter(selectedChapter - 1)
    window.scrollTo(0, 0)
  }

  return (
    <div className="relative z-10 max-w-lg mx-auto px-5 pt-6">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        {view !== 'books' && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView(view === 'reading' ? 'chapters' : 'books')}
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', color: 'var(--accent-bright)', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            ← 뒤로
          </motion.button>
        )}
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>
          {view === 'books' ? '📖 성경 읽기' : view === 'chapters' ? selectedBook?.name : `${selectedBook?.name} ${selectedChapter}장`}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {/* Book List */}
        {view === 'books' && (
          <motion.div key="books" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {(['old', 'new'] as const).map(t => (
                <button key={t} onClick={() => setTestament(t)} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                  background: testament === t ? 'linear-gradient(135deg, var(--accent), #7C3AED)' : 'var(--bg-card)',
                  color: testament === t ? 'white' : 'var(--text-dim)',
                  boxShadow: testament === t ? '0 4px 15px rgba(139,92,246,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {t === 'old' ? '구약 39권' : '신약 27권'}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {books.filter(b => b.testament === testament).map((book, i) => (
                <motion.button key={book.vl} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={() => selectBook(book)}
                  style={{ padding: '16px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{book.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{book.chapters}장</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chapter List */}
        {view === 'chapters' && selectedBook && (
          <motion.div key="chapters" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {Array.from({ length: selectedBook.chapters }, (_, i) => (
                <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => selectChapter(i + 1)}
                  style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', fontWeight: 600 }}>
                  {i + 1}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reading */}
        {view === 'reading' && (
          <motion.div key="reading" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {verses.map((verse, i) => {
                const ref = `${selectedBook?.name} ${selectedChapter}:${i + 1}`
                const isBm = bookmarkedVerses.has(ref)
                return (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                    style={{ display: 'flex', gap: '12px', padding: '12px 8px', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s' }}
                    whileHover={{ backgroundColor: 'rgba(139,92,246,0.06)' }}>
                    <span className="verse-num">{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ lineHeight: 1.9, fontSize: '16px', color: 'var(--text-secondary)' }}>{verse}</p>
                      <div style={{ display: 'flex', gap: '2px', marginTop: '6px' }}>
                        <button onClick={() => speak(verse, i)} className="action-btn" style={{ opacity: speakingVerse === i ? 1 : 0.5 }}>{speakingVerse === i ? '⏹️' : '🔊'}</button>
                        <button onClick={() => toggleBookmark(i)} className="action-btn" style={{ opacity: isBm ? 1 : 0.5 }}>{isBm ? '⭐' : '☆'}</button>
                        <button onClick={() => navigator.clipboard.writeText(`${verse} - ${ref}`)} className="action-btn" style={{ opacity: 0.5 }}>📋</button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0', gap: '12px' }}>
              <button onClick={goPrevChapter} disabled={selectedChapter <= 1}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: selectedChapter <= 1 ? 'var(--text-dim)' : 'var(--text)', cursor: selectedChapter <= 1 ? 'default' : 'pointer', fontWeight: 600 }}>
                ← 이전 장
              </button>
              <button onClick={goNextChapter} disabled={!selectedBook || selectedChapter >= selectedBook.chapters}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--accent)', color: 'white', cursor: !selectedBook || selectedChapter >= selectedBook.chapters ? 'default' : 'pointer', fontWeight: 600, opacity: !selectedBook || selectedChapter >= selectedBook.chapters ? 0.4 : 1 }}>
                다음 장 →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
