import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import type { Book, Entry, Settings } from '../types'
import { getTheme } from '../themes'
import { bookDayIndex, totalRecordedDays } from '../utils'

export type CardRatio = '45' | '11'

export const CARD_TAGLINE = '책은 답보다 질문을 남긴다.'

interface Props {
  entry: Entry
  book: Book
  entries: Entry[] // 일수 계산용 전체 기록
  settings: Settings
  startDate: string | null
  ratio?: CardRatio
}

/**
 * SNS 공유용 기록 카드 — 이 DOM이 그대로 PNG로 내보내진다.
 * 명조(세리프) 저널 스타일: 질문이 헤드라인, 나의 답은 손글씨체.
 * 인스타그램 규격 고정 비율이라 내용이 길면 글자 크기를 자동 축소한다.
 */
const RecordCard = forwardRef<HTMLDivElement, Props>(function RecordCard(
  { entry, book, entries, settings, startDate: _startDate, ratio = '45' },
  ref,
) {
  const t = getTheme(entry.themeId)
  const dayIdx = bookDayIndex(entries, book.id, entry.date)
  const totalDays = totalRecordedDays(entries)
  const pctNum = book.totalPages ? Math.min(100, (entry.page / book.totalPages) * 100) : 0

  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    setScale(1)
  }, [entry.id, entry.read, entry.note, entry.doit, entry.success, ratio])

  // 내용이 넘치면 한 단계씩 글자를 줄여가며 카드 안에 맞춘다
  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    if (el.scrollHeight > el.clientHeight + 1 && scale > 0.6) {
      setScale((s) => Math.max(0.6, +(s - 0.04).toFixed(2)))
    }
  })

  const panelBg = `color-mix(in srgb, ${t.ink} 7%, transparent)`
  const chipBg = `color-mix(in srgb, ${t.accent} 14%, transparent)`
  const trackBg = `color-mix(in srgb, ${t.ink} 15%, transparent)`
  const ruleLine = `color-mix(in srgb, ${t.ink} 22%, transparent)`

  return (
    <div
      ref={ref}
      className="record-card rc2"
      style={{
        background: t.bg,
        color: t.ink,
        fontSize: 15 * scale,
        aspectRatio: ratio === '45' ? '4 / 5' : '1 / 1',
      }}
    >
      <div className="rc2-in" ref={innerRef}>
        <header className="rc3-top">
          <div className="rc3-brand-wrap">
            <div className="rc3-brand" style={{ color: t.accent }}>
              {settings.appLabel}
            </div>
            <div className="rc3-tagline" style={{ color: t.sub }}>
              {CARD_TAGLINE}
            </div>
          </div>
          <div className="rc3-day">
            <div className="n" style={{ color: t.accent }}>
              DAY {String(dayIdx).padStart(2, '0')}
            </div>
            <div className="s" style={{ color: t.sub }}>
              누적 {totalDays}일째 기록 중
            </div>
          </div>
        </header>

        <hr className="rc3-hr" style={{ borderColor: t.line }} />

        {entry.note && (
          <section className="rc3-sec">
            <div className="rc3-cap" style={{ color: t.accent }}>
              ◉ 책이 건넨 질문
            </div>
            <div className="rc3-q">{entry.note}</div>
          </section>
        )}

        {entry.read && (
          <div className="rc3-quotebox" style={{ background: panelBg }}>
            <div className="rc3-cap" style={{ color: t.accent }}>
              <span className="rc3-qmark">❝</span> 질문이 된 문장
            </div>
            <div className="rc3-quote">“{entry.read}”</div>
            <div className="rc3-attr" style={{ color: t.sub }}>
              — {book.title} 中
            </div>
          </div>
        )}

        {entry.doit && (
          <section className="rc3-sec">
            <div className="rc3-cap" style={{ color: t.accent }}>
              ✎ 나의 답
            </div>
            <div
              className="rc3-answer"
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent calc(1.9em - 1px), ${ruleLine} calc(1.9em - 1px), ${ruleLine} 1.9em)`,
              }}
            >
              {entry.doit}
            </div>
          </section>
        )}

        {entry.success && (
          <div className="rc3-keep" style={{ color: t.sub }}>
            🌱 남은 질문 — {entry.success}
          </div>
        )}

        <div className="rc2-spacer" />

        <div className="rc3-bookpanel" style={{ background: panelBg }}>
          {book.coverDataUrl ? (
            <img className="rc3-cover" src={book.coverDataUrl} alt="" />
          ) : (
            <div className="rc3-cover ph" style={{ background: trackBg }}>
              📕
            </div>
          )}
          <div className="rc3-bookinfo">
            <div className="rc3-cap" style={{ color: t.accent, marginBottom: '0.3em' }}>
              질문을 건넨 책
            </div>
            <div className="bt">{book.title}</div>
            <div className="ba" style={{ color: t.sub }}>
              {book.author}
              {book.publisher ? ` · ${book.publisher}` : ''}
            </div>
            {book.category && (
              <div className="rc3-chips">
                <span style={{ background: chipBg, color: t.accent }}>{book.category}</span>
              </div>
            )}
            {book.totalPages > 0 && (
              <>
                <div className="rc3-bar" style={{ background: trackBg }}>
                  <div style={{ width: `${pctNum}%`, background: t.accent }} />
                </div>
                <div className="rc3-pages" style={{ color: t.sub }}>
                  <b style={{ color: t.ink }}>{entry.page}</b> / {book.totalPages} page
                  {entry.minutes ? ` · ⏱ 오늘 ${entry.minutes}분 읽음` : ''}
                </div>
              </>
            )}
          </div>
          {book.totalPages > 0 && (
            <div className="rc3-pct">
              <div className="p" style={{ color: t.accent }}>
                {Math.round(pctNum)}
                <small>%</small>
              </div>
              <div className="l" style={{ color: t.sub }}>
                진행률
              </div>
            </div>
          )}
        </div>

        <div className="rc3-foot" style={{ color: t.sub }}>
          {entry.date.split('-').join(' · ')}
          {entry.minutes ? `  |  ${entry.minutes}분 읽음` : ''}
          {settings.signature ? `  |  ✎ ${settings.signature}` : ''}
        </div>
      </div>
    </div>
  )
})

export default RecordCard
