import { useRef, useState } from 'react'
import type { Book } from '../types'
import { uid } from '../storage'

interface SearchResult {
  id: string
  title: string
  authors: string
  publisher: string
  pages: number
  thumb: string
}

/** Google Books 검색 — 무료, API 키 불필요 */
async function searchGoogleBooks(query: string): Promise<SearchResult[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&printType=books`
  const res = await fetch(url)
  if (!res.ok) throw new Error('search failed')
  const json = await res.json()
  return ((json.items as any[]) ?? []).map((v) => ({
    id: v.id,
    title: v.volumeInfo?.title ?? '',
    authors: ((v.volumeInfo?.authors as string[]) ?? []).join(', '),
    publisher: v.volumeInfo?.publisher ?? '',
    pages: v.volumeInfo?.pageCount ?? 0,
    thumb: (v.volumeInfo?.imageLinks?.thumbnail as string | undefined)?.replace('http://', 'https://') ?? '',
  }))
}

/** Open Library 검색 — 구글이 안 될 때 예비 (무료, 키 불필요) */
async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6&fields=key,title,author_name,publisher,number_of_pages_median,cover_i`
  const res = await fetch(url)
  if (!res.ok) throw new Error('search failed')
  const json = await res.json()
  return ((json.docs as any[]) ?? []).map((d) => ({
    id: d.key ?? d.title,
    title: d.title ?? '',
    authors: ((d.author_name as string[]) ?? []).slice(0, 3).join(', '),
    publisher: ((d.publisher as string[]) ?? [])[0] ?? '',
    pages: d.number_of_pages_median ?? 0,
    thumb: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '',
  }))
}

/** 구글 우선, 실패하면 Open Library로 자동 전환 */
async function searchBooks(query: string): Promise<SearchResult[]> {
  try {
    const g = await searchGoogleBooks(query)
    if (g.length > 0) return g
  } catch {
    // 아래 예비 검색으로
  }
  return searchOpenLibrary(query)
}

const CATEGORIES = [
  '📜 인문과학',
  '🚀 자기계발서',
  '📕 소설',
  '💰 경제경영',
  '🧪 과학',
  '🌸 에세이',
  '🧠 심리',
  '🕊 종교',
  '✏️ 기타',
]

interface Props {
  initial?: Book
  onSave: (book: Book) => void
  onClose: () => void
  onDelete?: () => void
}

export default function BookForm({ initial, onSave, onClose, onDelete }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [publisher, setPublisher] = useState(initial?.publisher ?? '')
  const [totalPages, setTotalPages] = useState(initial ? String(initial.totalPages || '') : '')
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [status, setStatus] = useState<Book['status']>(initial?.status ?? 'reading')
  const [cover, setCover] = useState<string | undefined>(initial?.coverDataUrl)
  const fileRef = useRef<HTMLInputElement>(null)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [searchMsg, setSearchMsg] = useState('')

  async function runSearch() {
    if (!title.trim() || searching) return
    setSearching(true)
    setSearchMsg('')
    setResults(null)
    try {
      const items = await searchBooks(title.trim())
      setResults(items)
      if (items.length === 0) setSearchMsg('검색 결과가 없어요. 아래에 직접 입력해 주세요.')
    } catch {
      setSearchMsg('검색에 실패했어요. 인터넷 연결을 확인하거나 직접 입력해 주세요.')
    } finally {
      setSearching(false)
    }
  }

  async function pickResult(r: SearchResult) {
    setTitle(r.title)
    if (r.authors) setAuthor(r.authors)
    if (r.publisher) setPublisher(r.publisher)
    if (r.pages) setTotalPages(String(r.pages))
    setResults(null)
    setSearchMsg('')
    if (r.thumb && !cover) {
      // 표지는 CORS 정책 때문에 못 가져올 수도 있다 — 실패하면 조용히 넘어감
      try {
        const res = await fetch(r.thumb)
        const blob = await res.blob()
        const dataUrl = await new Promise<string>((ok, err) => {
          const fr = new FileReader()
          fr.onload = () => ok(String(fr.result))
          fr.onerror = err
          fr.readAsDataURL(blob)
        })
        setCover(dataUrl)
      } catch {
        setSearchMsg('책 정보를 채웠어요. 표지는 가져오지 못해서 사진으로 직접 추가할 수 있어요.')
      }
    }
  }

  function onPickCover(file: File) {
    // 표지를 작게 리사이즈해서 저장 용량을 아낀다
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const maxW = 240
      const scale = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      setCover(canvas.toDataURL('image/jpeg', 0.85))
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  function save() {
    if (!title.trim()) return
    onSave({
      id: initial?.id ?? uid(),
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim(),
      totalPages: Number(totalPages) || 0,
      coverDataUrl: cover,
      category,
      status,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial ? '책 정보 수정' : '새 책 추가'}</h2>
          <button onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="field">
          <label>제목 * — 검색하면 저자·출판사·표지가 자동으로 채워져요</label>
          <div className="search-row">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="책 제목"
            />
            <button
              className="btn secondary small"
              disabled={!title.trim() || searching}
              onClick={runSearch}
            >
              {searching ? '검색 중…' : '🔍 검색'}
            </button>
          </div>
          {searchMsg && <p className="search-msg">{searchMsg}</p>}
          {results && results.length > 0 && (
            <div className="search-results">
              {results.map((r) => (
                <button key={r.id} className="sr-item" onClick={() => pickResult(r)}>
                  {r.thumb ? (
                    <img src={r.thumb} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="sr-ph">📕</div>
                  )}
                  <span className="sr-info">
                    <span className="t">{r.title}</span>
                    <span className="a">
                      {r.authors}
                      {r.publisher ? ` · ${r.publisher}` : ''}
                      {r.pages ? ` · ${r.pages}p` : ''}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="row">
          <div className="field">
            <label>저자</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="저자" />
          </div>
          <div className="field">
            <label>출판사</label>
            <input
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="출판사"
            />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>전체 페이지</label>
            <input
              type="number"
              inputMode="numeric"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              placeholder="예: 263"
            />
          </div>
          <div className="field">
            <label>카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>상태</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Book['status'])}>
            <option value="reading">읽는 중</option>
            <option value="done">완독</option>
            <option value="paused">잠시 멈춤</option>
          </select>
        </div>
        <div className="field">
          <label>표지 이미지</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && onPickCover(e.target.files[0])}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {cover ? (
              <img src={cover} alt="표지" style={{ width: 52, height: 72, objectFit: 'cover', borderRadius: 6 }} />
            ) : (
              <div className="shelf-cover-ph">📕</div>
            )}
            <button className="btn secondary small" onClick={() => fileRef.current?.click()}>
              사진 선택
            </button>
            {cover && (
              <button className="btn ghost small" onClick={() => setCover(undefined)}>
                제거
              </button>
            )}
          </div>
        </div>

        <button className="btn" disabled={!title.trim()} onClick={save}>
          저장
        </button>
        {initial && onDelete && (
          <button
            className="btn ghost"
            style={{ marginTop: 10, color: '#c0392b' }}
            onClick={() => {
              if (confirm('이 책과 관련 기록이 모두 삭제됩니다. 삭제할까요?')) onDelete()
            }}
          >
            책 삭제
          </button>
        )}
      </div>
    </div>
  )
}
