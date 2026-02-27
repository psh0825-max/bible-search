'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const SIZES = [
  { label: '작게', value: 14 },
  { label: '보통', value: 17 },
  { label: '크게', value: 20 },
  { label: '아주 크게', value: 24 },
]
const DEFAULT = 17

const FontSizeContext = createContext({ fontSize: DEFAULT, setFontSize: (_: number) => {} })

export function useFontSize() { return useContext(FontSizeContext) }

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState(DEFAULT)

  useEffect(() => {
    const saved = localStorage.getItem('bible-font-size')
    if (saved) setFontSizeState(parseInt(saved))
  }, [])

  function setFontSize(size: number) {
    setFontSizeState(size)
    localStorage.setItem('bible-font-size', String(size))
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export default function FontSizeControl() {
  const { fontSize, setFontSize } = useFontSize()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '80px', right: '16px', zIndex: 60,
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', fontSize: '18px', fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        가
      </motion.button>

      {/* Size picker */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'fixed', bottom: '130px', right: '16px', zIndex: 60,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)', padding: '12px', minWidth: '160px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '8px', padding: '0 4px' }}>글씨 크기</p>
            {SIZES.map(s => (
              <motion.button key={s.value} whileTap={{ scale: 0.95 }}
                onClick={() => { setFontSize(s.value); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  background: fontSize === s.value ? 'var(--accent-soft)' : 'transparent',
                  border: fontSize === s.value ? '1px solid var(--accent)' : '1px solid transparent',
                  color: fontSize === s.value ? 'var(--accent-bright)' : 'var(--text-secondary)',
                  cursor: 'pointer', marginBottom: '4px', transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: `${s.value}px`, fontWeight: 600 }}>가</span>
                <span style={{ fontSize: '13px' }}>{s.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 55 }} />
        )}
      </AnimatePresence>
    </>
  )
}
