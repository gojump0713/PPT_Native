/* config.js — 발표 설정 */
window.CONFIG = {
  title: "AI Native Campus",
  totalLabel: 6,

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

  // 휠 스텝 임계값
  wheelThreshold: 90,
  wheelCooldownMs: 550,
};
