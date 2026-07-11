// 카드 컬러 — 명조 저널 스타일과 어울리는 뮤트(저채도) 톤 6색.
// 강한 파스텔 컬러판은 쓰지 않는다 (사용자 결정). 모두 "같은 저널의 다른 페이지" 느낌.
export interface Theme {
  id: string
  name: string
  bg: string // 카드 배경
  ink: string // 본문 텍스트
  accent: string // 라벨/포인트
  sub: string // 보조(메타) 텍스트
  line: string // 구분선
}

export const THEMES: Theme[] = [
  {
    id: 'cream',
    name: '크림',
    bg: '#FBF4EB',
    ink: '#43382E',
    accent: '#BC5B37',
    sub: '#97867A',
    line: '#E7D7C6',
  },
  {
    id: 'rose-garden',
    name: '로즈 가든',
    bg: '#F8EAE6',
    ink: '#4A3936',
    accent: '#A85D62',
    sub: '#9C817C',
    line: '#E9D3CC',
  },
  {
    id: 'sage',
    name: '세이지',
    bg: '#F0F2E6',
    ink: '#3E4536',
    accent: '#78894F',
    sub: '#8A9179',
    line: '#DBE0C9',
  },
  {
    id: 'morning-mist',
    name: '모닝 미스트',
    bg: '#EBF0EE',
    ink: '#37413E',
    accent: '#5F857C',
    sub: '#84938E',
    line: '#D5DFDB',
  },
  {
    id: 'sunflake',
    name: '선 플레이크',
    bg: '#FBEFDA',
    ink: '#4A3C26',
    accent: '#BB8434',
    sub: '#9D8B6C',
    line: '#EDDCBB',
  },
  {
    id: 'blueberry-cream',
    name: '블루베리 크림',
    bg: '#F0E9EE',
    ink: '#453B44',
    accent: '#8A6284',
    sub: '#948591',
    line: '#DFD3DC',
  },
]

export const DEFAULT_THEME_ID = 'cream'

/** 과거 themeId(파스텔 12색·journal 등)는 기본 크림으로 자연스럽게 대체된다 */
export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
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
