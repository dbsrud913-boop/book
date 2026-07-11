import { useMemo } from 'react'
import type { Book, Entry } from '../types'
import { getTheme, THEMES } from '../themes'
import { bookDayIndex, progressPercent, sortEntriesDesc } from '../utils'
import EntryListItem from './EntryListItem'

interface Props {
  book: Book
  entries: Entry[] // 전체 기록
  onBack: () => void
  onEdit: () => void
  onOpenCard: (entryId: string) => void
}

export function bookPlaceholderTheme(book: Book) {
  const hash = [...book.id].reduce((a, c) => a + c.charCodeAt(0), 0)
  return THEMES[hash % THEMES.length]
}

const STATUS_LABEL: Record<Book['status'], string> = {
  reading: '읽는 중',
  done: '완독 🎉',
  paused: '잠시 멈춤',
}

/** 책 상세 — 함께한 기간·기록 통계와 그 책의 모든 기록 */
export default function BookDetail({ book, entries, onBack, onEdit, onOpenCard }: Props) {
  const bookEntries = useMemo(
    () => sortEntriesDesc(entries.filter((e) => e.bookId === book.id)),
    [entries, book.id],
  )
  const dates = bookEntries.map((e) => e.date).sort()
  const first = dates[0]
  const last = dates[dates.length - 1]
  const recordedDays = new Set(dates).size
  const spanDays = last ? bookDayIndex(entries, book.id, last) : 0
  const latest = bookEntries[0]
  const lastPage = latest?.page ?? 0
  const totalMinutes = bookEntries.reduce((sum, e) => sum + (e.minutes ?? 0), 0)
  const pct = progressPercent(lastPage, book.totalPages)
  const pctNum = book.totalPages ? Math.min(100, (lastPage / book.totalPages) * 100) : 0
  const ph = bookPlaceholderTheme(book)

  return (
    <>
      <button className="bd-back" onClick={onBack}>
        ← 책장으로
      </button>

      <div className="bd-head">
        {book.coverDataUrl ? (
          <img className="bd-cover" src={book.coverDataUrl} alt="" />
        ) : (
          <div className="bd-cover ph" style={{ background: ph.bg, color: ph.ink }}>
            <span>{book.title}</span>
          </div>
        )}
        <div className="bd-info">
          <div className="bd-title">{book.title}</div>
          <div className="bd-author">
            {book.author}
            {book.publisher ? ` · ${book.publisher}` : ''}
          </div>
          <div className="bd-badges">
            <span className="badge">{STATUS_LABEL[book.status]}</span>
            {book.category && <span className="badge">{book.category}</span>}
          </div>
          <button className="btn ghost small" style={{ marginTop: 10 }} onClick={onEdit}>
            정보 수정
          </button>
        </div>
      </div>

      {bookEntries.length > 0 ? (
        <>
          <div className="bd-stats">
            <div className="bd-stat">
              <div className="k">함께한 기간</div>
              <div className="v">{spanDays}일</div>
              <div className="s">
                {first}
                {last && last !== first ? ` ~ ${last}` : ''}
              </div>
            </div>
            <div className="bd-stat">
              <div className="k">기록</div>
              <div className="v">{bookEntries.length}회</div>
              <div className="s">기록한 날 {recordedDays}일</div>
            </div>
            <div className="bd-stat">
              <div className="k">진행률</div>
              <div className="v">{book.totalPages > 0 ? pct : `${lastPage}p`}</div>
              {book.totalPages > 0 && (
                <>
                  <div className="progress-bar">
                    <div style={{ width: `${pctNum}%` }} />
                  </div>
                  <div className="s">
                    {lastPage}/{book.totalPages}p
                  </div>
                </>
              )}
            </div>
            <div className="bd-stat">
              <div className="k">독서 시간</div>
              <div className="v">
                {totalMinutes >= 60
                  ? `${Math.floor(totalMinutes / 60)}시간 ${totalMinutes % 60}분`
                  : `${totalMinutes}분`}
              </div>
              <div className="s">기록된 시간 합계</div>
            </div>
          </div>

          <div className="section-title">이 책의 기록 · 질문들</div>
          {bookEntries.map((e) => (
            <EntryListItem key={e.id} entry={e} book={book} onClick={() => onOpenCard(e.id)} />
          ))}
        </>
      ) : (
        <div className="empty">
          <span className="big">🌱</span>이 책의 첫 기록을 남겨보세요.
        </div>
      )}
    </>
  )
}
