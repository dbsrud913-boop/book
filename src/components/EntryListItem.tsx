import type { Book, Entry } from '../types'
import { getTheme } from '../themes'
import { progressPercent } from '../utils'

interface Props {
  entry: Entry
  book?: Book
  onClick: () => void
}

/** 타임라인/상세 페이지에서 쓰는 기록 한 줄 미리보기 */
export default function EntryListItem({ entry, book, onClick }: Props) {
  if (!book) return null
  const t = getTheme(entry.themeId)
  const pct = progressPercent(entry.page, book.totalPages)
  return (
    <div className="tl-item" onClick={onClick} role="button">
      <div className="tl-head">
        <div className="tl-dot" style={{ background: t.bg, border: `1px solid ${t.line}` }} />
        <div className="tl-book">{book.title}</div>
        <div className="tl-meta">
          {entry.date}
          {pct ? ` · ${pct}` : ''}
        </div>
      </div>
      {entry.note && <div className="tl-quote">❓ {entry.note}</div>}
      {entry.read && <div className="tl-note">“{entry.read}”</div>}
    </div>
  )
}
