import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import type { Book, Entry, Settings } from '../types'
import RecordCard from './RecordCard'
import { THEMES } from '../themes'
import { bookStartDate } from '../utils'

interface Props {
  entry: Entry
  book: Book
  entries: Entry[]
  settings: Settings
  onChangeTheme: (themeId: string) => void
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

/** 기록 카드 미리보기 + 테마 변경 + PNG 저장 */
export default function CardModal({
  entry,
  book,
  entries,
  settings,
  onChangeTheme,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)

  async function saveImage() {
    if (!cardRef.current || saving) return
    setSaving(true)
    try {
      // 2.5배 해상도로 내보내기 (약 1050px 폭)
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2.5, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `독서기록_${book.title.slice(0, 12)}_${entry.date}.png`
      a.click()
    } catch (err) {
      alert('이미지 저장에 실패했어요. 다시 시도해 주세요.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>기록 카드</h2>
          <button onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="card-wrap">
          <RecordCard
            ref={cardRef}
            entry={entry}
            book={book}
            entries={entries}
            settings={settings}
            startDate={bookStartDate(entries, book.id)}
          />
        </div>

        <div className="field">
          <label>카드 컬러</label>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-swatch ${t.id === entry.themeId ? 'active' : ''}`}
                style={{ background: t.bg, color: t.ink }}
                title={t.name}
                onClick={() => onChangeTheme(t.id)}
              />
            ))}
          </div>
        </div>

        <button className="btn" onClick={saveImage} disabled={saving}>
          {saving ? '저장 중…' : '🖼 이미지로 저장'}
        </button>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn secondary" onClick={onEdit}>
            수정
          </button>
          <button
            className="btn ghost"
            style={{ color: '#c0392b' }}
            onClick={() => {
              if (confirm('이 기록을 삭제할까요?')) onDelete()
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
