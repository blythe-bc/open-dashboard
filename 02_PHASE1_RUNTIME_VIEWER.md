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
- requestId (필수, 클라이언트에서 생성 후 Daemon까지 그대로 전달)

### 출력
- columns + rows
- meta: normalizedParams, warnings, cacheKey, cached, durationMs

### 표준 에러 응답 스키마
- status (예: 400/403/500)
- errorCode (예: VALIDATION_FAILED, FORBIDDEN, DAEMON_ERROR)
- message (사람이 읽을 수 있는 오류 설명)
- requestId (요청 추적용 식별자, 항상 포함)

### 오류 조건 (명시)
- 400: 입력 검증 실패 (workspace/endpoint 접근 불가, allowlist 위반, param_name 규칙 위반 등)
- 403: 권한/인가 실패 (사용자 또는 토큰이 endpoint 실행 권한 없음)
- 500: Daemon 실행 실패/예외 (timeout, 내부 오류, 다운스트림 장애 포함)

### 응답 예시
성공:
```json
{
  "columns": [
    { "name": "country", "type": "string" },
    { "name": "sales", "type": "number" }
  ],
  "rows": [
    ["US", 1200],
    ["KR", 900]
  ],
  "meta": {
    "normalizedParams": { "from_date": "2024-01-01", "to_date": "2024-01-31" },
    "warnings": [],
    "cacheKey": "q:abc123",
    "cached": false,
    "durationMs": 153
  },
  "requestId": "req_01HV9J3Y3ZJ8N5K5Y9J4X2B7Q0"
}
```

에러:
```json
{
  "status": 400,
  "errorCode": "VALIDATION_FAILED",
  "message": "param_name 'fromDate' is not allowed",
  "requestId": "req_01HV9J3Y3ZJ8N5K5Y9J4X2B7Q0"
}
```

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
