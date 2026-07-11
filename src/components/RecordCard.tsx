import { forwardRef } from 'react'
import type { Book, Entry, Settings } from '../types'
import { getTheme } from '../themes'
import { bookDayIndex, progressPercent, totalRecordedDays } from '../utils'

interface Props {
  entry: Entry
  book: Book
  entries: Entry[] // 일수 계산용 전체 기록
  settings: Settings
  startDate: string | null
}

/** SNS 공유용 기록 카드 — 이 DOM이 그대로 PNG로 내보내진다 */
const RecordCard = forwardRef<HTMLDivElement, Props>(function RecordCard(
  { entry, book, entries, settings, startDate },
  ref,
) {
  const t = getTheme(entry.themeId)
  const dayIdx = bookDayIndex(entries, book.id, entry.date)
  const totalDays = totalRecordedDays(entries)
  const pct = progressPercent(entry.page, book.totalPages)

  return (
    <div ref={ref} className="record-card" style={{ background: t.bg, color: t.ink }}>
      <div className="frame" style={{ borderColor: t.line }}>
        <div className="rc-top">
          <div className="rc-label" style={{ color: t.accent }}>
            ◆ {settings.appLabel}
            {book.category ? ` · ${book.category}` : ''}
          </div>
          <div className="rc-days">
            <div className="d1">{dayIdx}일째</div>
            <div className="d2" style={{ color: t.sub }}>
              누적 {totalDays}일째
            </div>
          </div>
        </div>

        <div className="rc-title">{book.title}</div>

        <div className="rc-meta" style={{ color: t.sub }}>
          {startDate ? `${startDate} 시작 · ` : ''}오늘 {entry.date}
          {pct ? ` · ${pct} (${entry.page}/${book.totalPages}p)` : ` · ${entry.page}p`}
          {entry.minutes ? ` · ⏱ ${entry.minutes}분 독서` : ''}
        </div>

        <hr className="rc-hr" style={{ borderColor: t.line }} />

        <div className="rc-body">
          {entry.read && (
            <div className="rc-sec">
              <div className="rc-sec-title" style={{ color: t.accent }}>
                📖 오늘 문장 (Read)
              </div>
              <div className="rc-sec-text quote">{entry.read}</div>
            </div>
          )}
          {entry.note && (
            <div className="rc-sec">
              <div className="rc-sec-title" style={{ color: t.accent }}>
                💬 오늘 생각 (Note)
              </div>
              <div className="rc-sec-text">{entry.note}</div>
            </div>
          )}
          {entry.doit && (
            <div className="rc-sec">
              <div className="rc-sec-title" style={{ color: t.accent }}>
                ✍️ 오늘 행동 (Do it)
              </div>
              <div className="rc-sec-text">{entry.doit}</div>
            </div>
          )}
          {entry.success && (
            <div className="rc-sec">
              <div className="rc-sec-title" style={{ color: t.accent }}>
                🏆 성공일기
              </div>
              <div className="rc-sec-text">{entry.success}</div>
            </div>
          )}
        </div>

        <div className="rc-bottom" style={{ borderColor: t.line }}>
          {book.coverDataUrl ? (
            <img className="rc-cover" src={book.coverDataUrl} alt="" />
          ) : (
            <div className="rc-cover-ph" style={{ borderColor: t.line }}>
              📕
            </div>
          )}
          <div className="rc-bookinfo">
            <div className="t">{book.title}</div>
            <div className="a" style={{ color: t.sub }}>
              {book.author}
              {book.publisher ? ` · ${book.publisher}` : ''}
            </div>
          </div>
          {settings.signature && (
            <div className="rc-sign" style={{ color: t.accent }}>
              ✎ {settings.signature}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default RecordCard
