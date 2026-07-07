/* config.js — 발표 설정 */
window.CONFIG = {
  title: "AI Native Campus",
  totalLabel: 21,

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
  },
};
