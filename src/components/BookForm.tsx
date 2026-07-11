import { useRef, useState } from 'react'
import type { Book } from '../types'
import { uid } from '../storage'

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
          <label>제목 *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="책 제목" />
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
