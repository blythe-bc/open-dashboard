# Phase 4 — Admin Advanced (표준/배포/감사/성능)
목표: 운영 가능한 BI 플랫폼으로 성숙(배포/롤백/표준/감사/성능).

---

## 0) 범위 (In)
### Release Management
- Draft → Publish(semantic/endpoint 포함) + 버전 기록
- Rollback UI
- Impact Preview(최소)
  - 영향 Dashboard 수
  - 최근 24h 호출량/에러율
  - 위험 변경(파라미터 제거/타입 변경) 경고

### Standards UI
- Theme tokens 관리(선택)
- Presets 관리(차트/그리드 템플릿)
- Conditional class tokens allowlist 편집

### Sanitizer ruleset UI
- ECharts/AG Grid block/warn/autofix 규칙 편집
- 위험 키(함수/외부 URL/renderer 등) 차단 유지

### Perf & Audit
- Endpoint별 p95/timeout/cache hit
- Audit 검색(누가/언제/무엇을 변경/실행)

---

## 1) Acceptance Criteria
- 관리자가 변경 후 영향 범위를 확인하고 배포 가능
- 문제 발생 시 특정 버전으로 롤백 가능
- 운영자가 성능/에러를 추적 가능
