import { useState } from 'react'
import type { Book, Entry, Settings } from '../types'
import { uid } from '../storage'
import { THEMES } from '../themes'
import { todayStr } from '../utils'

interface Props {
  books: Book[]
  settings: Settings
  initial?: Entry // 수정 모드
  lastPageByBook: Record<string, number>
  onSave: (entry: Entry) => void
  onClose: () => void
  onAddBook: () => void
}

export default function EntryForm({
  books,
  settings,
  initial,
  lastPageByBook,
  onSave,
  onClose,
  onAddBook,
}: Props) {
  const readingBooks = books.filter((b) => b.status !== 'done' || b.id === initial?.bookId)
  const [bookId, setBookId] = useState(initial?.bookId ?? readingBooks[0]?.id ?? '')
  const [date, setDate] = useState(initial?.date ?? todayStr())
  const [page, setPage] = useState(initial ? String(initial.page || '') : '')
  const [minutes, setMinutes] = useState(initial?.minutes ? String(initial.minutes) : '')
  const [read, setRead] = useState(initial?.read ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [doit, setDoit] = useState(initial?.doit ?? '')
  const [success, setSuccess] = useState(initial?.success ?? '')
  const [themeId, setThemeId] = useState(initial?.themeId ?? settings.defaultThemeId)

  const book = books.find((b) => b.id === bookId)
  const canSave = !!bookId && !!date && (read.trim() || note.trim() || doit.trim())

  function save() {
    if (!canSave) return
    onSave({
      id: initial?.id ?? uid(),
      bookId,
      date,
      page: Number(page) || 0,
      minutes: Number(minutes) || undefined,
      read: read.trim(),
      note: note.trim(),
      doit: doit.trim(),
      success: success.trim() || undefined,
      themeId,
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

        <div className="field">
          <label>📖 오늘 문장 (Read) — 마음에 남은 구절</label>
          <textarea
            value={read}
            onChange={(e) => setRead(e.target.value)}
            placeholder="책 속에서 마음에 남은 문장을 옮겨 적어요"
          />
        </div>
        <div className="field">
          <label>💬 오늘 생각 (Note) — 내 생각</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="그 문장을 읽고 든 생각을 적어요"
          />
        </div>
        <div className="field">
          <label>✍️ 오늘 행동 (Do it) — 삶에 적용할 한 가지</label>
          <textarea
            value={doit}
            onChange={(e) => setDoit(e.target.value)}
            placeholder="오늘 실천해 볼 행동 한 가지"
            style={{ minHeight: 60 }}
          />
        </div>
        <div className="field">
          <label>🏆 성공일기 (선택) — 어제 행동, 실천했나요?</label>
          <textarea
            value={success}
            onChange={(e) => setSuccess(e.target.value)}
            placeholder="실천한 것, 잘한 것을 칭찬해 줘요"
            style={{ minHeight: 60 }}
          />
        </div>

        <div className="field">
          <label>카드 컬러</label>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-swatch ${t.id === themeId ? 'active' : ''}`}
                style={{ background: t.bg, color: t.ink }}
                title={t.name}
                onClick={() => setThemeId(t.id)}
              />
            ))}
          </div>
        </div>

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
