/* content.js — 슬라이드 메타데이터 (Content Driven 원칙)
 * 씬의 마크업은 index.html에, 목차·노트·전환 설정은 여기서 관리한다. */
window.CONTENT = [
  {
    id: "opening",
    section: "Opening",
    title: "AI Native Campus로의 전환",
    transition: "fade",
    art: "radial-gradient(circle at 30% 25%, rgba(79,124,255,0.5), transparent 60%), radial-gradient(circle at 80% 75%, rgba(0,229,255,0.3), transparent 55%)",
    notes: "발표 첫인상. 캠퍼스 영상 위 타이틀 리빌과 거버닝 카피가 자동으로 이어짐. 'AI를 도입하는 대학에서, AI로 태어나는 대학으로'를 힘 있게 낭독.",
  },
  {
    id: "context",
    section: "Background",
    title: "AI는 이미 학습과 행정의 기본 도구가 되었다",
    transition: "blur-fade",
    art: "linear-gradient(100deg, rgba(26,29,38,0.9) 0 50%, rgba(20,34,77,0.9) 50% 100%)",
    notes: "금지의 시대→권장의 시대 인식 전환. 마우스를 좌우로 움직이며 Before/After를 보여줄 것. 진행 입력 한 번이면 After 리빌과 학습·연구·행정·업무 칩이 자동으로 이어짐.",
  },
  {
    id: "voices",
    section: "Problem",
    title: "현장의 목소리",
    transition: "push",
    art: "radial-gradient(circle at 50% 40%, rgba(124,92,255,0.45), transparent 60%)",
    notes: "학생→교수→운영자 순서로 증언 카드 회전. 각 페르소나 대사를 1개씩만 읽고 템포 유지. 마지막 결론 카피: '뒷받침할 AI 통합 인프라가 없다'.",
  },
  {
    id: "painpoints",
    section: "Problem",
    title: "대학이 안고 있는 복합적인 Pain Point",
    transition: "fade",
    art: "radial-gradient(circle at 25% 30%, rgba(255,92,122,0.35), transparent 55%), radial-gradient(circle at 75% 70%, rgba(79,124,255,0.3), transparent 55%)",
    notes: "카드 4장이 자동으로 하나씩 등장하고 얽힘 라인이 이어서 그려짐. 각 문제를 짚은 뒤 '문제는 서로 얽혀 있다' 강조 — 개별 해결이 불가능함을 설득.",
  },
  {
    id: "solution",
    section: "Solution",
    title: "단 하나의 통합 인프라",
    transition: "morph",
    art: "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.4), transparent 58%)",
    notes: "흩어진 전공·자원 노드를 보여준 뒤(호버로 툴팁 시연 가능), 스텝2에서 중앙으로 응집. 핵심 문장: '모든 전공의 기본 도구로 내재화한다'.",
  },
  {
    id: "architecture",
    section: "Architecture",
    title: "AI 인프라 표준 프레임워크",
    transition: "zoom",
    art: "linear-gradient(160deg, rgba(39,87,214,0.35), rgba(124,92,255,0.25) 55%, rgba(12,138,95,0.25))",
    notes: "스텝①: 이용자 트랙 3장 등장. 진행 입력 한 번(스텝②)이면 API/vGPU 커넥터+Slurm/K8s → 내부 모듈 4종 → VDI → 외부 LLM·전체 조망이 자동으로 이어짐(약 7초). 조망 상태에서 트랙에 호버하면 자원 경로가 하이라이트됨.",
  },
];
