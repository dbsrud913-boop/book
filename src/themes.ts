// 카드 컬러 테마 — 파스텔 팔레트 12색
export interface Theme {
  id: string
  name: string
  bg: string // 카드 배경
  ink: string // 본문 텍스트
  accent: string // 제목/섹션 라벨
  sub: string // 보조(메타) 텍스트
  line: string // 테두리/구분선
}

export const THEMES: Theme[] = [
  {
    id: 'baby-lavender',
    name: '베이비 라벤더',
    bg: '#F9D4F8',
    ink: '#33453c',
    accent: '#2E6B57',
    sub: '#5f7a6d',
    line: 'rgba(46,107,87,0.35)',
  },
  {
    id: 'dip-twilight',
    name: '해질녘 바다',
    bg: '#AECFD0',
    ink: '#243550',
    accent: '#1D2E4A',
    sub: '#48597a',
    line: 'rgba(29,46,74,0.35)',
  },
  {
    id: 'beach-umbrella',
    name: '비치 파라솔',
    bg: '#FFD094',
    ink: '#5c3b12',
    accent: '#DA4A87',
    sub: '#96693a',
    line: 'rgba(218,74,135,0.4)',
  },
  {
    id: 'baby-shower',
    name: '베이비 샤워',
    bg: '#EA5E86',
    ink: '#FFF1F6',
    accent: '#FBD7E5',
    sub: 'rgba(255,241,246,0.75)',
    line: 'rgba(255,241,246,0.4)',
  },
  {
    id: 'canned-tomato',
    name: '토마토',
    bg: '#EF6545',
    ink: '#FFF4EA',
    accent: '#EDF7C3',
    sub: 'rgba(255,244,234,0.78)',
    line: 'rgba(255,244,234,0.4)',
  },
  {
    id: 'buttered-corn',
    name: '버터드 콘',
    bg: '#F7E9B2',
    ink: '#6b4d1a',
    accent: '#DE8D25',
    sub: '#9a7a42',
    line: 'rgba(222,141,37,0.4)',
  },
  {
    id: 'mint-no-chip',
    name: '민트',
    bg: '#DDF2B8',
    ink: '#37503f',
    accent: '#33978A',
    sub: '#6b8a70',
    line: 'rgba(51,151,138,0.4)',
  },
  {
    id: 'iced-tang',
    name: '아이스 탱',
    bg: '#F49625',
    ink: '#FFF6E8',
    accent: '#FBE3C1',
    sub: 'rgba(255,246,232,0.8)',
    line: 'rgba(255,246,232,0.42)',
  },
  {
    id: 'valentine-chocolate',
    name: '초콜릿',
    bg: '#422F0E',
    ink: '#F1E9D8',
    accent: '#D9ECC0',
    sub: 'rgba(241,233,216,0.72)',
    line: 'rgba(217,236,192,0.35)',
  },
  {
    id: 'bali-pool',
    name: '발리 풀',
    bg: '#037F71',
    ink: '#F2FBF7',
    accent: '#F2DFAE',
    sub: 'rgba(242,251,247,0.75)',
    line: 'rgba(242,223,174,0.42)',
  },
  {
    id: 'bahamas-beach',
    name: '바하마 비치',
    bg: '#57B1A8',
    ink: '#F7FCFA',
    accent: '#F5D9F2',
    sub: 'rgba(247,252,250,0.8)',
    line: 'rgba(245,217,242,0.45)',
  },
  {
    id: 'shortcake',
    name: '쇼트케이크',
    bg: '#FCC4C0',
    ink: '#63302a',
    accent: '#D8543C',
    sub: '#97625c',
    line: 'rgba(216,84,60,0.4)',
  },
]

export const DEFAULT_THEME_ID = 'baby-lavender'

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
