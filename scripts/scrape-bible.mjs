import iconv from 'iconv-lite'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 66 books: VL=1~39 (OT), VL=40~66 (NT)
const BOOKS = [
  { vl: 1, name: '창세기', abbr: '창', chapters: 50 },
  { vl: 2, name: '출애굽기', abbr: '출', chapters: 40 },
  { vl: 3, name: '레위기', abbr: '레', chapters: 27 },
  { vl: 4, name: '민수기', abbr: '민', chapters: 36 },
  { vl: 5, name: '신명기', abbr: '신', chapters: 34 },
  { vl: 6, name: '여호수아', abbr: '수', chapters: 24 },
  { vl: 7, name: '사사기', abbr: '삿', chapters: 21 },
  { vl: 8, name: '룻기', abbr: '룻', chapters: 4 },
  { vl: 9, name: '사무엘상', abbr: '삼상', chapters: 31 },
  { vl: 10, name: '사무엘하', abbr: '삼하', chapters: 24 },
  { vl: 11, name: '열왕기상', abbr: '왕상', chapters: 22 },
  { vl: 12, name: '열왕기하', abbr: '왕하', chapters: 25 },
  { vl: 13, name: '역대상', abbr: '대상', chapters: 29 },
  { vl: 14, name: '역대하', abbr: '대하', chapters: 36 },
  { vl: 15, name: '에스라', abbr: '스', chapters: 10 },
  { vl: 16, name: '느헤미야', abbr: '느', chapters: 13 },
  { vl: 17, name: '에스더', abbr: '에', chapters: 10 },
  { vl: 18, name: '욥기', abbr: '욥', chapters: 42 },
  { vl: 19, name: '시편', abbr: '시', chapters: 150 },
  { vl: 20, name: '잠언', abbr: '잠', chapters: 31 },
  { vl: 21, name: '전도서', abbr: '전', chapters: 12 },
  { vl: 22, name: '아가', abbr: '아', chapters: 8 },
  { vl: 23, name: '이사야', abbr: '사', chapters: 66 },
  { vl: 24, name: '예레미야', abbr: '렘', chapters: 52 },
  { vl: 25, name: '예레미야 애가', abbr: '애', chapters: 5 },
  { vl: 26, name: '에스겔', abbr: '겔', chapters: 48 },
  { vl: 27, name: '다니엘', abbr: '단', chapters: 12 },
  { vl: 28, name: '호세아', abbr: '호', chapters: 14 },
  { vl: 29, name: '요엘', abbr: '욜', chapters: 3 },
  { vl: 30, name: '아모스', abbr: '암', chapters: 9 },
  { vl: 31, name: '오바댜', abbr: '옵', chapters: 1 },
  { vl: 32, name: '요나', abbr: '욘', chapters: 4 },
  { vl: 33, name: '미가', abbr: '미', chapters: 7 },
  { vl: 34, name: '나훔', abbr: '나', chapters: 3 },
  { vl: 35, name: '하박국', abbr: '합', chapters: 3 },
  { vl: 36, name: '스바냐', abbr: '습', chapters: 3 },
  { vl: 37, name: '학개', abbr: '학', chapters: 2 },
  { vl: 38, name: '스가랴', abbr: '슥', chapters: 14 },
  { vl: 39, name: '말라기', abbr: '말', chapters: 4 },
  { vl: 40, name: '마태복음', abbr: '마', chapters: 28 },
  { vl: 41, name: '마가복음', abbr: '막', chapters: 16 },
  { vl: 42, name: '누가복음', abbr: '눅', chapters: 24 },
  { vl: 43, name: '요한복음', abbr: '요', chapters: 21 },
  { vl: 44, name: '사도행전', abbr: '행', chapters: 28 },
  { vl: 45, name: '로마서', abbr: '롬', chapters: 16 },
  { vl: 46, name: '고린도전서', abbr: '고전', chapters: 16 },
  { vl: 47, name: '고린도후서', abbr: '고후', chapters: 13 },
  { vl: 48, name: '갈라디아서', abbr: '갈', chapters: 6 },
  { vl: 49, name: '에베소서', abbr: '엡', chapters: 6 },
  { vl: 50, name: '빌립보서', abbr: '빌', chapters: 4 },
  { vl: 51, name: '골로새서', abbr: '골', chapters: 4 },
  { vl: 52, name: '데살로니가전서', abbr: '살전', chapters: 5 },
  { vl: 53, name: '데살로니가후서', abbr: '살후', chapters: 3 },
  { vl: 54, name: '디모데전서', abbr: '딤전', chapters: 6 },
  { vl: 55, name: '디모데후서', abbr: '딤후', chapters: 4 },
  { vl: 56, name: '디도서', abbr: '딛', chapters: 3 },
  { vl: 57, name: '빌레몬서', abbr: '몬', chapters: 1 },
  { vl: 58, name: '히브리서', abbr: '히', chapters: 13 },
  { vl: 59, name: '야고보서', abbr: '약', chapters: 5 },
  { vl: 60, name: '베드로전서', abbr: '벧전', chapters: 5 },
  { vl: 61, name: '베드로후서', abbr: '벧후', chapters: 3 },
  { vl: 62, name: '요한1서', abbr: '요일', chapters: 5 },
  { vl: 63, name: '요한2서', abbr: '요이', chapters: 1 },
  { vl: 64, name: '요한3서', abbr: '요삼', chapters: 1 },
  { vl: 65, name: '유다서', abbr: '유', chapters: 1 },
  { vl: 66, name: '요한계시록', abbr: '계', chapters: 22 },
]

