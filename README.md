# 📚 하루 한 장 — 매일 독서 기록

매일 읽은 책의 한 문장과 내 생각을 기록하고, 예쁜 컬러 카드 이미지로 내보내 SNS에 공유할 수 있는 웹 앱입니다.

## 주요 기능

- **오늘의 기록**: 📖 오늘 문장(Read) · 💬 오늘 생각(Note) · ✍️ 오늘 행동(Do it) · 🏆 성공일기
- **자동 계산**: 책별 N일째, 누적 기록일, 연속 기록(스트릭), 진행률(%)
- **책장 관리**: 표지 사진, 저자/출판사, 카테고리, 읽는 중/완독 상태
- **이미지 카드 내보내기**: 파스텔 12색 테마 카드를 PNG(1080px급)로 저장
- **백업/복원**: JSON 파일로 내보내기·불러오기
- 로그인 없이 브라우저(localStorage)에 저장 — 모바일 브라우저에서 바로 사용 가능

## 개발

```bash
npm install
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드 (dist/)
npm run build:single # 공유용 단일 HTML 파일 빌드 (dist-single/)
```

## 기술 스택

- React 18 + TypeScript + Vite
- html-to-image (카드 PNG 내보내기)
- 저장소: localStorage (`src/storage.ts`에 격리 — 추후 Supabase로 교체 예정)

## 로드맵

- [x] 1단계 MVP: 책 등록 · 오늘 기록 · 타임라인 · 이미지 카드 내보내기
- [ ] 2단계: 책 검색 API 연동, 캘린더/통계, PWA 설치 지원
- [ ] 3단계: Supabase 계정/클라우드 동기화 (기존 기기 데이터 마이그레이션 포함)
- [ ] 4단계: 앱 스토어 출시 (Capacitor)
