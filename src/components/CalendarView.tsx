import { useMemo, useState } from 'react'
import type { Book, Entry } from '../types'
import { getTheme } from '../themes'
import { bookById, todayStr } from '../utils'
import EntryListItem from './EntryListItem'

interface Props {
  entries: Entry[]
  books: Book[]
  onOpenCard: (entryId: string) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function fmt(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** 월간 캘린더 — 기록이 있는 날은 카드 컬러 점으로 표시, 날짜를 누르면 그날 기록이 아래에 */
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
              date === selected ? 'sel' : '',
              date === today ? 'today' : '',
              dayEntries.length > 0 ? 'has' : '',
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
        {selected === today ? '오늘' : selected.slice(5).replace('-', '월 ') + '일'}의 기록
      </div>
      {selectedEntries.length === 0 ? (
        <div className="empty" style={{ padding: '24px 20px' }}>
          이날의 기록이 없어요.
        </div>
      ) : (
        selectedEntries.map((e) => (
          <EntryListItem
            key={e.id}
            entry={e}
            book={bookById(books, e.bookId)}
            onClick={() => onOpenCard(e.id)}
          />
        ))
      )}
    </>
  )
}
