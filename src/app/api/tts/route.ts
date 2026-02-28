import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

const client = new TextToSpeechClient()

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || text.length > 2000) {
      return NextResponse.json({ error: 'Invalid text' }, { status: 400 })
    }

    // SSML: 구두점에 쉼 추가
    const ssml = '<speak>' + text
      .replace(/\. /g, '.<break time="500ms"/> ')
      .replace(/\, /g, ',<break time="300ms"/> ')
      .replace(/\? /g, '?<break time="500ms"/> ')
      .replace(/\! /g, '!<break time="400ms"/> ')
      .replace(/하라 /g, '하라<break time="350ms"/> ')
      .replace(/하리라/g, '하리라<break time="400ms"/>')
      .replace(/니라/g, '니라<break time="400ms"/>')
      .replace(/도다/g, '도다<break time="400ms"/>')
      .replace(/로다/g, '로다<break time="400ms"/>')
      .replace(/이니/g, '이니<break time="300ms"/>')
      .replace(/\n/g, '<break time="600ms"/>')
      + '</speak>'

    const [response] = await client.synthesizeSpeech({
      input: { ssml },
      voice: {
        languageCode: 'ko-KR',
        name: 'ko-KR-Wavenet-C', // 남성, 차분한 톤
        ssmlGender: 'MALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.82,
        pitch: -2.0, // 낮은 톤
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
