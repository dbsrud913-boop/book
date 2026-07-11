import { useMemo, useState } from 'react'
import type { Book, Entry } from '../types'
import { getTheme } from '../themes'
import { bookById, sortEntriesDesc, todayStr } from '../utils'

interface Props {
  entries: Entry[]
  books: Book[]
  onOpenCard: (entryId: string) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const ICONS = ['🌅', '🌿', '📖', '💭', '☕️']
const CIRCLES = ['#FBE9DC', '#EAF0DF', '#F3E7EE', '#EBF0EE', '#FBEFDA']

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function iconIndex(e: Entry): number {
  return [...e.id].reduce((a, c) => a + c.charCodeAt(0), 0) % ICONS.length
}

/** 기록 줄 수 (문장/질문/답/남은 질문 중 채운 개수) */
function lineCount(e: Entry): number {
  return [e.read, e.note, e.doit, e.success].filter(Boolean).length
}

/** 월간 캘린더 + 선택한 날의 기록 카드 */
export default function CalendarView({ entries, books, onOpenCard }: Props) {
  const today = todayStr()
  const [ym, setYm] = useState(() => {
    const t = new Date()
    return { y: t.getFullYear(), m: t.getMonth() }
  })
  const [selected, setSelected] = useState(today)

  const byDate = useMemo(() => {
    const m = new Map<string, Entry[]>()
    for (const e of entries) {
      const arr = m.get(e.date) ?? []
      arr.push(e)
      m.set(e.date, arr)
    }
    return m
  }, [entries])

  const sorted = useMemo(() => sortEntriesDesc(entries), [entries])

  const firstDay = new Date(ym.y, ym.m, 1).getDay()
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const recordedThisMonth = Array.from(byDate.keys()).filter((d) =>
    d.startsWith(`${ym.y}-${String(ym.m + 1).padStart(2, '0')}`),
  ).length

  function move(diff: number) {
    setYm(({ y, m }) => {
      const d = new Date(y, m + diff, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  const selectedEntries = byDate.get(selected) ?? []
  const otherRecent = sorted.filter((e) => e.date !== selected).slice(0, 5)
  const [, selM, selD] = selected.split('-')

  return (
    <>
      <div className="cal">
        <div className="cal-head">
          <button onClick={() => move(-1)} aria-label="이전 달">
            ‹
          </button>
          <div className="cal-title">
            {ym.y}년 {ym.m + 1}월
            <span className="cal-count">기록 {recordedThisMonth}일</span>
          </div>
          <button onClick={() => move(1)} aria-label="다음 달">
            ›
          </button>
        </div>

        <div className="cal-grid cal-week">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`cal-wd${i === 0 ? ' sun' : ''}`}>
              {w}
            </div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />
            const date = fmt(ym.y, ym.m, d)
            const dayEntries = byDate.get(date) ?? []
            const cls = [
              'cal-day',
              i % 7 === 0 ? 'sunday' : '',
              date === selected ? 'sel' : '',
              date === today ? 'today' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button key={i} className={cls} onClick={() => setSelected(date)}>
                <span className="n">{d}</span>
                <span className="dots">
                  {dayEntries.slice(0, 3).map((e) => (
                    <i key={e.id} style={{ background: getTheme(e.themeId).accent }} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="section-title">
        {selM}월 {selD}일의 기록
      </div>

      {selectedEntries.length === 0 ? (
        <div className="empty" style={{ padding: '24px 20px' }}>
          이날의 기록이 없어요.
        </div>
      ) : (
        selectedEntries.map((e) => {
          const book = bookById(books, e.bookId)
          if (!book) return null
          const idx = iconIndex(e)
          return (
            <div className="de-card" key={e.id} onClick={() => onOpenCard(e.id)} role="button">
              <div className="de-ico" style={{ background: CIRCLES[idx] }}>
                {ICONS[idx]}
              </div>
              <div className="de-body">
                <div className="de-top">
                  <span className="de-chip">오늘의 질문</span>
                  <span className="de-date">{e.date}</span>
                </div>
                <div className="de-q">{e.note || `“${e.read}”`}</div>
                {e.doit && <div className="de-a">{e.doit}</div>}
                <div className="de-meta">
                  <span>📖 {book.title}</span>
                  {e.minutes ? <span>🕐 {e.minutes}분 읽음</span> : null}
                  <span>✏️ {lineCount(e)}줄 기록</span>
                </div>
              </div>
              <span className="de-chev">›</span>
            </div>
          )
        })
      )}

      {otherRecent.map((e) => {
        const idx = iconIndex(e)
        return (
          <div className="ce-row" key={e.id} onClick={() => onOpenCard(e.id)} role="button">
            <div className="de-ico small" style={{ background: CIRCLES[idx] }}>
              {ICONS[idx]}
            </div>
            <span className="de-chip">오늘의 질문</span>
            <span className="ce-q">{e.note || `“${e.read}”`}</span>
            <span className="ce-date">{e.date}</span>
            <span className="de-chev">›</span>
          </div>
        )
      })}
    </>
  )
}
