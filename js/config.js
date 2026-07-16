/* config.js — 발표 설정 */
window.CONFIG = {
  title: "AI Native Campus",
  totalLabel: 37,

  // 모션 강도 (1 = 기본). reduced-motion·저사양 시 자동 무시
  motionScale: 1,

  // 저사양 모드 강제: null(자동 감지) | true | false
  lowPowerOverride: null,

  // 초기 FPS 측정 (PRD 8.3)
  fpsProbeSeconds: 3,
  fpsThreshold: 45,

  // S04 카드 등장을 2장씩 묶기 (스텝 과다 시 — 기능명세서 9절)
  s04PairCards: false,

  // 전환 시간 (초)
  transition: { normal: 0.8, chapter: 1.2 },

  // 마지막 슬라이드 마지막 스텝에서 진행 입력 시 Overview 자동 오픈 (S10-INT-03)
  openOverviewAtEnd: true,

  // 휠 스텝 임계값
  wheelThreshold: 90,
  wheelCooldownMs: 550,

  // S02 IaC 인포그래픽 구간 영상 (구간 A/B/C 개별 파일, 스텝 동기 재생 — scenes3.js)
  // 파일 부재 시 error 이벤트로 자동 HTML 인포그래픽 폴백(S02-FBK-01) 전환
  iacSegments: ["iac-seg-a.mp4", "iac-seg-b.mp4", "iac-seg-c.mp4"],

  // 자동 시퀀스 슬라이드: 진입 시 클릭 없이 스텝을 자동 진행 (COM-03 예외)
  // 값 = [스텝1까지 지연, 스텝2까지 지연, …] (ms, 직전 스텝 기준). 수동 입력 시 즉시 취소.
  autoplay: {
    "estation": [2600],                     // 챕터 인트로 후 '9배' 카운트업 자동
    "gpu-slicing": [1300, 1800, 2100],      // 신규 패널 → 레이어 분해 → 활용률 레이스 자동
    "tstation-features": [1400, 1900],      // 헤드라인 → 상단 3카드 → 하단 3카드+일괄 시연 자동
    "cas-platform": [1300, 1900, 8200],     // 헤드라인 → 허브 → 탭 자동 순회(1바퀴) → 공통 기반 자동
    "vdi-concept": [1400, 1600, 2200],      // 좌측 → Cloud Center → 접속 칩+버스+시연 → 강조
    "daas-value": [1400, 1500, 1600, 1800], // 가치①②③ → 비교표 → 활용률 막대
    "istation-features": [1600, 2400],      // 카드 3장 → 일괄 플립 시연 → 결론
    "scheduling": [2600, 2600],             // 야간 전환 → (이어서) 결론 텍스트 자동
    "jeju-case": [2400, 7000, 1600],        // 인사 → 질의응답 데모 → 노드 연결 → 결론
    "closing": [1400, 1500, 1900],          // 헤드라인 → 기존방식 → 자체보유 → 정부무기+응집
    /* 06 덱 · Colab vs Tstation — 별도 조작 없이 순차 빠른 자동 진행 */
    "cl-intro": [900, 1000],                // Colab 장점 → 대학 요구 조건 → 문제 카드 5장
    "cl-runtime": [4200, 1300],             // 타임라인 데모(종료→루프백) → 현장 영향 → 결론
    "cl-data": [1300, 3400],                // 구조(30명) → 60→100 확대 시연 → 영향+결론
    "cl-collab": [1100, 1100, 1100],        // 카드 4장 → 환경 차이 → 통합 충돌 → Tstation 공간
    "cl-gpu": [1200, 1700],                 // 분산 구조 → Pool 통합 → 시간표 배분+핵심 문구
    "cl-monitor": [1500, 1700],             // 질문 카드 → 분산 시스템 얽힘 → 대시보드+결론
    "cl-solution": [1700, 1500],            // 해결 구조 5기능 → 비교표 → 핵심 카피
    "cl-effect": [1700],                    // 수혜 대상 4카드 → 핵심 문구 3
  },

  // 클릭/화살표 한 번에 스텝을 건너뛰고 곧바로 다음 슬라이드로 (autoplay로 내용은 자동 노출)
  singleAdvance: [
    "istation-features", "jeju-case", "closing",
    "cl-intro", "cl-runtime", "cl-data", "cl-collab", "cl-gpu", "cl-monitor", "cl-solution", "cl-effect",
  ],
};
