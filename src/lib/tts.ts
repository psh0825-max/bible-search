// Browser SpeechSynthesis TTS
let speaking = false
let voicesLoaded = false
let koVoice: SpeechSynthesisVoice | null = null

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    koVoice = voices.find(v => v.lang.startsWith('ko')) || null
    voicesLoaded = true
  }
}

// Load voices on init and on change
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

export function speakVerse(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.()
    return
  }

  // Cancel any current speech
  window.speechSynthesis.cancel()

  // Reload voices if not loaded yet
  if (!voicesLoaded) loadVoices()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = 0.9
  utterance.pitch = 1.0
  if (koVoice) utterance.voice = koVoice

  speaking = true
  utterance.onend = () => { speaking = false; onEnd?.() }
  utterance.onerror = () => { speaking = false; onEnd?.() }

  // Mobile Chrome workaround: short delay after cancel
  setTimeout(() => {
    window.speechSynthesis.speak(utterance)
    // Android Chrome bug: speech pauses after ~15s, keep alive
    const keepAlive = setInterval(() => {
      if (!speaking) { clearInterval(keepAlive); return }
      window.speechSynthesis.pause()
      window.speechSynthesis.resume()
    }, 10000)
    utterance.onend = () => { speaking = false; clearInterval(keepAlive); onEnd?.() }
    utterance.onerror = () => { speaking = false; clearInterval(keepAlive); onEnd?.() }
  }, 100)
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    speaking = false
  }
}

export function isSpeaking() { return speaking }