const BASE = 'http://m.holybible.or.kr/mobile/B_GAE/cgi/bibleftxt.php'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fetchChapter(vl, cn) {
  const url = `${BASE}?VR=GAE&VL=${vl}&CN=${cn}&CV=99`
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  const html = iconv.decode(buf, 'euc-kr')
  
  // Parse: <li><font class=tk4l>verse text</font>
  const verses = []
  const re = /<li><font class=tk4l>([\s\S]*?)<\/font>/gi
  let match
  while ((match = re.exec(html)) !== null) {
    let text = match[1]
      .replace(/<a[^>]*>([^<]*)<\/a>/g, '$1') // keep link text
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim()
    if (text.length > 0) verses.push(text)
  }
  return verses
}

async function main() {
  const outDir = join(__dirname, '..', 'src', 'data')
  mkdirSync(outDir, { recursive: true })
  
  const bible = {}
  let totalVerses = 0
  
  for (const book of BOOKS) {
    console.log(`📖 ${book.name} (${book.chapters} chapters)...`)
    bible[book.vl] = { name: book.name, abbr: book.abbr, chapters: {} }
    
    for (let cn = 1; cn <= book.chapters; cn++) {
      try {
        const verses = await fetchChapter(book.vl, cn)
        if (verses.length > 0) {
          bible[book.vl].chapters[cn] = verses
          totalVerses += verses.length
        }
        // Be polite
        await sleep(100)
      } catch (err) {
        console.error(`  ❌ ${book.name} ${cn}장 실패:`, err.message)
      }
      
      if (cn % 10 === 0) console.log(`  ... ${cn}/${book.chapters}`)
    }
    
    console.log(`  ✅ ${book.name} 완료`)
  }
  
  console.log(`\n📊 총 ${totalVerses}절 수집 완료!`)
  
  // Save as JSON
  const outPath = join(outDir, 'bible.json')
  writeFileSync(outPath, JSON.stringify(bible), 'utf-8')
  console.log(`💾 저장: ${outPath} (${(Buffer.byteLength(JSON.stringify(bible)) / 1024 / 1024).toFixed(1)}MB)`)
}

main().catch(console.error)
