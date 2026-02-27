import { NextRequest, NextResponse } from 'next/server'
import bibleData from '@/data/bible.json'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

// Build book lookup: name/abbr → vl number
const BOOK_LOOKUP: Record<string, string> = {}
for (const [vl, book] of Object.entries(bibleData as any)) {
  const b = book as any
  BOOK_LOOKUP[b.name] = vl
  BOOK_LOOKUP[b.abbr] = vl
}

function getVerse(bookName: string, chapter: number, verse: number): string | null {
  const vl = BOOK_LOOKUP[bookName]
  if (!vl) return null
  const book = (bibleData as any)[vl]
  if (!book?.chapters?.[chapter]) return null
  const verses = book.chapters[chapter]
  if (verse < 1 || verse > verses.length) return null
  return verses[verse - 1]
}

function getVerseRange(bookName: string, chapter: number, startVerse: number, endVerse: number): string | null {
  const vl = BOOK_LOOKUP[bookName]
  if (!vl) return null
  const book = (bibleData as any)[vl]
  if (!book?.chapters?.[chapter]) return null
  const verses = book.chapters[chapter]
  const end = Math.min(endVerse, verses.length)
  if (startVerse < 1 || startVerse > verses.length) return null
  return verses.slice(startVerse - 1, end).join(' ')
}

// Direct verse lookup: "요한복음 3장 16절", "시편 23:1-6", "창 1:1" etc.
function tryDirectLookup(query: string): { reference: string; text: string }[] | null {
  const results: { reference: string; text: string }[] = []

  // Patterns to match
  const patterns = [
    // "요한복음 3장 1절에서 7절" or "3장 1절부터 7절"
    /([가-힣]+(?:\s?[가-힣]*)?)[\s]*(\d+)[\s]*장[\s]*(\d+)[\s]*절?[\s]*(?:에서|부터|~|-|–)[\s]*(\d+)[\s]*절?/g,
    // "요한복음 3장 16절" or "요한복음 3장 16-18절"
    /([가-힣]+(?:\s?[가-힣]*)?)[\s]*(\d+)[\s]*장[\s]*(\d+)(?:[\s]*[-~–][\s]*(\d+))?[\s]*절?/g,
    // "요한복음 3:16" or "요한복음 3:16-18"
    /([가-힣]+(?:\s?[가-힣]*)?)[\s]*(\d+)[\s]*:[\s]*(\d+)(?:[\s]*[-~–][\s]*(\d+))?/g,
    // "요 3:16" abbreviation
    /([가-힣]{1,4})[\s]*(\d+)[\s]*:[\s]*(\d+)(?:[\s]*[-~–][\s]*(\d+))?/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(query)) !== null) {
      const bookName = match[1].trim()
      const chapter = parseInt(match[2])
      const startV = parseInt(match[3])
      const endV = match[4] ? parseInt(match[4]) : startV

      const text = startV === endV
        ? getVerse(bookName, chapter, startV)
        : getVerseRange(bookName, chapter, startV, endV)

      if (text) {
        const ref = startV === endV
          ? `${bookName} ${chapter}:${startV}`
          : `${bookName} ${chapter}:${startV}-${endV}`
        results.push({ reference: ref, text })
      }
    }
    if (results.length > 0) break
  }

  return results.length > 0 ? results : null
}

const SYSTEM_PROMPT = `당신은 성경 전문가입니다. 사용자가 자신의 감정, 상황, 고민을 설명하면 가장 적합한 성경 구절 3~5개의 **위치**를 알려주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

[
  {
    "book": "책이름 (예: 시편, 잠언, 요한복음, 로마서 등 - 정식 한글 이름)",
    "chapter": 장번호,
    "startVerse": 시작절,
    "endVerse": 끝절,
    "reason": "왜 이 구절이 지금 상황에 맞는지 따뜻한 한 문장으로",
    "mood": "comfort | courage | hope | gratitude | peace | wisdom | love | faith"
  }
]

규칙:
- 반드시 실제 존재하는 성경 구절 위치만 사용
- 책이름은 한글 정식 이름 사용: 창세기, 출애굽기, 레위기, 민수기, 신명기, 여호수아, 사사기, 룻기, 사무엘상, 사무엘하, 열왕기상, 열왕기하, 역대상, 역대하, 에스라, 느헤미야, 에스더, 욥기, 시편, 잠언, 전도서, 아가, 이사야, 예레미야, 예레미야 애가, 에스겔, 다니엘, 호세아, 요엘, 아모스, 오바댜, 요나, 미가, 나훔, 하박국, 스바냐, 학개, 스가랴, 말라기, 마태복음, 마가복음, 누가복음, 요한복음, 사도행전, 로마서, 고린도전서, 고린도후서, 갈라디아서, 에베소서, 빌립보서, 골로새서, 데살로니가전서, 데살로니가후서, 디모데전서, 디모데후서, 디도서, 빌레몬서, 히브리서, 야고보서, 베드로전서, 베드로후서, 요한1서, 요한2서, 요한3서, 유다서, 요한계시록
- endVerse는 startVerse와 같거나 최대 3절까지
- reason은 따뜻하고 위로가 되는 말투로
- 다양한 성경 책에서 골라주세요`

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string' || query.length > 500) {
      return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 })
    }

    // Try direct verse lookup first
    const directResults = tryDirectLookup(query)
    if (directResults) {
      const verses = directResults.map(v => ({
        reference: v.reference,
        text: v.text,
        reason: '',
        mood: 'faith',
        found: true,
      }))
      return NextResponse.json({ verses, direct: true })
    }

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n사용자의 마음: "${query}"` }] }
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      })
    })

    if (!res.ok) {
      console.error('Gemini error:', await res.text())
      return NextResponse.json({ error: 'AI 서비스 오류' }, { status: 500 })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: '구절을 찾지 못했습니다' }, { status: 500 })
    }

    const locations = JSON.parse(jsonMatch[0])

    // Look up actual verse text from our database
    const verses = locations.map((loc: any) => {
      const verseText = loc.startVerse === loc.endVerse
        ? getVerse(loc.book, loc.chapter, loc.startVerse)
        : getVerseRange(loc.book, loc.chapter, loc.startVerse, loc.endVerse)

      const reference = loc.startVerse === loc.endVerse
        ? `${loc.book} ${loc.chapter}:${loc.startVerse}`
        : `${loc.book} ${loc.chapter}:${loc.startVerse}-${loc.endVerse}`

      return {
        reference,
        text: verseText || `[구절을 찾을 수 없습니다: ${reference}]`,
        reason: loc.reason,
        mood: loc.mood,
        found: !!verseText,
      }
    }).filter((v: any) => v.found) // Only return found verses

    if (verses.length === 0) {
      return NextResponse.json({ error: '구절을 찾지 못했습니다. 다시 시도해주세요.' }, { status: 500 })
    }

    return NextResponse.json({ verses })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: '오류가 발생했습니다' }, { status: 500 })
  }
}
