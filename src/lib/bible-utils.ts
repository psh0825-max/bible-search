// Bible utilities for reading mode, search, daily verse, categories
import bibleData from '@/data/bible.json'

const bible = bibleData as any

export interface BookInfo {
  vl: string
  name: string
  abbr: string
  chapters: number
  testament: 'old' | 'new'
}

export function getBooks(): BookInfo[] {
  return Object.entries(bible).map(([vl, book]: [string, any]) => ({
    vl,
    name: book.name,
    abbr: book.abbr,
    chapters: Object.keys(book.chapters).length,
    testament: parseInt(vl) <= 39 ? 'old' : 'new',
  }))
}

export function getChapter(vl: string, chapter: number): string[] {
  return bible[vl]?.chapters?.[chapter] || []
}

export function getBookName(vl: string): string {
  return bible[vl]?.name || ''
}

// Keyword search across all verses
export function searchBible(keyword: string, limit = 50): { reference: string; text: string }[] {
  const results: { reference: string; text: string }[] = []
  const kw = keyword.toLowerCase().trim()
  if (kw.length < 2) return results

  for (const [vl, book] of Object.entries(bible) as any) {
    for (const [cn, verses] of Object.entries(book.chapters) as any) {
      for (let i = 0; i < verses.length; i++) {
        if (verses[i].toLowerCase().includes(kw)) {
          results.push({
            reference: `${book.name} ${cn}:${i + 1}`,
            text: verses[i],
          })
          if (results.length >= limit) return results
        }
      }
    }
  }
  return results
}

// Daily verse - deterministic based on date
export function getDailyVerse(): { reference: string; text: string } {
  // Curated list of uplifting verses
  const DAILY_VERSES = [
    { vl: '19', cn: 23, v: 1, end: 3 },  // 시편 23:1-3
    { vl: '43', cn: 3, v: 16 },           // 요한복음 3:16
    { vl: '45', cn: 8, v: 28 },           // 로마서 8:28
    { vl: '23', cn: 41, v: 10 },          // 이사야 41:10
    { vl: '20', cn: 3, v: 5, end: 6 },    // 잠언 3:5-6
    { vl: '19', cn: 46, v: 10 },          // 시편 46:10
    { vl: '50', cn: 4, v: 13 },           // 빌립보서 4:13
    { vl: '19', cn: 27, v: 1 },           // 시편 27:1
    { vl: '40', cn: 11, v: 28, end: 30 }, // 마태복음 11:28-30
    { vl: '46', cn: 13, v: 4, end: 7 },   // 고린도전서 13:4-7
    { vl: '19', cn: 119, v: 105 },        // 시편 119:105
    { vl: '23', cn: 40, v: 31 },          // 이사야 40:31
    { vl: '45', cn: 12, v: 12 },          // 로마서 12:12
    { vl: '49', cn: 2, v: 8, end: 9 },    // 에베소서 2:8-9
    { vl: '19', cn: 91, v: 1, end: 2 },   // 시편 91:1-2
    { vl: '58', cn: 11, v: 1 },           // 히브리서 11:1
    { vl: '19', cn: 37, v: 4, end: 5 },   // 시편 37:4-5
    { vl: '45', cn: 8, v: 38, end: 39 },  // 로마서 8:38-39
    { vl: '24', cn: 29, v: 11 },          // 예레미야 29:11
    { vl: '43', cn: 14, v: 27 },          // 요한복음 14:27
    { vl: '19', cn: 121, v: 1, end: 2 },  // 시편 121:1-2
    { vl: '40', cn: 6, v: 33 },           // 마태복음 6:33
    { vl: '48', cn: 2, v: 20 },           // 갈라디아서 2:20
    { vl: '62', cn: 4, v: 18 },           // 요한1서 4:18
    { vl: '19', cn: 34, v: 18 },          // 시편 34:18
    { vl: '52', cn: 5, v: 16, end: 18 },  // 데살로니가전서 5:16-18
    { vl: '59', cn: 1, v: 2, end: 3 },    // 야고보서 1:2-3
    { vl: '19', cn: 139, v: 13, end: 14 },// 시편 139:13-14
    { vl: '40', cn: 28, v: 20 },          // 마태복음 28:20
    { vl: '23', cn: 43, v: 18, end: 19 }, // 이사야 43:18-19
    { vl: '19', cn: 103, v: 1, end: 2 },  // 시편 103:1-2
  ]

  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  const idx = dayOfYear % DAILY_VERSES.length
  const entry = DAILY_VERSES[idx]

  const bookName = getBookName(entry.vl)
  const verses = getChapter(entry.vl, entry.cn)
  const endV = entry.end || entry.v

  const text = verses.slice(entry.v - 1, endV).join(' ')
  const reference = entry.v === endV
    ? `${bookName} ${entry.cn}:${entry.v}`
    : `${bookName} ${entry.cn}:${entry.v}-${endV}`

  return { reference, text }
}

// Category verses
export interface CategoryVerse { reference: string; text: string }
export interface Category { id: string; name: string; emoji: string; color: string }

