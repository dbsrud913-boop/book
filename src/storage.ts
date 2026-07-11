// 저장소 계층 — 지금은 localStorage, 나중에 Supabase로 교체할 수 있도록
// 읽기/쓰기를 이 파일 안에만 모아둔다.
import type { JournalData, Book, Entry, Settings } from './types'
import { DEFAULT_THEME_ID } from './themes'

const KEY = 'haru-journal-v1'

export const DEFAULT_SETTINGS: Settings = {
  appLabel: '책에 묻다',
  signature: '',
  defaultThemeId: DEFAULT_THEME_ID,
}

// 이전 기본 라벨을 쓰고 있던 기기는 새 이름으로 자동 이전
const OLD_DEFAULT_LABELS = ['매일 독서 기록', '질문하는 독서']

function emptyData(): JournalData {
  return { version: 1, books: [], entries: [], settings: { ...DEFAULT_SETTINGS } }
}

export function loadData(): JournalData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as JournalData
    if (!parsed || parsed.version !== 1) return emptyData()
    const settings = { ...DEFAULT_SETTINGS, ...parsed.settings }
    if (OLD_DEFAULT_LABELS.includes(settings.appLabel)) settings.appLabel = DEFAULT_SETTINGS.appLabel
    return {
      version: 1,
      books: parsed.books ?? [],
      entries: parsed.entries ?? [],
      settings,
    }
  } catch {
    return emptyData()
  }
}

export function saveData(data: JournalData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportJson(data: JournalData): string {
  return JSON.stringify(data, null, 2)
}

export function importJson(text: string): JournalData {
  const parsed = JSON.parse(text) as JournalData
  if (!parsed || !Array.isArray(parsed.books) || !Array.isArray(parsed.entries)) {
    throw new Error('올바른 백업 파일이 아니에요.')
  }
  return {
    version: 1,
    books: parsed.books as Book[],
    entries: parsed.entries as Entry[],
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
  }
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
