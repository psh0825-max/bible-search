'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Verse {
  reference: string
  text: string
  reason: string
  mood: string
}

const MOOD_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  comfort: { emoji: '🫂', gradient: 'from-blue-500/20 to-purple-500/20' },
  courage: { emoji: '🔥', gradient: 'from-orange-500/20 to-red-500/20' },
  hope: { emoji: '🌅', gradient: 'from-amber-500/20 to-yellow-500/20' },
  gratitude: { emoji: '🙏', gradient: 'from-green-500/20 to-emerald-500/20' },
  peace: { emoji: '🕊️', gradient: 'from-sky-500/20 to-cyan-500/20' },
  wisdom: { emoji: '💎', gradient: 'from-violet-500/20 to-indigo-500/20' },
  love: { emoji: '❤️', gradient: 'from-pink-500/20 to-rose-500/20' },
  faith: { emoji: '✝️', gradient: 'from-amber-500/20 to-orange-500/20' },
}

const SUGGESTIONS = [
  '마음이 불안하고 걱정이 많아요',
  '감사한 일이 있어요',
  '외롭고 힘들어요',
  '용기가 필요해요',
  '사랑에 대해 알고 싶어요',
  '시험을 앞두고 있어요',
  '가족이 아파요',
  '새로운 시작이 두려워요',
  '화가 나요',
  '용서하고 싶어요',
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [stars, setStars] = useState<{ x: number; y: number; delay: number; size: number }[]>([])
  const [listening, setListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      setSpeechSupported(true)
      const r = new SR()
      r.lang = 'ko-KR'
      r.continuous = false
      r.interimResults = true
      r.onresult = (e: any) => {
        let transcript = ''
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript
        }
        setQuery(transcript)
        if (e.results[0].isFinal) {
          setListening(false)
          // Auto-search after voice input
          setTimeout(() => {
            const btn = document.querySelector('[data-search-btn]') as HTMLButtonElement
            if (btn && !btn.disabled) btn.click()
          }, 300)
        }
      }
      r.onend = () => setListening(false)
      r.onerror = () => setListening(false)
      recognitionRef.current = r
    }
  }, [])

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      setQuery('')
      recognitionRef.current.start()
      setListening(true)
    }
  }, [listening])

  useEffect(() => {
    const s = Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 2 + 1,
    }))
    setStars(s)
  }, [])

  const search = useCallback(async (q?: string) => {
    const searchQuery = q || query
    if (!searchQuery.trim() || loading) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setVerses(data.verses)
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
      setVerses([])
    } finally {
      setLoading(false)
    }
  }, [query, loading])

  const handleSuggestion = (s: string) => {
    setQuery(s)
    search(s)
  }

  const copyVerse = (v: Verse) => {
    navigator.clipboard.writeText(`${v.text}\n- ${v.reference}`)
  }

  const shareVerse = (v: Verse) => {
    if (navigator.share) {
      navigator.share({ title: '말씀찾기', text: `${v.text}\n- ${v.reference}` })
    } else {
      copyVerse(v)
    }
  }

  return (
    <div className="relative min-h-dvh">
      {/* Stars */}
      <div className="stars">
        {stars.map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-5 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-16 pb-8 text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl mb-6"
          >
            ✝️
          </motion.div>
          <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
            말씀찾기
          </h1>
          <p className="text-[var(--text-dim)] text-lg leading-relaxed">
            지금 당신의 마음을 <span className="text-[var(--accent-light)]">말해보세요</span> 🎤<br />
            꼭 맞는 <span className="text-[var(--accent-light)]">성경 구절</span>을 찾아드릴게요
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass rounded-2xl p-4 glow mb-6"
        >
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); search() } }}
            placeholder={listening ? '듣고 있어요... 🎙️' : '마음이 힘들어요... 감사해요... 용기가 필요해요...'}
            rows={3}
            className="w-full bg-transparent text-lg resize-none outline-none placeholder:text-[var(--text-dim)] p-2"
            maxLength={500}
            style={listening ? { borderColor: 'var(--accent)', color: 'var(--accent-light)' } : {}}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-dim)]">{query.length}/500</span>
              {speechSupported && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={toggleVoice}
                  className="p-2 rounded-full"
                  style={{
                    background: listening ? 'var(--accent)' : 'transparent',
                    border: listening ? 'none' : '1px solid var(--border)',
                    cursor: 'pointer',
                    color: listening ? 'white' : 'var(--text-dim)',
                    fontSize: '20px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="음성으로 말하기"
                >
                  {listening ? (
                    <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                      🎙️
                    </motion.span>
                  ) : '🎤'}
                </motion.button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => search()}
              disabled={loading || !query.trim()}
              data-search-btn
              className="px-8 py-3 rounded-xl font-bold text-lg disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                color: 'white',
                border: 'none',
                cursor: loading || !query.trim() ? 'default' : 'pointer',
              }}
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  ✨
                </motion.span>
              ) : '찾기 🔍'}
            </motion.button>
          </div>
        </motion.div>

        {/* Suggestions */}
        <AnimatePresence>
          {!searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-[var(--text-dim)] mb-3 ml-1">💡 이런 마음도 괜찮아요</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(124, 58, 237, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSuggestion(s)}
                    className="glass px-4 py-2.5 rounded-full text-sm cursor-pointer hover:border-[var(--accent)]"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4 inline-block"
              >
                ✨
              </motion.div>
              <p className="text-[var(--text-dim)] text-lg">말씀을 찾고 있어요...</p>
              <p className="text-[var(--text-dim)] text-sm mt-1">당신의 마음에 꼭 맞는 구절을 골라볼게요</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 text-center text-red-400 mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {verses.length > 0 && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[var(--text-dim)] ml-1"
              >
                ✨ 당신을 위한 말씀 {verses.length}개를 찾았어요
              </motion.p>

              {verses.map((v, i) => {
                const mood = MOOD_CONFIG[v.mood] || MOOD_CONFIG.comfort
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <div className={`verse-card bg-gradient-to-br ${mood.gradient} p-6`} style={{ background: 'var(--bg-card)' }}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} rounded-[20px]`} />
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{mood.emoji}</span>
                            <span className="text-[var(--accent-light)] text-sm font-semibold">{v.reference}</span>
                          </div>
                          <div className="flex gap-1">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => copyVerse(v)}
                              className="p-2 rounded-lg hover:bg-white/5"
                              title="복사"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '16px' }}
                            >
                              📋
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => shareVerse(v)}
                              className="p-2 rounded-lg hover:bg-white/5"
                              title="공유"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '16px' }}
                            >
                              🔗
                            </motion.button>
                          </div>
                        </div>

                        {/* Verse text */}
                        <p className="text-xl leading-relaxed font-medium mb-4" style={{ lineHeight: 1.8 }}>
                          "{v.text}"
                        </p>

                        {/* Reason */}
                        <div className="flex items-start gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                          <span className="text-sm mt-0.5">💬</span>
                          <p className="text-sm text-[var(--text-dim)] leading-relaxed italic">
                            {v.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Search again */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: verses.length * 0.15 + 0.3 }}
                className="text-center py-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setVerses([]); setSearched(false); setQuery(''); inputRef.current?.focus() }}
                  className="glass px-6 py-3 rounded-full text-sm cursor-pointer"
                  style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
                >
                  🔄 다른 마음으로 다시 찾기
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center py-8 text-xs text-[var(--text-dim)]">
          <p>말씀찾기 by LightOn+ Lab</p>
          <p className="mt-1 opacity-60">AI가 추천한 구절입니다. 정확한 내용은 성경을 확인해주세요.</p>
        </div>
      </div>
    </div>
  )
}
