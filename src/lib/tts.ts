// Browser SpeechSynthesis TTS
let speaking = false

export function speakVerse(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) return
  
  // Stop any current speech
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = 0.9
  utterance.pitch = 1.0
  
  // Try to find Korean voice
  const voices = window.speechSynthesis.getVoices()
  const koVoice = voices.find(v => v.lang.startsWith('ko'))
  if (koVoice) utterance.voice = koVoice
  
  speaking = true
  utterance.onend = () => { speaking = false; onEnd?.() }
  utterance.onerror = () => { speaking = false; onEnd?.() }
  
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    speaking = false
  }
}

export function isSpeaking() { return speaking }
