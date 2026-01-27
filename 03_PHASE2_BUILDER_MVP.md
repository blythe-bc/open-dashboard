# Phase 2 — Builder MVP
목표: 정책 기반으로 제한된 대시보드를 생성/편집(Draft)하고 Publish 할 수 있다.

---

## 0) 범위 (In / Out)
### In
- Builder 라우트: `/builder/{dashboardId}`
- react-grid-layout 위젯 배치(추가/삭제/이동/리사이즈)
- 위젯 2종:
  - ChartWidgetConfig(Basic)
  - GridWidgetConfig(Basic)
- Inspector 탭 2개만:
  - Data(데이터셋/메트릭/필터/그룹핑 최소)
  - Visual(차트 타입 최소 3개: line/bar/pie, 그리드 컬럼 표시/정렬 최소)
- Draft 자동저장
- Publish(Policy.allowPublishByBuilder true일 때)

### Out
- Undo/Redo(Phase 3)
- Multi-select 정렬/간격
- Expert override(Phase 3~4)
- Conditional formatting 편집 UI(Phase 3)
- Drill 편집 UI(Phase 3) — 단, hierarchy “사용 여부 토글” 정도는 가능

---

## 1) DashboardConfig(초기 스키마 권장)
- dashboardId/workspaceId/name/description
- globalFilters (표준 param_name dict)
- layout: react-grid-layout items
- widgets: map(widgetId → widget config)
- status: draft/published
- version info

> MVP에서는 “스키마를 단순”하게, 확장은 Phase 3부터.

---

## 2) Builder 권한/제한 규칙
- `/api/me/policies`의 catalog를 기준으로:
  - 선택 가능한 dataset/metric/endpoint만 노출
  - allowedParams 기반으로 필터 UI 제한
  - Expert 탭 숨김(기본 OFF)

---

## 3) Publish 플로우(최소)
- Draft config → Published config 복사 + version 증가
- Viewer에서 동일 dashboardId로 조회 시 Published 렌더

---

## 4) Acceptance Criteria
- Builder에서 새 대시보드 생성/편집/저장 가능
- Publish 후 Viewer에서 동일 내용 확인 가능
- 정책 위반(허용되지 않은 dataset/param)은 UI에서 애초에 선택 불가
