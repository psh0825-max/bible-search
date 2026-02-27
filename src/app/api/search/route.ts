import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `당신은 성경 전문가입니다. 사용자가 자신의 감정, 상황, 고민을 설명하면 가장 적합한 성경 구절 3~5개를 찾아주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

[
  {
    "reference": "성경 책 장:절 (개역개정)",
    "text": "구절 전문 (한글 개역개정)",
    "reason": "왜 이 구절이 지금 상황에 맞는지 따뜻한 한 문장으로",
    "mood": "comfort | courage | hope | gratitude | peace | wisdom | love | faith"
  }
]

규칙:
- 반드시 실제 성경 구절만 사용 (가짜 구절 금지)
- 한글 개역개정 번역 사용
- reason은 따뜻하고 위로가 되는 말투로
- mood는 구절의 주요 감정/테마
- 다양한 성경 책에서 골라주세요 (시편만 편중 금지)`

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string' || query.length > 500) {
      return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 })
    }

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n사용자의 마음: "${query}"` }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini error:', errText)
      return NextResponse.json({ error: 'AI 서비스 오류' }, { status: 500 })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: '구절을 찾지 못했습니다' }, { status: 500 })
    }

    const verses = JSON.parse(jsonMatch[0])
    return NextResponse.json({ verses })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
