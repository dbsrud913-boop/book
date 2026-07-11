import { useState } from 'react'
import type { Book, Entry, Settings } from '../types'
import { uid } from '../storage'
import { DEFAULT_THEME_ID } from '../themes'
import { todayStr } from '../utils'
import { SECTIONS, type SectionLabel } from '../labels'

interface Props {
  books: Book[]
  settings: Settings
  initial?: Entry // 수정 모드
  defaultBookId?: string // 미리 선택할 책 (마지막 기록 책 or 상세 페이지에서 진입)
  lastPageByBook: Record<string, number>
  onSave: (entry: Entry) => void
  onClose: () => void
  onAddBook: () => void
}

export default function EntryForm({
  books,
  settings,
  initial,
  defaultBookId,
  lastPageByBook,
  onSave,
  onClose,
  onAddBook,
}: Props) {
  const readingBooks = books.filter(
    (b) => b.status !== 'done' || b.id === initial?.bookId || b.id === defaultBookId,
  )
  const preset =
    initial?.bookId ??
    (defaultBookId && readingBooks.some((b) => b.id === defaultBookId)
      ? defaultBookId
      : readingBooks[0]?.id) ??
    ''
  const [bookId, setBookId] = useState(preset)
  const [date, setDate] = useState(initial?.date ?? todayStr())
  const [page, setPage] = useState(initial ? String(initial.page || '') : '')
  const [minutes, setMinutes] = useState(initial?.minutes ? String(initial.minutes) : '')
  const [texts, setTexts] = useState<Record<SectionLabel['key'], string>>({
    read: initial?.read ?? '',
    note: initial?.note ?? '',
    doit: initial?.doit ?? '',
    success: initial?.success ?? '',
  })
  const book = books.find((b) => b.id === bookId)
  const canSave =
    !!bookId && !!date && (texts.read.trim() || texts.note.trim() || texts.doit.trim())

  function save() {
    if (!canSave) return
    onSave({
      id: initial?.id ?? uid(),
      bookId,
      date,
      page: Number(page) || 0,
      minutes: Number(minutes) || undefined,
      read: texts.read.trim(),
      note: texts.note.trim(),
      doit: texts.doit.trim(),
      success: texts.success.trim() || undefined,
      themeId: DEFAULT_THEME_ID,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial ? '기록 수정' : '오늘의 기록'}</h2>
          <button onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="field">
          <label>어떤 책인가요?</label>
          <div className="book-chips">
            {readingBooks.map((b) => (
              <button
                key={b.id}
                className={`book-chip ${b.id === bookId ? 'active' : ''}`}
                onClick={() => setBookId(b.id)}
              >
                {b.coverDataUrl && <img className="cover" src={b.coverDataUrl} alt="" />}
                <span>{b.title}</span>
              </button>
            ))}
            <button className="book-chip" onClick={onAddBook}>
              ＋ 새 책
            </button>
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>
              오늘까지 읽은 페이지
              {book?.totalPages ? ` (전체 ${book.totalPages}p)` : ''}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder={
                book && lastPageByBook[book.id] ? `지난 기록 ${lastPageByBook[book.id]}p` : '예: 34'
              }
            />
          </div>
        </div>

        <div className="field">
          <label>독서 시간 (분, 선택)</label>
          <input
            type="number"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="예: 13"
          />
        </div>

        {SECTIONS.map((s) => (
          <div className="field" key={s.key}>
            <label>{s.formLabel}</label>
            <textarea
              value={texts[s.key]}
              onChange={(e) => setTexts((t) => ({ ...t, [s.key]: e.target.value }))}
              placeholder={s.placeholder}
              style={s.optional ? { minHeight: 60 } : undefined}
            />
          </div>
        ))}

        <button className="btn" disabled={!canSave} onClick={save}>
          {initial ? '수정 완료' : '기록 저장'}
        </button>
        {!canSave && books.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--app-sub)' }}>
            먼저 위의 「＋ 새 책」으로 책을 추가해 주세요
          </p>
        )}
      </div>
    </div>
  )
}
