# AI Native Campus — HTML 인터랙티브 발표 슬라이드

PC 전용(Desktop-Only) HTML 기반 인터랙티브 발표 슬라이드입니다.
ScrollDeck Pro PRD v3.0과 `01_기능명세서.docx`(6장) + `02_기능명세서.docx`(10장) +
`03_기능명세서.docx`(5장)를 기준으로 **총 21장**을 하나의 index.html로 통합 제작했습니다.

## 실행 방법

```bash
# 방법 1 — 파일 직접 열기 (오프라인 OK)
index.html 을 Chrome 또는 Edge에서 열기

# 방법 2 — 로컬 서버 (권장)
npx serve .          # 또는 python -m http.server
```

인터넷 연결이 필요 없습니다. 모든 라이브러리(GSAP·Lenis·Three.js)와 에셋(영상·이미지·폰트)은
로컬에 포함되어 있으며 CDN·외부 API를 사용하지 않습니다.

## PC 전용 정책

- **지원**: Windows/macOS 데스크톱·노트북, Chrome/Edge 최신 버전, 1366×768 ~ 4K(16:9 계열)
- **미지원**: 모바일·태블릿. 모바일 UA 또는 가로 1024px 미만 접근 시 안내 화면만 표시됩니다.
- 레이아웃은 반응형이 아닌 **1920×1080 고정 스테이지**를 `transform: scale()`로
  레터박스 피팅하는 방식입니다. 창 크기가 달라져도 요소 재배치가 발생하지 않습니다.

## 조작법

| 입력 | 기능 |
|---|---|
| `→` `Space` `PageDown` | 다음 스텝/슬라이드 (프레젠터 리모컨 호환) |
| `←` `PageUp` | 이전 스텝/슬라이드 |
| `Home` / `End` | 첫 / 마지막 슬라이드 |
| `O` | 전체 목차(Overview) 열기/닫기 · 화살표+Enter로 선택 |
| `ESC` | 오버레이 닫기 전용 |
| `F` | 전체 화면 |
| `B` | 블랙아웃 |
| `N` | 발표자 노트 창 (듀얼 모니터용) |
| `R` | 발표 타이머 리셋 |
| 숫자+`Enter` | 해당 번호 슬라이드로 이동 |
| 마우스 휠 / 터치패드 스크롤 | 다음·이전 스텝 |
| 클릭(빈 영역) | 다음 스텝 |

슬라이드별 마우스 인터랙션: S02 커서 추적 Before/After · S03 카드 hover 시 회전 정지 ·
S04 카드 tilt+스파크 · S05 노드 툴팁·커서 반발 · S06 모듈 툴팁·트랙 경로 하이라이트.

## 슬라이드 구성 (16장)

**01 덱 — AI Native Campus 개요**

| # | 해시 | 제목 | 주연 인터랙션 |
|---|---|---|---|
| 1 | `#/opening` | AI Native Campus로의 전환 | 배경 영상 루프 + Kinetic Text (자동) |
| 2 | `#/context` | AI는 이미 기본 도구가 되었다 | 커서 추적 Before/After |
| 3 | `#/voices` | 현장의 목소리 | 3D 회전목마 페르소나 카드 |
| 4 | `#/painpoints` | 복합적인 Pain Point | 순차 카드 + 얽힘 라인 (자동) |
| 5 | `#/solution` | 단 하나의 통합 인프라 | 분산→응집 Convergence |
| 6 | `#/architecture` | AI 인프라 표준 프레임워크 | ①트랙 → ②자동 순차 하이라이트 |

**02 덱 — 기술 상세 (Dstation → Estation → iStation)**

| # | 해시 | 제목 | 주연 인터랙션 / 영상 |
|---|---|---|---|
| 7 | `#/dstation` | Dstation — VDI | VDI 배경 영상 + Kinetic Reveal |
| 8 | `#/vdi-concept` | 데스크톱 가상화 개념 | 접속 시뮬레이션 (칩 hover 파티클 왕복·미러링) |
| 9 | `#/estation` | Estation — GPU Slicing | GPU Slicing 영상 + '9배' 카운트업 |
| 10 | `#/gpu-slicing` | 유동적 vGPU 분할 비교 | 8장 레이어 분해 + 활용률 게이지 레이스 |
| 11 | `#/daas-value` | DaaS + GPU Slicing 가치 | 가치 스텝 리빌 + 5FPS/64FPS 체감 비교 + MIG 비교표 |
| 12 | `#/istation` | iStation — Sovereign AI | Sovereign AI 영상 + 키워드 칩 리빌 |
| 13 | `#/istation-features` | iStation 3대 특징 | 3D Flip 카드 (hover 플립·클릭 고정) |
| 14 | `#/scheduling` | 지능형 자원 스케줄링 | 주간↔야간 상태 전환 (영상 구간 동기화) |
| 15 | `#/jeju-case` | 제주대 Sovereign AI 구축 | 채팅 UI 타이핑 데모 + 특징 노드 연결 |
| 16 | `#/closing` | 자체 AI 인프라 = 정부사업 가산점 | 3단 플로우 + 파티클 응집 피날레 |

