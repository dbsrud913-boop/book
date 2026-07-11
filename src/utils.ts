import type { Book, Entry } from './types'

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(date: string): string {
  return date // YYYY-MM-DD 그대로 표기 (카드 스타일)
}

function dateToNum(date: string): number {
  return new Date(date + 'T00:00:00').getTime()
}

/** 책 기록 중 가장 이른 날짜 = 시작일 */
export function bookStartDate(entries: Entry[], bookId: string): string | null {
  const dates = entries.filter((e) => e.bookId === bookId).map((e) => e.date)
  if (dates.length === 0) return null
  return dates.sort()[0]
}

/** 시작일부터 해당 날짜까지 며칠째인지 (같은 날 = 1일째) */
export function bookDayIndex(entries: Entry[], bookId: string, date: string): number {
  const start = bookStartDate(entries, bookId)
  if (!start) return 1
  const diff = Math.round((dateToNum(date) - dateToNum(start)) / 86400000)
  return Math.max(1, diff + 1)
}

/** 전체 누적 기록 일수 (기록이 있는 서로 다른 날짜 수) */
export function totalRecordedDays(entries: Entry[]): number {
  return new Set(entries.map((e) => e.date)).size
}

/** 오늘(또는 어제)까지 이어진 연속 기록 일수 */
export function currentStreak(entries: Entry[]): number {
  const days = new Set(entries.map((e) => e.date))
  if (days.size === 0) return 0
  let streak = 0
  const cursor = new Date()
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  // 오늘 기록이 없으면 어제부터 계산 (오늘은 아직 안 쓴 것일 수 있으니)
  if (!days.has(fmt(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(fmt(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function progressPercent(page: number, totalPages: number): string {
  if (!totalPages || totalPages <= 0) return ''
  const pct = Math.min(100, (page / totalPages) * 100)
  return pct >= 100 ? '100%' : `${pct.toFixed(1)}%`
}

export function bookById(books: Book[], id: string): Book | undefined {
  return books.find((b) => b.id === id)
}

/** 최신 날짜 순 정렬 (같은 날짜면 최근 작성 순) */
export function sortEntriesDesc(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) =>
    a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date),
  )
}
