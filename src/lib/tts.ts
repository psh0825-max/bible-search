// Google Cloud TTS with browser fallback
let speaking = false
let currentAudio: HTMLAudioElement | null = null

// Cache for audio URLs to avoid re-fetching
const audioCache = new Map<string, string>()

export async function speakVerse(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined') { onEnd?.(); return }

  // Stop any current speech
  stopSpeaking()
  speaking = true

  // Try Google Cloud TTS first
  try {
    let audioUrl = audioCache.get(text)
    if (!audioUrl) {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('API error')
      const blob = await res.blob()
      audioUrl = URL.createObjectURL(blob)
      audioCache.set(text, audioUrl)
    }

    const audio = new Audio(audioUrl)
    currentAudio = audio
    audio.onended = () => { speaking = false; currentAudio = null; onEnd?.() }
    audio.onerror = () => { speaking = false; currentAudio = null; fallbackSpeak(text, onEnd) }
    await audio.play()
    return
  } catch {
    // Fall back to browser TTS
    fallbackSpeak(text, onEnd)
  }
}

function fallbackSpeak(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) { speaking = false; onEnd?.(); return }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = 0.9

  const voices = window.speechSynthesis.getVoices()
  const koVoice = voices.find(v => v.lang.startsWith('ko'))
  if (koVoice) utterance.voice = koVoice

  utterance.onend = () => { speaking = false; onEnd?.() }
  utterance.onerror = () => { speaking = false; onEnd?.() }

  setTimeout(() => window.speechSynthesis.speak(utterance), 100)
}

export function stopSpeaking() {
  speaking = false
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export function isSpeaking() { return speaking }