**03 덱 — 교육 플랫폼 (Tstation → CAS)**

| # | 해시 | 제목 | 주연 인터랙션 / 영상 |
|---|---|---|---|
| 17 | `#/tstation` | Tstation — AI 개발환경 통합 플랫폼 | AI 코딩 교육 배경 영상 + Kinetic Reveal |
| 18 | `#/instant-setup` | Instant Setup: 6시간 → 1초 | IaC 인포그래픽 영상(구간 재생) + HTML 폴백 |
| 19 | `#/tstation-features` | Tstation 6대 특징 | 벤토 그리드 + 카드 hover 마이크로 데모 |
| 20 | `#/cas` | CAS — All-in-One 교육 플랫폼 | 강의실 배경 영상 + 키워드 칩 5종 라인 연결 |
| 21 | `#/cas-platform` | CAS 통합 학습관리 | 허브+탭 목업 화면 전환(자동 순회) + 브릿지 라인 |

URL 해시로 직접 접근할 수 있고, 새로고침 시 마지막 위치가 복구됩니다(LocalStorage).
마지막 슬라이드에서 한 번 더 진행하면 Overview가 열립니다(Q&A용, `config.js`의 `openOverviewAtEnd`).

## 파일 구조

```
/index.html            실행 파일 (21개 슬라이드 마크업 포함)
/css                   reset · tokens(디자인 토큰) · layout · components · components2(02덱) · components3(03덱) · animations · fallback(저사양)
/js
  config.js            발표 설정 (모션 강도, 저사양 강제, 휠 감도 등)
  content.js           슬라이드 메타데이터·발표자 노트 (콘텐츠 교체는 여기 + index.html 마크업)
  env-gate.js          모바일 접근 감지 → 안내 화면
  performance.js       FPS 프로브·WebGL 감지·저사양 모드 전환
  particles.js         Canvas 파티클 (부유·경로 흐름)
  scenes.js            01덱 씬 컨트롤러 (1~6장)
  scenes2.js           02덱 씬 컨트롤러 (7~16장, 배경 영상 매니저 + CHAPTER_SCENE/VIDEO_BG 공용)
  scenes3.js           03덱 씬 컨트롤러 (17~21장, bento-grid·IaC 구간재생·hub-tabs)
  navigation.js        덱 엔진 (스텝·전환·키보드·휠·해시·저장)
  overview.js          전체 목차 모드
  speaker-notes.js     발표자 노트 창
  main.js              스테이지 스케일링·부트스트랩
  vendor/              gsap · ScrollTrigger · lenis · three (로컬 번들)
/assets                fonts(Pretendard) · images · videos
/qa                    셀프 QA 스크립트 (node qa/qa-run.js [w h])
```

## 콘텐츠 교체 방법

1. `js/content.js` — 목차 제목·섹션·발표자 노트·전환 유형 수정
2. `index.html` — 각 `<section class="slide">` 내부 텍스트·카피 수정
3. `assets/images`, `assets/videos` — 동일 파일명으로 미디어 교체
   (`hero-loop.mp4`, `{dstation|estation|istation|scheduling}-loop.mp4` + 각 `-poster.webp`,
   `before.webp`, `after.webp`, `persona-*.webp`,
   03덱: `{tstation|cas}-loop.mp4` + `-poster.webp`, `iac-seg-{a|b|c}.mp4` — 미탑재 시 HTML 폴백 자동 사용)
4. `css/tokens.css` — 브랜드 컬러·폰트 등 디자인 토큰 변경

## 저사양 · 접근성

- 초기 3초 평균 FPS 45 미만 또는 WebGL 미지원 시 자동 저사양 모드
  (영상→포스터, 파티클 제거, 3D 회전목마→가로 배치, tilt 제거)
- `prefers-reduced-motion` 감지 시 모든 모션이 짧은 크로스페이드로 대체
- 키보드만으로 전체 조작 가능, 본문 28px+/핵심 54px+/타이틀 72px+ (@1080p)

## 발표 전 체크리스트

- [ ] Chrome/Edge 최신 버전에서 실행 확인 (발표장 PC)
- [ ] 인터넷을 끊은 상태에서 실행 확인
- [ ] `F` 전체 화면, `B` 블랙아웃, `O` 목차 동작 확인
- [ ] 빔프로젝터 연결 후 16:9 레터박스 확인
- [ ] 방향키·Space·PageUp/Down·프레젠터 리모컨 확인
- [ ] S02 커서 리빌, S03 회전 정지, S06 툴팁 등 hover 인터랙션 확인
- [ ] 저사양 폴백 확인 (`js/config.js`의 `lowPowerOverride: true`로 강제 가능)
- [ ] 듀얼 모니터 시 `N` 발표자 노트 확인
- [ ] 예비용 정적 PDF/이미지 백업 준비

## 셀프 QA

```bash
node qa/qa-run.js            # 1920×1080 전 슬라이드·전 스텝 구동 + 스크린샷 + 콘솔 에러 검출
node qa/qa-run.js 1366 768   # 해상도 지정
node qa/qa-gate.js           # 모바일 게이트 검증
```
