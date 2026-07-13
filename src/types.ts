// 데이터 모델 — 나중에 Supabase 테이블로 그대로 옮길 수 있도록
// 모든 엔티티는 고유 id(uuid)와 ISO 날짜 문자열을 사용한다.

export interface Book {
  id: string
  title: string
  author: string
  publisher: string
  totalPages: number
  coverDataUrl?: string // 표지 이미지 (data URL)
  category: string // 예: "📜 인문과학"
  status: 'reading' | 'done' | 'paused'
  createdAt: string
}

export interface Entry {
  id: string
  bookId: string
  date: string // YYYY-MM-DD
  page: number // 오늘까지 읽은 페이지
  minutes?: number // 오늘 독서 시간(분)
  read: string // 오늘 문장
  note: string // 오늘 생각
  doit: string // 오늘 행동
  success?: string // 성공일기 (선택)
  themeId: string
  createdAt: string
}

export interface Settings {
  appLabel: string // 카드 왼쪽 상단 라벨 (예: 평단지기 독서법)
  signature: string // 카드 하단 서명 (예: @닉네임)
  defaultThemeId: string
  kakaoApiKey?: string // 카카오 REST API 키 — 책 검색용 (선택)
  avatarDataUrl?: string // 프로필 사진 (data URL)
}

export interface JournalData {
  version: 1
  books: Book[]
  entries: Entry[]
  settings: Settings
}