export const CATEGORIES: Category[] = [
  { id: 'love', name: '사랑', emoji: '❤️', color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'courage', name: '용기', emoji: '🔥', color: 'from-orange-500/20 to-red-500/20' },
  { id: 'comfort', name: '위로', emoji: '🫂', color: 'from-blue-500/20 to-purple-500/20' },
  { id: 'gratitude', name: '감사', emoji: '🙏', color: 'from-green-500/20 to-emerald-500/20' },
  { id: 'peace', name: '평안', emoji: '🕊️', color: 'from-sky-500/20 to-cyan-500/20' },
  { id: 'wisdom', name: '지혜', emoji: '💎', color: 'from-violet-500/20 to-indigo-500/20' },
  { id: 'hope', name: '소망', emoji: '🌅', color: 'from-amber-500/20 to-yellow-500/20' },
  { id: 'faith', name: '믿음', emoji: '✝️', color: 'from-amber-500/20 to-orange-500/20' },
  { id: 'healing', name: '치유', emoji: '💚', color: 'from-teal-500/20 to-green-500/20' },
  { id: 'strength', name: '힘', emoji: '💪', color: 'from-red-500/20 to-orange-500/20' },
]

const CATEGORY_REFS: Record<string, { vl: string; cn: number; v: number; end?: number }[]> = {
  love: [
    { vl: '46', cn: 13, v: 4, end: 7 }, { vl: '62', cn: 4, v: 8 }, { vl: '62', cn: 4, v: 18 },
    { vl: '43', cn: 3, v: 16 }, { vl: '45', cn: 8, v: 38, end: 39 }, { vl: '43', cn: 15, v: 12, end: 13 },
  ],
  courage: [
    { vl: '23', cn: 41, v: 10 }, { vl: '6', cn: 1, v: 9 }, { vl: '5', cn: 31, v: 6 },
    { vl: '19', cn: 27, v: 1 }, { vl: '55', cn: 1, v: 7 }, { vl: '23', cn: 43, v: 1, end: 2 },
  ],
  comfort: [
    { vl: '19', cn: 23, v: 4 }, { vl: '40', cn: 11, v: 28, end: 30 }, { vl: '47', cn: 1, v: 3, end: 4 },
    { vl: '19', cn: 34, v: 18 }, { vl: '24', cn: 29, v: 11 }, { vl: '43', cn: 14, v: 27 },
  ],
  gratitude: [
    { vl: '52', cn: 5, v: 16, end: 18 }, { vl: '19', cn: 103, v: 1, end: 2 }, { vl: '19', cn: 100, v: 4, end: 5 },
    { vl: '51', cn: 3, v: 17 }, { vl: '19', cn: 118, v: 24 }, { vl: '49', cn: 5, v: 20 },
  ],
  peace: [
    { vl: '50', cn: 4, v: 6, end: 7 }, { vl: '43', cn: 14, v: 27 }, { vl: '23', cn: 26, v: 3 },
    { vl: '19', cn: 46, v: 10 }, { vl: '4', cn: 6, v: 24, end: 26 }, { vl: '45', cn: 15, v: 13 },
  ],
  wisdom: [
    { vl: '20', cn: 3, v: 5, end: 6 }, { vl: '59', cn: 1, v: 5 }, { vl: '20', cn: 1, v: 7 },
    { vl: '19', cn: 119, v: 105 }, { vl: '20', cn: 16, v: 3 }, { vl: '51', cn: 3, v: 16 },
  ],
  hope: [
    { vl: '24', cn: 29, v: 11 }, { vl: '45', cn: 8, v: 28 }, { vl: '23', cn: 40, v: 31 },
    { vl: '45', cn: 15, v: 13 }, { vl: '58', cn: 11, v: 1 }, { vl: '19', cn: 42, v: 11 },
  ],
  faith: [
    { vl: '58', cn: 11, v: 1 }, { vl: '49', cn: 2, v: 8, end: 9 }, { vl: '45', cn: 10, v: 17 },
    { vl: '48', cn: 2, v: 20 }, { vl: '41', cn: 11, v: 24 }, { vl: '40', cn: 17, v: 20 },
  ],
  healing: [
    { vl: '23', cn: 53, v: 5 }, { vl: '19', cn: 147, v: 3 }, { vl: '24', cn: 17, v: 14 },
    { vl: '59', cn: 5, v: 15 }, { vl: '19', cn: 30, v: 2 }, { vl: '2', cn: 15, v: 26 },
  ],
  strength: [
    { vl: '50', cn: 4, v: 13 }, { vl: '23', cn: 40, v: 29 }, { vl: '5', cn: 33, v: 27 },
    { vl: '19', cn: 18, v: 32 }, { vl: '49', cn: 6, v: 10 }, { vl: '19', cn: 73, v: 26 },
  ],
}

export function getCategoryVerses(categoryId: string): CategoryVerse[] {
  const refs = CATEGORY_REFS[categoryId] || []
  return refs.map(entry => {
    const bookName = getBookName(entry.vl)
    const verses = getChapter(entry.vl, entry.cn)
    const endV = entry.end || entry.v
    const text = verses.slice(entry.v - 1, endV).join(' ')
    const reference = entry.v === endV
      ? `${bookName} ${entry.cn}:${entry.v}`
      : `${bookName} ${entry.cn}:${entry.v}-${endV}`
    return { reference, text }
  }).filter(v => v.text)
}
