import { useEffect, useMemo, useRef, useState } from 'react'
import type { Book, Entry, JournalData, Settings } from './types'
import { loadData, saveData, exportJson, importJson } from './storage'
import { getTheme, THEMES } from './themes'
import {
  bookById,
  currentStreak,
  progressPercent,
  sortEntriesDesc,
  totalRecordedDays,
} from './utils'
import EntryForm from './components/EntryForm'
import BookForm from './components/BookForm'
import CardModal from './components/CardModal'

type Tab = 'today' | 'timeline' | 'shelf' | 'settings'

export default function App() {
  const [data, setData] = useState<JournalData>(() => loadData())
  const [tab, setTab] = useState<Tab>('today')
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [showBookForm, setShowBookForm] = useState(false)
  const [editBook, setEditBook] = useState<Book | null>(null)
  const [viewEntryId, setViewEntryId] = useState<string | null>(null)

  useEffect(() => {
    saveData(data)
  }, [data])

  const streak = currentStreak(data.entries)
  const totalDays = totalRecordedDays(data.entries)
  const sorted = useMemo(() => sortEntriesDesc(data.entries), [data.entries])
  const viewEntry = viewEntryId ? data.entries.find((e) => e.id === viewEntryId) : null

  // 책별 마지막 기록 페이지 (입력 힌트용)
  const lastPageByBook = useMemo(() => {
    const m: Record<string, number> = {}
    for (const e of sorted) if (!(e.bookId in m)) m[e.bookId] = e.page
    return m
  }, [sorted])

  function upsertEntry(entry: Entry) {
    setData((d) => {
      const exists = d.entries.some((e) => e.id === entry.id)
      return {
        ...d,
        entries: exists ? d.entries.map((e) => (e.id === entry.id ? entry : e)) : [...d.entries, entry],
      }
    })
    setShowEntryForm(false)
    setEditEntry(null)
    setViewEntryId(entry.id) // 저장 후 바로 카드 보여주기
  }

  function deleteEntry(id: string) {
    setData((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) }))
    setViewEntryId(null)
  }

  function upsertBook(book: Book) {
    setData((d) => {
      const exists = d.books.some((b) => b.id === book.id)
      return {
        ...d,
        books: exists ? d.books.map((b) => (b.id === book.id ? book : b)) : [...d.books, book],
      }
    })
    setShowBookForm(false)
    setEditBook(null)
  }

  function deleteBook(id: string) {
    setData((d) => ({
      ...d,
      books: d.books.filter((b) => b.id !== id),
      entries: d.entries.filter((e) => e.bookId !== id),
    }))
    setEditBook(null)
    setShowBookForm(false)
  }

  function updateSettings(patch: Partial<Settings>) {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }

  function setEntryTheme(id: string, themeId: string) {
    setData((d) => ({
      ...d,
      entries: d.entries.map((e) => (e.id === id ? { ...e, themeId } : e)),
    }))
  }

  return (
    <>
      <header className="app-header">
        <div className="app-title">📚 하루 한 장</div>
        <div className="app-streak">
          연속 <b>{streak}일</b> · 누적 <b>{totalDays}일</b>
        </div>
      </header>

      <main className="app-main">
        {tab === 'today' && (
          <TodayTab
            data={data}
            sorted={sorted}
            onWrite={() => setShowEntryForm(true)}
            onOpenCard={(id) => setViewEntryId(id)}
          />
        )}
        {tab === 'timeline' && (
          <TimelineTab data={data} sorted={sorted} onOpenCard={(id) => setViewEntryId(id)} />
        )}
        {tab === 'shelf' && (
          <ShelfTab
            data={data}
            lastPageByBook={lastPageByBook}
            onAdd={() => setShowBookForm(true)}
            onEdit={(b) => {
              setEditBook(b)
              setShowBookForm(true)
            }}
          />
        )}
        {tab === 'settings' && (
          <SettingsTab data={data} onUpdate={updateSettings} onImport={(d) => setData(d)} />
        )}
      </main>

      <nav className="tabbar">
        <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>
          <span className="ico">✏️</span>오늘
        </button>
        <button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}>
          <span className="ico">🗂</span>기록
        </button>
        <button className={tab === 'shelf' ? 'active' : ''} onClick={() => setTab('shelf')}>
          <span className="ico">📚</span>책장
        </button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          <span className="ico">⚙️</span>설정
        </button>
      </nav>

      {(showEntryForm || editEntry) && (
        <EntryForm
          books={data.books}
          settings={data.settings}
          initial={editEntry ?? undefined}
          lastPageByBook={lastPageByBook}
          onSave={upsertEntry}
          onClose={() => {
            setShowEntryForm(false)
            setEditEntry(null)
          }}
          onAddBook={() => setShowBookForm(true)}
        />
      )}

      {showBookForm && (
        <BookForm
          initial={editBook ?? undefined}
          onSave={upsertBook}
          onClose={() => {
            setShowBookForm(false)
            setEditBook(null)
          }}
          onDelete={editBook ? () => deleteBook(editBook.id) : undefined}
        />
      )}

      {viewEntry && bookById(data.books, viewEntry.bookId) && (
        <CardModal
          entry={viewEntry}
          book={bookById(data.books, viewEntry.bookId)!}
          entries={data.entries}
          settings={data.settings}
          onChangeTheme={(tid) => setEntryTheme(viewEntry.id, tid)}
          onEdit={() => {
            setEditEntry(viewEntry)
            setViewEntryId(null)
          }}
          onDelete={() => deleteEntry(viewEntry.id)}
          onClose={() => setViewEntryId(null)}
        />
      )}
    </>
  )
}

