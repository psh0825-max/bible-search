import iconv from 'iconv-lite'

const res = await fetch('http://m.holybible.or.kr/mobile/B_GAE/cgi/bibleftxt.php?VR=GAE&VL=19&CN=23&CV=99')
const buf = Buffer.from(await res.arrayBuffer())
const html = iconv.decode(buf, 'euc-kr')

const verses = []
const re = /<li><font class=tk4l>([\s\S]*?)<\/font>/gi
let m
while ((m = re.exec(html)) !== null) {
  let t = m[1].replace(/<a[^>]*>([^<]*)<\/a>/g, '$1').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
  if (t.length > 0) verses.push(t)
}

console.log(`시편 23편: ${verses.length}절`)
verses.forEach((v, i) => console.log(`${i+1}: ${v}`))
