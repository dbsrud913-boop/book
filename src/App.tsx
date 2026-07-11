import { useEffect, useMemo, useRef, useState } from 'react'
import type { Book, Entry, JournalData, Settings } from './types'
import { loadData, saveData, exportJson, importJson } from './storage'
import {
  bookById,
  currentStreak,
  progressPercent,
  sortEntriesDesc,
  todayStr,
  totalRecordedDays,
} from './utils'
import EntryForm from './components/EntryForm'
import BookForm from './components/BookForm'
import CardModal from './components/CardModal'
import EntryListItem from './components/EntryListItem'
import BookDetail, { bookPlaceholderTheme } from './components/BookDetail'
import CalendarView from './components/CalendarView'

type Tab = 'today' | 'timeline' | 'shelf' | 'settings'

export default function App() {
  const [data, setData] = useState<JournalData>(() => loadData())
  const [tab, setTab] = useState<Tab>('today')
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [showBookForm, setShowBookForm] = useState(false)
  const [editBook, setEditBook] = useState<Book | null>(null)
  const [viewEntryId, setViewEntryId] = useState<string | null>(null)
  const [detailBookId, setDetailBookId] = useState<string | null>(null)
  const [presetBookId, setPresetBookId] = useState<string | null>(null)

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
    setPresetBookId(null)
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
    setDetailBookId(null)
  }

  function setEntryTheme(id: string, themeId: string) {
    setData((d) => ({
      ...d,
      entries: d.entries.map((e) => (e.id === id ? { ...e, themeId } : e)),
    }))
  }

  function updateSettings(patch: Partial<Settings>) {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }

  return (
    <>
      <header className="app-header">
        <div className="app-title">
          📚 책에 묻다 <span className="app-subtitle">오늘의 독서</span>
        </div>
        <div className="app-streak">
          🔥 연속 <b>{streak}일</b> · 누적 <b>{totalDays}일</b>
        </div>
      </header>

      <main className="app-main">
        {tab === 'today' && (
          <TodayTab
            data={data}
            sorted={sorted}
            onWrite={() => setShowEntryForm(true)}
            onOpenCard={(id) => setViewEntryId(id)}
            onGoTimeline={() => setTab('timeline')}
          />
        )}
        {tab === 'timeline' && (
          <TimelineTab data={data} sorted={sorted} onOpenCard={(id) => setViewEntryId(id)} />
        )}
        {tab === 'shelf' &&
          (detailBookId && bookById(data.books, detailBookId) ? (
            <BookDetail
              book={bookById(data.books, detailBookId)!}
              entries={data.entries}
              onBack={() => setDetailBookId(null)}
              onEdit={() => {
                setEditBook(bookById(data.books, detailBookId)!)
                setShowBookForm(true)
              }}
              onWrite={() => {
                setPresetBookId(detailBookId)
                setShowEntryForm(true)
              }}
              onOpenCard={(id) => setViewEntryId(id)}
            />
          ) : (
            <ShelfTab
              data={data}
              onAdd={() => setShowBookForm(true)}
              onOpen={(b) => setDetailBookId(b.id)}
            />
          ))}
        {tab === 'settings' && (
          <SettingsTab data={data} onUpdate={updateSettings} onImport={(d) => setData(d)} />
        )}
      </main>

      <nav className="tabbar">
        <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>
          <span className="ico">✏️</span>오늘
        </button>
        <button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}>
          <span className="ico">🗂</span>나의 기록
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
          defaultBookId={presetBookId ?? sorted[0]?.bookId}
          lastPageByBook={lastPageByBook}
          onSave={upsertEntry}
          onClose={() => {
            setShowEntryForm(false)
            setEditEntry(null)
            setPresetBookId(null)
          }}
          onAddBook={() => setShowBookForm(true)}
        />
      )}

      {showBookForm && (
        <BookForm
          initial={editBook ?? undefined}
          kakaoApiKey={data.settings.kakaoApiKey}
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

/* ---------- 오늘 탭 (메인) ---------- */
function TodayTab({
  data,
  sorted,
  onWrite,
  onOpenCard,
  onGoTimeline,
}: {
  data: JournalData
  sorted: Entry[]
  onWrite: () => void
  onOpenCard: (id: string) => void
  onGoTimeline: () => void
}) {
  const today = todayStr()
  const todayEntries = sorted.filter((e) => e.date === today)
  const recent = sorted.slice(0, 5)

  return (
    <>
      <div className="today-top">
        <p className="today-tagline">
          책은 답을 주지 않는다.
          <br />
          좋은 질문을 남길 뿐이다.
        </p>
        <button className="cal-link" onClick={onGoTimeline}>
          📅 기록 캘린더 보기 ›
        </button>
      </div>

      <div className="hero">
        {todayEntries.length === 0 ? (
          <>
            <div className="hero-sub">아직 오늘의 기록이 없어요</div>
            <div className="hero-q">
              책 속 문장이 오늘,
              <br />
              나에게 어떤 질문을 던졌나요?
            </div>
            <div className="hero-hint">질문을 받고, 생각을 남겨보세요.</div>
            <button className="btn hero-btn" onClick={onWrite}>
              ✏️ 오늘의 기록 쓰기
            </button>
          </>
        ) : (
          <>
            <div className="hero-sub">오늘의 기록 {todayEntries.length}개 완료 ✔</div>
            <div
              className="hero-q"
              style={{
                fontSize: (todayEntries[0].note || '').length > 60 ? 17 : 21,
              }}
            >
              {todayEntries[0].note || '오늘의 기록을 남겼어요.'}
            </div>
            <div className="hero-actions">
              <button className="btn small" onClick={() => onOpenCard(todayEntries[0].id)}>
                🖼 카드 보기
              </button>
              <button className="btn ghost small" onClick={onWrite}>
                ✏️ 기록 더 쓰기
              </button>
            </div>
          </>
        )}
      </div>

      {recent.length > 0 && (
        <>
          <div className="sec-row">
            <span className="sec-title">🔖 최근 나의 답변</span>
            <button className="link-btn" onClick={onGoTimeline}>
              전체 보기 ›
            </button>
          </div>
          {recent.map((e) => {
            const book = bookById(data.books, e.bookId)
            if (!book) return null
            const ph = bookPlaceholderTheme(book)
            return (
              <div className="qa-item" key={e.id} onClick={() => onOpenCard(e.id)} role="button">
                {book.coverDataUrl ? (
                  <img className="qa-cover" src={book.coverDataUrl} alt="" />
                ) : (
                  <div className="qa-cover ph" style={{ background: ph.bg, color: ph.ink }}>
                    📖
                  </div>
                )}
                <div className="qa-body">
                  <div className="q">{e.note || `“${e.read}”`}</div>
                  <div className="a">{e.doit || e.read}</div>
                </div>
                <div className="qa-meta">
                  {e.date.split('-').join('.')}
                  <span className="chev">›</span>
                </div>
              </div>
            )
          })}
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
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
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
      <div className="ratio-toggle" style={{ marginTop: 10 }}>
        <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>
          📅 캘린더
        </button>
        <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
          ☰ 목록
        </button>
      </div>

      {view === 'calendar' && (
        <CalendarView entries={data.entries} books={data.books} onOpenCard={onOpenCard} />
      )}

      {view === 'list' && data.books.length > 1 && (
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

      {view === 'list' &&
      groups.length === 0 ? (
        <div className="empty">
          <span className="big">🗂</span>기록이 쌓이면 여기서 모아볼 수 있어요.
        </div>
      ) : (
        view === 'list' &&
        groups.map((g) => (
          <div key={g.date}>
            <div className="tl-date">{g.date}</div>
            {g.items.map((e) => (
              <EntryListItem key={e.id} entry={e} book={bookById(data.books, e.bookId)} onClick={() => onOpenCard(e.id)} />
            ))}
          </div>
        ))
      )}
    </>
  )
}

/* ---------- 책장 탭 ---------- */
const STATUS_META: Record<Book['status'], { label: string; cls: string }> = {
  reading: { label: '읽는 중', cls: 'reading' },
  done: { label: '완독', cls: 'done' },
  paused: { label: '보류', cls: 'paused' },
}

function BookCover({ book, className }: { book: Book; className: string }) {
  if (book.coverDataUrl) return <img className={className} src={book.coverDataUrl} alt="" />
  const ph = bookPlaceholderTheme(book)
  return (
    <div className={`${className} ph`} style={{ background: ph.bg, color: ph.ink }}>
      <span>{book.title}</span>
    </div>
  )
}

function ShelfTab({
  data,
  onAdd,
  onOpen,
}: {
  data: JournalData
  onAdd: () => void
  onOpen: (b: Book) => void
}) {
  const [filter, setFilter] = useState<'all' | Book['status']>('all')
  const today = todayStr()

  // 책별 최신/오늘 기록 요약
  const info = useMemo(() => {
    const m = new Map<string, { last?: Entry; todayEntry?: Entry; count: number }>()
    for (const b of data.books) m.set(b.id, { count: 0 })
    for (const e of sortEntriesDesc(data.entries)) {
      const i = m.get(e.bookId)
      if (!i) continue
      i.count++
      if (!i.last) i.last = e
      if (e.date === today && !i.todayEntry) i.todayEntry = e
    }
    return m
  }, [data, today])

  const reading = data.books.filter((b) => b.status === 'reading')
  const filtered = filter === 'all' ? data.books : data.books.filter((b) => b.status === filter)

  const FILTERS: { key: 'all' | Book['status']; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'reading', label: '읽는 중' },
    { key: 'done', label: '완독' },
    { key: 'paused', label: '보류' },
  ]

  return (
    <>
      <button className="btn secondary" style={{ marginTop: 10 }} onClick={onAdd}>
        ＋ 새 책 추가
      </button>

      {data.books.length === 0 && (
        <div className="empty">
          <span className="big">📚</span>읽고 있는 책을 추가해 보세요.
        </div>
      )}

      {reading.length > 0 && (
        <>
          <div className="shelf-head">
            <span>읽는 중</span>
            <span className="cnt">{reading.length}권</span>
          </div>
          {reading.map((b) => {
            const i = info.get(b.id)
            const last = i?.last
            const pctNum = b.totalPages && last ? Math.min(100, (last.page / b.totalPages) * 100) : 0
            const lines = i?.todayEntry
              ? [i.todayEntry.read, i.todayEntry.note, i.todayEntry.doit, i.todayEntry.success].filter(Boolean).length
              : 0
            return (
              <div key={b.id}>
                <div className="feat" onClick={() => onOpen(b)} role="button">
                  <BookCover book={b} className="feat-cover" />
                  <div className="feat-info">
                    <div className="feat-chips">
                      <span className="bk-status reading">읽는 중</span>
                      {b.category && <span className="bk-cat">{b.category}</span>}
                    </div>
                    <div className="feat-title">{b.title}</div>
                    {b.author && <div className="feat-author">{b.author}</div>}
                    {b.totalPages > 0 && (
                      <>
                        <div className="feat-prog">
                          <b>{Math.round(pctNum)}%</b> {last?.page ?? 0} / {b.totalPages}p
                        </div>
                        <div className="progress-bar">
                          <div style={{ width: `${pctNum}%` }} />
                        </div>
                      </>
                    )}
                    <div className="feat-meta">
                      {i?.todayEntry ? (
                        <>
                          {i.todayEntry.minutes ? <span>🕐 오늘 {i.todayEntry.minutes}분 읽음</span> : <span>🕐 오늘 기록함</span>}
                          <span>✏️ {lines}줄 기록</span>
                        </>
                      ) : (
                        <span>✏️ 기록 {i?.count ?? 0}회{last ? ` · 마지막 ${last.date}` : ''}</span>
                      )}
                    </div>
                  </div>
                  <span className="de-chev">›</span>
                </div>
                <div className="shelf-plank" />
              </div>
            )
          })}
        </>
      )}

      {data.books.length > 0 && (
        <>
          <div className="shelf-head">
            <span>내 책장</span>
            <span className="cnt">{data.books.length}권</span>
          </div>
          <div className="filter-chips">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={filter === f.key ? 'active' : ''}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="empty" style={{ padding: '24px 20px' }}>
              해당하는 책이 없어요.
            </div>
          ) : (
            filtered.map((b) => {
              const st = STATUS_META[b.status]
              const last = info.get(b.id)?.last
              return (
                <div className="bk-row" key={b.id} onClick={() => onOpen(b)} role="button">
                  <BookCover book={b} className="bk-cover" />
                  <div className="bk-info">
                    <div className="t">{b.title}</div>
                    {b.author && <div className="a">{b.author}</div>}
                    {b.category && <div className="c">{b.category}</div>}
                  </div>
                  <div className="bk-right">
                    <span className={`bk-status ${st.cls}`}>{st.label}</span>
                    <span className="bk-date">
                      {(last?.date ?? b.createdAt.slice(0, 10)).split('-').join('.')}
                    </span>
                  </div>
                  <span className="de-chev">›</span>
                </div>
              )
            })
          )}
        </>
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
            placeholder="예: 책에 묻다"
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>카드 서명 (닉네임)</label>
          <input
            value={data.settings.signature}
            onChange={(e) => onUpdate({ signature: e.target.value })}
            placeholder="예: @닉네임"
          />
        </div>
      </div>

      <div className="section-title">책 검색</div>
      <div className="settings-block">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>카카오 REST API 키 (선택 — 등록하면 한국 책 검색이 잘 돼요)</label>
          <input
            value={data.settings.kakaoApiKey ?? ''}
            onChange={(e) => onUpdate({ kakaoApiKey: e.target.value.trim() })}
            placeholder="카카오 개발자 사이트에서 발급한 REST API 키"
          />
          <p style={{ fontSize: 12.5, color: 'var(--app-sub)', lineHeight: 1.7, marginTop: 8 }}>
            developers.kakao.com → 로그인 → [내 애플리케이션] → [애플리케이션 추가] →
            앱 이름 아무거나 입력해 생성 → <b>REST API 키</b>를 복사해서 여기에 붙여넣으세요.
            무료(하루 3만 회)이고, 키는 이 기기에만 저장돼요.
          </p>
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
        책에 묻다 · 오늘의 독서 v0.1
      </p>
    </>
  )
}
