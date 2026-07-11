# 책에 묻다 — 오늘의 독서

## 핵심 컨셉 (모든 결정의 기준)

> **책 속 문장이 오늘의 질문이 되고, 그 질문에 답하며 나를 기록하는 독서 저널**

- 하브루타처럼 책에 질문을 던지며 읽는다. AI 시대에 중요한 것은 답이 아니라 질문하는 힘.
- 기록의 주인공은 책이 아니라 **질문과 나** — 카드 UI에서도 질문이 헤드라인.
- 기록 흐름: ✏️ 오늘의 문장 → ❓ 나에게 묻다(질문) → 💡 나의 생각(대답) → 🌱 남은 질문(선택)

## 제품 방향

- 소유자: dbsrud913@gmail.com (개인 프로젝트, 추후 다른 사람들에게 배포 목표)
- 1단계 웹/모바일(PWA) → 나중에 앱 스토어(Capacitor 등)
- SNS 공유가 핵심 동선: 기록 → 인스타그램 규격 카드 이미지(4:5 1080×1350 / 1:1 1080×1080) 내보내기
- 카드 디자인: **사용자가 준 목업 기반의 명조 저널 스타일** (기본: 크림 #FBF4EB + 테라코타 #BC5B37)
  - 컬러는 **뮤트(저채도) 6색 팔레트만** (src/themes.ts) — 크림/로즈가든/세이지/모닝미스트/선플레이크/블루베리크림
  - 채도 높은 파스텔·강한 색은 쓰지 않기로 함 (사용자 결정). 톤 선택은 카드 화면에서만
  - 명조(Noto Serif KR) + 나의 답은 손글씨(Nanum Pen Script) + 노트 줄
- 앱 셸은 크림톤 라이트 고정

## 기술 구조

- React 18 + TypeScript + Vite, 상태/저장은 localStorage (`src/storage.ts`에 격리)
- **추후 Supabase + 로그인으로 교체 예정** — 저장소 계층을 바꿀 때 데이터 구조(uuid, ISO 날짜) 그대로 이전
- 카드 PNG 내보내기: html-to-image (고정 비율 + 내용 길면 글자 자동 축소)
- 책 검색: 카카오(설정에서 REST 키 입력 시) → Google Books(키 없음) → Open Library 순서.
  교보문고는 공개 API 없음. 알라딘/네이버는 CORS 때문에 서버 필요 → Supabase 도입 때 고려
- 배포: push 하면 GitHub Actions가 dist를 gh-pages 브랜치로 → https://dbsrud913-boop.github.io/book/
- 작업 브랜치: `claude/reading-journal-app-ohyuti` (레포 기본 브랜치)

## 개발 명령

```bash
npm run dev          # 개발 서버
npm run build        # tsc + vite build (dist/)
npm run build:single # 단일 HTML (dist-single/) — claude.ai 아티팩트 미리보기용
```

- 검증: Playwright(playwright-core + /opt/pw-browsers/chromium)로 e2e — 책 추가, 기록 작성,
  카드 PNG 내보내기(픽셀 크기 확인), 새로고침 후 데이터 유지까지 실제 브라우저로 확인할 것
- 외부 API 호출은 Playwright route 목킹으로 테스트 (개발 컨테이너에서 googleapis는 할당량,
  openlibrary/github.io는 네트워크 정책으로 직접 호출 불가)

## 사용자와의 대화 언어

한국어. 사용자는 비개발자 — 기술 용어는 풀어서 설명하고, 비용이 드는 선택지는 반드시 무료 여부를 명확히.
