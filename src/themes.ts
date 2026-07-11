// 카드 컬러 — 사용자가 준 목업(크림 + 테라코타 저널) 기준의 단일 고정 테마.
// 컬러 선택판은 제거했다. (2026-07 사용자 결정)
export interface Theme {
  id: string
  name: string
  bg: string // 카드 배경
  ink: string // 본문 텍스트
  accent: string // 라벨/포인트 (테라코타)
  sub: string // 보조(메타) 텍스트
  line: string // 구분선
}

export const CARD_THEME: Theme = {
  id: 'journal',
  name: '저널',
  bg: '#FBF4EB',
  ink: '#43382E',
  accent: '#BC5B37',
  sub: '#97867A',
  line: '#E7D7C6',
}

export const DEFAULT_THEME_ID = CARD_THEME.id

/** 과거 데이터의 themeId가 무엇이든 항상 저널 테마를 쓴다 */
export function getTheme(_id: string): Theme {
  return CARD_THEME
}

/** 표지 없는 책의 책등(스파인) 색 — 선택 UI가 아니라 자동 배정용 */
export const SPINE_COLORS: { bg: string; ink: string }[] = [
  { bg: '#C96F4A', ink: '#FDF3EA' }, // 테라코타
  { bg: '#8FA382', ink: '#F4F8F0' }, // 세이지
  { bg: '#7E93A8', ink: '#F1F5F9' }, // 더스티 블루
  { bg: '#D3A24C', ink: '#4A3A1E' }, // 머스터드
  { bg: '#B98A8A', ink: '#FBF2F2' }, // 로즈
  { bg: '#8A6D5C', ink: '#F7F0EA' }, // 브라운
]