/* ---------- 오늘 탭 ---------- */
function TodayTab({
  data,
  sorted,
  onWrite,
  onOpenCard,
}: {
  data: JournalData
  sorted: Entry[]
  onWrite: () => void
  onOpenCard: (id: string) => void
}) {
  const recent = sorted.slice(0, 5)
  return (
    <>
      <button className="btn" style={{ marginTop: 10 }} onClick={onWrite}>
        ✏️ 오늘의 기록 쓰기
      </button>

      {recent.length === 0 ? (
        <div className="empty">
          <span className="big">🌱</span>
          아직 기록이 없어요.
          <br />
          오늘 읽은 책의 한 문장부터 남겨볼까요?
        </div>
      ) : (
        <>
          <div className="section-title">최근 기록</div>
          {recent.map((e) => (
            <EntryListItem key={e.id} entry={e} data={data} onClick={() => onOpenCard(e.id)} />
          ))}
        </>
      )}
    </>
  )
}

/* ---------- 기록(타임라인) 탭 ---------- */
function TimelineTab({
  data,
  sorted,
  onOpenCard,
}: {
  data: JournalData
  sorted: Entry[]
  onOpenCard: (id: string) => void
}) {
  const [bookFilter, setBookFilter] = useState<string>('all')
  const filtered = bookFilter === 'all' ? sorted : sorted.filter((e) => e.bookId === bookFilter)

  const groups: { date: string; items: Entry[] }[] = []
  for (const e of filtered) {
    const g = groups[groups.length - 1]
    if (g && g.date === e.date) g.items.push(e)
    else groups.push({ date: e.date, items: [e] })
  }

  return (
    <>
      {data.books.length > 1 && (
        <div className="book-chips" style={{ marginTop: 10 }}>
          <button
            className={`book-chip ${bookFilter === 'all' ? 'active' : ''}`}
            onClick={() => setBookFilter('all')}
          >
            전체
          </button>
          {data.books.map((b) => (
            <button
              key={b.id}
              className={`book-chip ${bookFilter === b.id ? 'active' : ''}`}
              onClick={() => setBookFilter(b.id)}
            >
              <span>{b.title}</span>
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="empty">
          <span className="big">🗂</span>기록이 쌓이면 여기서 모아볼 수 있어요.
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.date}>
            <div className="tl-date">{g.date}</div>
            {g.items.map((e) => (
              <EntryListItem key={e.id} entry={e} data={data} onClick={() => onOpenCard(e.id)} />
            ))}
          </div>
        ))
      )}
    </>
  )
}

