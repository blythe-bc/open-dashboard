# Phase 3 — Productization (사용성/드릴/저장된 뷰/서식)
목표: “실제 사용자들이 매일 쓰는” 수준으로 Builder/Viewer 경험을 강화한다.

---

## 0) 범위 (In)
### Builder UX
- Undo/Redo (강력 추천)
- 다중 선택 + 정렬/간격 맞춤(선택)
- Inspector 확장: Interaction 탭 추가
- 차트 타입 확장(10개 확정 가능 시점)

### Drill & View
- Drill 상태 URL 반영(확정 정책)
- Breadcrumb + Backstack
- Saved View(조회자용): 필터 상태 저장/불러오기

### Conditional Formatting (DSL 편집 UI 1차)
- Grid 컬럼별 RuleSet 편집기
- allowedClassNames 토큰 기반 드롭다운
- 룰 개수/`in` 길이 제한 UI에서 즉시 검증

---

## 1) 차트 타입 10개 확정(권장 세트)
1) Line  2) Bar  3) Stacked Bar  4) Area
5) Pie/Donut  6) Scatter  7) Heatmap
8) Combo(Line+Bar)  9) KPI Card  10) Histogram

> 컴파일러는 basic → echarts option 변환으로 유지

---

## 2) Drill 계층(초기 추천)
- Time: year → quarter → month → week → day → hour
- Equipment: line → area → tool_group → tool → chamber
- Product: family → device → package → lot → wafer
- Quality: test_step → bin_group → bin → fail_code

---

## 3) Acceptance Criteria
- 사용자 피드백 기준 “편집 스트레스(undo)” 감소
- drill URL 공유로 동일 상태 재현 가능
- Saved View로 조회자 UX 향상
