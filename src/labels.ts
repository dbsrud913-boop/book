// 질문 독서(하브루타) 기록 틀 — 섹션 문구를 한곳에 모아둔다.
// 나중에 '나만의 틀 편집' 기능을 붙일 때 이 구조를 설정으로 옮기면 된다.
export interface SectionLabel {
  key: 'read' | 'note' | 'doit' | 'success'
  emoji: string
  title: string // 카드에 표시되는 섹션 제목
  formLabel: string // 입력 폼 라벨
  placeholder: string
  quoteStyle?: boolean // 이탤릭 인용 스타일
  optional?: boolean
}

export const SECTIONS: SectionLabel[] = [
  {
    key: 'read',
    emoji: '✏️',
    title: '질문이 된 문장',
    formLabel: '✏️ 질문이 된 문장 — 마음에 남은 구절',
    placeholder: '책 속에서 마음에 남은 문장을 옮겨 적어요',
    quoteStyle: true,
  },
  {
    key: 'note',
    emoji: '◉',
    title: '책이 건넨 질문',
    formLabel: '◉ 책이 건넨 질문 — 이 문장이 나에게 묻는 것',
    placeholder: '이 문장은 나에게 무엇을 묻고 있나요?',
  },
  {
    key: 'doit',
    emoji: '✎',
    title: '나의 답',
    formLabel: '✎ 나의 답 — 질문에 답하며 나를 기록해요',
    placeholder: '지금의 나는 이렇게 답해요',
  },
  {
    key: 'success',
    emoji: '🌱',
    title: '남은 질문 (Keep asking)',
    formLabel: '🌱 남은 질문 (선택) — 아직 답하지 못해 계속 품고 갈 질문',
    placeholder: '내일의 나에게 넘겨줄 질문이 있다면',
    optional: true,
  },
]
