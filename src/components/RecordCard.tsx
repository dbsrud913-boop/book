import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import type { Book, Entry, Settings } from '../types'
import { getTheme } from '../themes'
import { bookDayIndex, progressPercent, totalRecordedDays } from '../utils'

export type CardRatio = '45' | '11'

interface Props {
  entry: Entry
  book: Book
  entries: Entry[] // 일수 계산용 전체 기록
  settings: Settings
  startDate: string | null
  ratio?: CardRatio
}

/**
 * SNS 공유용 기록 카드 — 이 DOM이 그대로 PNG로 내보내진다.
 * 질문(❓)이 헤드라인이 되는 구성. 인스타그램 규격에 맞춘 고정 비율이라
 * 내용이 길면 글자 크기를 자동으로 줄여서(scale) 안에 맞춘다.
 */
const RecordCard = forwardRef<HTMLDivElement, Props>(function RecordCard(
  { entry, book, entries, settings, startDate, ratio = '45' },
  ref,
) {
  const t = getTheme(entry.themeId)
  const dayIdx = bookDayIndex(entries, book.id, entry.date)
  const totalDays = totalRecordedDays(entries)
  const pct = progressPercent(entry.page, book.totalPages)
  const pctNum = book.totalPages ? Math.min(100, (entry.page / book.totalPages) * 100) : 0

  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    setScale(1)
  }, [entry.id, entry.read, entry.note, entry.doit, entry.success, ratio])

  // 내용이 넘치면 한 단계씩 글자를 줄여가며 카드 안에 맞춘다
  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    if (el.scrollHeight > el.clientHeight + 1 && scale > 0.6) {
      setScale((s) => Math.max(0.6, +(s - 0.04).toFixed(2)))
    }
  })

  const chipBg = `color-mix(in srgb, ${t.accent} 16%, transparent)`
  const panelBg = `color-mix(in srgb, ${t.ink} 9%, transparent)`
  const trackBg = `color-mix(in srgb, ${t.ink} 16%, transparent)`

  return (
    <div
      ref={ref}
      className="record-card rc2"
      style={{
        background: t.bg,
        color: t.ink,
        fontSize: 15 * scale,
        aspectRatio: ratio === '45' ? '4 / 5' : '1 / 1',
      }}
    >
      <div className="rc2-in" ref={innerRef}>
        <div className="rc2-ghost" style={{ color: t.accent }}>
          ?
        </div>

        <header className="rc2-top">
          <span className="rc2-chip" style={{ background: chipBg, color: t.accent }}>
            {settings.appLabel}
            {book.category ? ` · ${book.category}` : ''}
          </span>
          <div className="rc2-day">
            <div className="n">DAY {dayIdx}</div>
            <div className="s" style={{ color: t.sub }}>
              누적 {totalDays}일
            </div>
          </div>
        </header>

        {entry.note && (
          <div className="rc2-hero">
            <div className="rc2-cap" style={{ color: t.accent }}>
              오늘, 나에게 묻다
            </div>
            <div className="rc2-q">{entry.note}</div>
          </div>
        )}

        {entry.read && (
          <div className="rc2-block">
            <div className="rc2-cap" style={{ color: t.accent }}>
              질문을 만든 문장
            </div>
            <div className="rc2-quote" style={{ borderColor: t.accent }}>
              {entry.read}
            </div>
          </div>
        )}

        {entry.doit && (
          <div className="rc2-block">
            <div className="rc2-cap" style={{ color: t.accent }}>
              나의 생각
            </div>
            <div className="rc2-think">{entry.doit}</div>
          </div>
        )}

        {entry.success && (
          <div className="rc2-keep" style={{ color: t.sub }}>
            계속 품는 질문 — {entry.success}
          </div>
        )}

        <div className="rc2-spacer" />

        <div className="rc2-meta" style={{ color: t.sub }}>
          {startDate && startDate !== entry.date ? `${startDate} 시작 · ` : ''}
          {entry.date}
          {entry.minutes ? ` · ${entry.minutes}분 읽음` : ''}
        </div>

        <div className="rc2-panel" style={{ background: panelBg }}>
          {book.coverDataUrl ? (
            <img className="rc2-cover" src={book.coverDataUrl} alt="" />
          ) : (
            <div className="rc2-cover ph" style={{ background: trackBg }}>
              📕
            </div>
          )}
          <div className="rc2-bookinfo">
            <div className="t">{book.title}</div>
            <div className="a" style={{ color: t.sub }}>
              {book.author}
              {book.publisher ? ` · ${book.publisher}` : ''}
            </div>
          </div>
          {book.totalPages > 0 && (
            <div className="rc2-prog">
              <div className="p" style={{ color: t.accent }}>
                {pct}
              </div>
              <div className="bar" style={{ background: trackBg }}>
                <div style={{ width: `${pctNum}%`, background: t.accent }} />
              </div>
              <div className="pg" style={{ color: t.sub }}>
                {entry.page}/{book.totalPages}p
              </div>
            </div>
          )}
        </div>

        {settings.signature && (
          <div className="rc2-sign" style={{ color: t.accent }}>
            ✎ {settings.signature}
          </div>
        )}
      </div>
    </div>
  )
})

export default RecordCard
