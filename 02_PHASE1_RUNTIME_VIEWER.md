# Phase 1 — Runtime + Viewer MVP
목표: 정책 기반으로 안전하게 데이터를 실행하고, Published 대시보드를 조회할 수 있게 한다.

---

## 0) 범위 (In / Out)
### In
- `/api/query/execute` (Next → Daemon)
- Next에서 사전 검증:
  - workspace 접근 가능?
  - endpoint 사용 가능?
  - param_name allowlist 통과?
  - alias 정규화 규칙 적용(구체 레벨 우선)
- Daemon 실행:
  - endpointId → sp_name
  - SPParameterMap 변환/검증/transform
  - timeout/maxRows/maxItems 강제
  - parameterized SP 실행
  - 실행 감사로그 기록
- Viewer MVP:
  - Published Dashboard 렌더
  - ChartWidget(ECharts) + GridWidget(AG Grid) 2종만

### Out
- Saved view / Cross-filter / Drill-through
- Export/PDF/Excel
- Snapshot share

---

## 1) `/api/query/execute` 계약
### 입력
- workspaceId, endpointId, params(표준 param_name dict)
- client context(dashboardId/widgetId/purpose)

### 출력
- columns + rows
- meta: normalizedParams, warnings, cacheKey, cached, durationMs

---

## 2) Viewer MVP 기능
- 라우트: `/dash/{dashboardId}`
- Published 버전만 조회(401/403/404 정책 명확히)
- 전역 필터 적용(단, MVP에서는 필터 UI를 최소화해도 됨)

---

## 3) 성능/가드레일(필수)
- chart points <= policy.maxChartPoints(초과 시 서버 다운샘플 또는 에러)
- grid client rows <= policy.maxGridClientRows(초과 시 infinite 강제 또는 에러)
- Daemon rate limit(기본: user+endpoint 기준)

---

## 4) 감사로그(최소)
- 누가(endpointId) 실행했는지 + duration + rowCount + 에러 코드

---

## 5) Acceptance Criteria
- Viewer에서 Published 대시보드가 Chart/Grid로 정상 표시
- allowedParams 외 요청은 400
- 권한 없는 endpoint 호출은 403
- Daemon 로그에 실행 기록이 남음
