import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import type { Book, Entry, Settings } from '../types'
import RecordCard, { type CardRatio } from './RecordCard'
import { bookStartDate } from '../utils'

interface Props {
  entry: Entry
  book: Book
  entries: Entry[]
  settings: Settings
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
  onEdit,
  onDelete,
  onClose,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [ratio, setRatio] = useState<CardRatio>('45')

  async function saveImage() {
    if (!cardRef.current || saving) return
    setSaving(true)
    try {
      // 인스타그램 규격으로 내보내기: 4:5 = 1080×1350, 1:1 = 1080×1080
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        canvasWidth: 1080,
        canvasHeight: ratio === '45' ? 1350 : 1080,
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `질문독서_${book.title.slice(0, 12)}_${entry.date}.png`
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
            ratio={ratio}
          />
        </div>

        <div className="field">
          <label>이미지 크기 (인스타그램)</label>
          <div className="ratio-toggle">
            <button className={ratio === '45' ? 'active' : ''} onClick={() => setRatio('45')}>
              4:5 세로 · 1080×1350
            </button>
            <button className={ratio === '11' ? 'active' : ''} onClick={() => setRatio('11')}>
              1:1 정사각 · 1080×1080
            </button>
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
