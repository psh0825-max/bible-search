import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

const client = new TextToSpeechClient()

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || text.length > 2000) {
      return NextResponse.json({ error: 'Invalid text' }, { status: 400 })
    }

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'ko-KR',
        name: 'ko-KR-Wavenet-A', // 여성, 자연스러운 한국어
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.92,
        pitch: 0,
      },
    })

    if (!response.audioContent) {
      return NextResponse.json({ error: 'No audio' }, { status: 500 })
    }

    const audioBuffer = Buffer.from(response.audioContent as Uint8Array)
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // 24h cache
      },
    })
  } catch (e: unknown) {
    console.error('TTS error:', e)
    const msg = e instanceof Error ? e.message : 'TTS failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
