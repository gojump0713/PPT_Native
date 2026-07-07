# RESUME — 다음 세션 이어받기 노트

작성 2026-07-07 · 최종 커밋 `86bdf80` (feat: 03덱 교육 플랫폼 5장 추가 — 총 21장)

## 지금 상태 한 줄 요약
03덱(교육 플랫폼 5장, 슬라이드 17~21) **코드·배선·문서·QA 완성 + 커밋 완료**.
**남은 것은 AI 미디어 3종 생성뿐** — MCP 인증 실패로 미완(영상 없이도 발표 가능).

## 완료됨 (커밋 `86bdf80`)
- `js/scenes3.js` — 03덱 씬 T01~T05 (챕터 타이틀·IaC 구간재생+HTML폴백·벤토그리드·hub-tabs)
- `css/components3.css` — 03덱 전용 스타일
- `js/scenes2.js` — `chapterScene`/`videoBg`를 `window.CHAPTER_SCENE`/`VIDEO_BG`로 공용화
- `js/content.js` — 17~21장 메타데이터(전환 fly/fade/push/fly/fade·노트) 추가
- `js/config.js` — `iacSegments` 구간 매핑, `totalLabel` 21
- `index.html` — `components3.css`·`scenes3.js` 링크 + 5장 마크업(원래 있었음)
- `qa/qa-run.js` — 챕터 리빌 대기(tstation/cas 4200ms)
- 문서: README(21장 표)·TODO·DECISIONS(D-22~25)·KNOWN_ISSUES(K-13~14)
- **검증**: 21장 전체 QA JS 에러 0건. 챕터 리빌·벤토·IaC 폴백·CAS 허브탭 스크린샷 정상 확인
  (프로브로 "Tstation"/"CAS" 제품명 opacity 1 확인 — QA 스크린샷의 제품명 누락은 캡처 타이밍 문제였고 버그 아님)

## 중단 원인 (미디어 미생성)
- **Higgsfield**: 인증 직후에도 매 호출 `token expired` (5회 연속). 이 세션 토큰 갱신 버그로 판단.
- **Kling AI**: `/mcp` 재연결해도 "still unauthorized" — 브라우저 사인인 미완료.
- 결론: 코드 문제 아님. MCP 인증만 성사되면 즉시 생성 가능.

## 이어서 할 일 (순서대로)
1. MCP 미디어 서비스 인증 성사 (Kling AI 권장 — 01·02덱 영상 제작에 사용한 경로, DECISIONS D-06·D-18).
   - `/mcp` → "claude.ai kling AI" → **브라우저 로그인+승인까지 완료**.
   - 또는 Higgsfield 브라우저 OAuth 완주. 연결되면 잔액 조회부터 확인.
2. 아래 프롬프트로 영상 3종 생성 → `assets/videos/`에 **동일 파일명**으로 저장 (자동 반영, 코드 수정 불필요).
3. 포스터 2종 생성/추출 → `assets/images/`.
   - ffmpeg 부재(DECISIONS D-19): 영상 첫 프레임 대신, 헤드리스 브라우저로 해당 슬라이드 스크린샷을 webp로 저장하거나, 톤 맞는 정지 이미지 별도 생성.
4. `node qa/qa-run.js` 재실행 → 404 사라지고 JS 에러 0건 유지 확인 → 커밋.

## 생성 대상 파일명 (코드가 참조하는 정확한 이름)
- `assets/videos/tstation-loop.mp4`  (chv-video data-video="tstation" → `{name}-loop.mp4`)
- `assets/videos/cas-loop.mp4`
- `assets/videos/iac-seg-a.mp4` · `iac-seg-b.mp4` · `iac-seg-c.mp4`  (config.iacSegments)
- `assets/images/tstation-poster.webp` · `cas-poster.webp`  (videoBg: `{name}-poster.webp`)

## Turnkey 생성 프롬프트 (03 명세 7절·2.2·3.2·5.2 기준, 01/02덱 톤 승계)

### 1) tstation-loop.mp4 — 배경 영상 (실사 시네마틱, 10~15s 루프)
> Cinematic slow dolly shot, modern university computer lab. A student opens a browser and a full AI development environment (code editor, Jupyter notebook, terminal) instantly unfolds on screen. Lines of code type out and holographic neural-network graphs and learning curves rise above the monitor in blue/cyan glow. Wide overhead shot: a professor's single click deploys the same lab environment onto dozens of student screens at once. Dark scene, deep blue and cyan code glow, filmic depth of field, volumetric light. Keep the LEFT 55% of frame visually calm/empty for title overlay. No text, no logos, no captions. Loop-friendly: start and end frames similar. 16:9.

### 2) cas-loop.mp4 — 배경 영상 (실사 시네마틱, 10~15s 루프)
> Cinematic shot of a bright modern university lecture hall in warm natural daylight. A professor teaches with a large screen while students follow the same learning screen on laptops and tablets. Lecture materials, assignments and attendance checks reflect in real time on each student's device with subtle blue UI overlays. The physical classroom and a remote student at home connect through one unified platform screen. Warm realistic classroom tone unified with a soft dark-blue gradient so it matches other dark chapters. Cinematic, shallow depth of field. Keep title area (left) visually calm. No text, no logos. Loop-friendly. 16:9.

### 3) iac-seg-a/b/c.mp4 — IaC 인포그래픽 (모션그래픽, 실사 아님, 다크+그린/민트)
공통 스타일: flat icons + big typography + gauge/timeline graphics, dark background, green/mint accent, motion-graphic (NOT photoreal), no logos. 세 클립을 이어 보면 하나의 스토리.
- **seg-a (~8s, 전통 방식의 고통)**: horizontal pipeline of 5 heavy blocks stacking one by one — "OS 설치 → 드라이버 세팅 → CUDA 충돌 해결 → 프레임워크 설치 → 라이선스 확인". A clock graphic at top rapidly accumulates "4~6시간". The CUDA block flashes a red error icon. Gray, low-saturation, heavy/sluggish feel.
- **seg-b (~7s, IaC의 마법)**: screen inverts; a YAML/script code block types out and each code line instantly morphs/assembles into server, GPU and framework icons — visualizing "code IS infrastructure". A pre-verified tech stack (text chips) drops in pre-loaded with green checkmarks. Bright mint accents, smooth/fast.
- **seg-c (~7s, 1초 접속)**: a cursor clicks a button once → a counter shows "1초" → a browser window instantly unfolds a ready dev environment → the old "4~6시간" graphic collapses and a giant "1초" typography takes its place. Last frame static for loop. Mint glow finale.

> 주의: 명세 원안은 단일 18~24초 영상 + 타임코드(S02-AST-02)이나, 현재 구현(scenes3.js)은 구간별 개별 파일 재생. 단일 영상을 원하면 KNOWN_ISSUES K-14 참조(scenes3 playSeg를 currentTime 시크로 전환).

## 실행/QA
- 실행: `index.html`을 Edge/Chrome로 열기 (오프라인 OK) 또는 `npx serve .`
- QA: `node qa/qa-run.js` (스크린샷+콘솔에러), `node qa/qa-run.js 1366 768`, `node qa/qa-gate.js`