function EntryListItem({
  entry,
  data,
  onClick,
}: {
  entry: Entry
  data: JournalData
  onClick: () => void
}) {
  const book = bookById(data.books, entry.bookId)
  const t = getTheme(entry.themeId)
  if (!book) return null
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
      {entry.read && <div className="tl-quote">“{entry.read}”</div>}
      {entry.note && <div className="tl-note">{entry.note}</div>}
    </div>
  )
}

/* ---------- 책장 탭 ---------- */
function ShelfTab({
  data,
  lastPageByBook,
  onAdd,
  onEdit,
}: {
  data: JournalData
  lastPageByBook: Record<string, number>
  onAdd: () => void
  onEdit: (b: Book) => void
}) {
  const statusLabel: Record<Book['status'], string> = {
    reading: '읽는 중',
    done: '완독 🎉',
    paused: '잠시 멈춤',
  }
  return (
    <>
      <button className="btn secondary" style={{ marginTop: 10 }} onClick={onAdd}>
        ＋ 새 책 추가
      </button>
      {data.books.length === 0 ? (
        <div className="empty">
          <span className="big">📚</span>읽고 있는 책을 추가해 보세요.
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {data.books.map((b) => {
            const last = lastPageByBook[b.id] ?? 0
            const pctNum = b.totalPages ? Math.min(100, (last / b.totalPages) * 100) : 0
            const count = data.entries.filter((e) => e.bookId === b.id).length
            return (
              <div className="shelf-item" key={b.id} onClick={() => onEdit(b)} role="button">
                {b.coverDataUrl ? (
                  <img className="shelf-cover" src={b.coverDataUrl} alt="" />
                ) : (
                  <div className="shelf-cover-ph">📕</div>
                )}
                <div className="shelf-info">
                  <div className="t">{b.title}</div>
                  <div className="a">
                    {b.author}
                    {b.publisher ? ` · ${b.publisher}` : ''}
                  </div>
                  <div className="p">
                    {statusLabel[b.status]} · 기록 {count}회
                    {b.totalPages ? ` · ${last}/${b.totalPages}p` : ''}
                  </div>
                  {b.totalPages > 0 && (
                    <div className="progress-bar">
                      <div style={{ width: `${pctNum}%` }} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ---------- 설정 탭 ---------- */
function SettingsTab({
  data,
  onUpdate,
  onImport,
}: {
  data: JournalData
  onUpdate: (patch: Partial<Settings>) => void
  onImport: (d: JournalData) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function download() {
    const blob = new Blob([exportJson(data)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `독서기록_백업_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function onPickFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const d = importJson(String(reader.result))
        if (confirm(`책 ${d.books.length}권, 기록 ${d.entries.length}개를 불러올까요?\n(현재 데이터를 덮어씁니다)`)) {
          onImport(d)
          alert('불러오기 완료!')
        }
      } catch {
        alert('올바른 백업 파일이 아니에요.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <div className="section-title">카드 꾸미기</div>
      <div className="settings-block">
        <div className="field">
          <label>카드 상단 라벨</label>
          <input
            value={data.settings.appLabel}
            onChange={(e) => onUpdate({ appLabel: e.target.value })}
            placeholder="예: 매일 독서 기록"
          />
        </div>
        <div className="field">
          <label>카드 서명 (닉네임)</label>
          <input
            value={data.settings.signature}
            onChange={(e) => onUpdate({ signature: e.target.value })}
            placeholder="예: @닉네임"
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>기본 카드 컬러</label>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-swatch ${t.id === data.settings.defaultThemeId ? 'active' : ''}`}
                style={{ background: t.bg, color: t.ink }}
                title={t.name}
                onClick={() => onUpdate({ defaultThemeId: t.id })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="section-title">데이터</div>
      <div className="settings-block">
        <p style={{ fontSize: 13, color: 'var(--app-sub)', lineHeight: 1.7, marginBottom: 12 }}>
          기록은 이 기기(브라우저)에 저장돼요. 기기를 바꾸거나 브라우저 데이터를 지우기 전에 꼭
          백업해 두세요.
        </p>
        <div className="row">
          <button className="btn secondary" onClick={download}>
            ⬇️ 백업 내보내기
          </button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()}>
            ⬆️ 백업 불러오기
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])}
        />
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--app-sub)', marginTop: 24 }}>
        하루 한 장 · 매일 독서 기록 v0.1
      </p>
    </>
  )
}
