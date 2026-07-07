# TODO — 작업 목록 (PRD 작업 절차 기준)

## M1. 기본 발표 시스템 구축
- [x] 16:9 고정 스테이지(1920×1080) `transform: scale()` 레터박스 스케일링
- [x] 슬라이드 DOM 구조 (6장, data-slide/section/title/steps)
- [x] 키보드 내비게이션 (→/←/Space/PageUp/PageDown/Home/End) + 프레젠터 리모컨 신호
- [x] 스텝 단위 진행(COM-03) + 전환 중 입력 잠금(COM-04)
- [x] 진행률 바 + 현재 섹션·슬라이드 번호(n/6) + 발표 타이머
- [x] 기본 전환 효과 (fade / push / blur-fade / morph / zoom)
- [x] Overview Mode (O 토글, ESC 닫기, 카드 그리드, 현재 강조, hover 확대, 클릭·키보드 이동)
- [x] URL 해시 딥링크 + LocalStorage 위치 복구 + 브라우저 앞/뒤로가기
- [x] 모바일 접근 안내 화면 (env-gate)
- [x] 오프라인 실행 (CDN 0건, 전 에셋 로컬)

## M2. 핵심 인터랙션
- [x] S02 커서 추적 Before/After Reveal (lerp 0.1, 이탈 시 복귀)
- [x] S03 3D 회전목마 (billboard 텍스트, hover 정지, 클릭 최단 회전, 자동 정착 회전)
- [x] S04 카드 순차 등장 + 3D tilt ±6° + 스파크 버스트 + SVG 얽힘 라인 + 가닥 하이라이트
- [x] S05 노드 산포·부유 + 커서 반발 + 응집 모션 + 역재생
- [x] S06 스텝 딤/하이라이트 + 와이어 Path Drawing + hover 툴팁 + 트랙 경로 하이라이트
- [x] Magnetic 계열 hover(칩·노드·버튼), 커서 글로우
- [x] SVG Path Drawing (S04 얽힘, S06 커넥터, 아이콘 line-draw)

## M3. 시그니처 모션
- [x] S01 히어로 영상 루프 + Kinetic Text Reveal + Mouse Parallax + 파티클
- [x] S05 Convergence(응집) 모션 + 링 펄스
- [x] S06 데이터 흐름 파티클 (커넥터 경로 위)
- [x] Mask Reveal (S03 결론, S05 핵심 문장)
- [x] AI 생성 에셋 7종 (영상 1, 이미지 6) 제작·적용

## M4. 최적화·안정화
- [x] 블랙아웃(B) / 전체 화면(F) / 발표자 노트(N) / 타이머 리셋(R)
- [x] prefers-reduced-motion 대응 (CSS + GSAP 타임스케일)
- [x] 저사양 자동 감지 (FPS 프로브·WebGL) + 씬별 폴백 (fallback.css + 씬 분기)
- [x] 씬 이탈 시 렌더 루프·영상 정지 (COM-09)
- [x] 셀프 QA: 1366×768 / 1920×1080 / 2560×1440 전 스텝 구동, 콘솔 에러 0건
- [x] 모바일 게이트 QA (800px 게이트 표시 → 확대 시 해제·덱 시작)
- [x] README / DECISIONS / KNOWN_ISSUES 문서화
- [x] git 커밋 체크포인트

## 02덱 — 기술 상세 (10장, 02_기능명세서 v1.0)
- [x] 배경 영상 4종 생성·로컬 포함 (dstation/estation/istation/scheduling) + 포스터 5종
- [x] 챕터 타이틀 공통 패턴 (CHP-01~05): 영상 + 문자 단위 Kinetic Reveal + hover wave + 파티클 태그
- [x] D02 접속 시뮬레이션 다이어그램 (칩 hover 파티클 왕복·미러링·동일 가상PC 배지)
- [x] D03 '9배' 카운트업 강조
- [x] D04 GPU 8장 레이어 분해 + 게이지 레이스(15% vs 90%) + 레이어:워크로드 hover 매핑
- [x] D05 가치 스텝 리빌 + 카운터 + 5FPS/64FPS 시뮬레이션 + MIG 비교표 + 활용 분야 그리드
- [x] D07 3D Flip 카드 (hover 플립 / 클릭 고정 / 일괄 시연)
- [x] D08 주간↔야간 상태 전환 (영상 구간 동기화, 스트림 재구성, 태양↔달 교대)
- [x] D09 채팅 타이핑 데모 + 특징 노드 4종 연결 + hover 매핑
- [x] D10 3단 플로우 + GPU 랙 LED + 파티클 응집 피날레 + 종료 후 Overview 오픈
- [x] 신규 전환 3종 (fly / wipe / particle), Overview 16장 4열 확장
- [x] 전 16장 QA 콘솔 에러 0건

## 03덱 — 교육 플랫폼 (5장, 03_기능명세서 v1.0)
- [x] 슬라이드 17~21 마크업 (Tstation 챕터 3장 + CAS 챕터 2장)
- [x] scenes3.js 씬 컨트롤러 5종 (T01~T05), scenes2 CHAPTER_SCENE/VIDEO_BG 공용화
- [x] components3.css (bento-grid·IaC 폴백·hub-tabs 목업 스타일)
- [x] T01/T04 챕터 타이틀 공통 패턴 재사용 (CHAPTER 04·05, Kinetic Reveal)
- [x] T04 CAS 키워드 칩 5종 → 라인 연결(All-in-One 시각화, S04-AC-02 1.2s)
- [x] T02 IaC 인포그래픽 구간 재생 + HTML 인포그래픽 폴백(S02-FBK-01) 병행, 자막 칩 교체
- [x] T03 벤토 그리드 6카드 + 카드별 마이크로 데모 6종 + 좌상→우하 자동 시연(S03-INT-03)
- [x] T05 허브+탭 목업 4종 + 자동 순회(1바퀴) + 공통 기반 배지 + 브릿지 Path Drawing
- [x] content.js 메타데이터 5장 추가, config.iacSegments, index.html CSS/JS 링크
- [x] 전 21장 QA 콘솔 JS 에러 0건 (미디어 404는 폴백으로 흡수)
- [ ] **03덱 미디어 3종 생성** (MCP Kling/Higgsfield 인증 필요, K-13):
      `tstation-loop.mp4`·`cas-loop.mp4` 배경 영상 + 포스터, `iac-seg-{a,b,c}.mp4` 인포그래픽
- [ ] 미디어 탑재 후 재QA + 통합 리허설(총 62스텝 config 병합 옵션 검토)

## 후속 (선택)
- [ ] 히어로·챕터 영상 1080p 업스케일 교체 (K-01·K-09)
- [ ] S08 24h 타임라인 스크러버 (P1, K-11)
- [ ] S09 채팅 데모 실제 스크립트 반영 (K-12)
- [ ] Overview 여정 라인 SVG Path Drawing (O-11, P1)
- [ ] S02 칩별 부분 스포트라이트 마스크 (K-06)
- [ ] PDF Export / 자동 리허설 모드 (PRD 14.2)
