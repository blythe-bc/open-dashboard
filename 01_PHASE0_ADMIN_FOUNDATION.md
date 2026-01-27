# Phase 0 — Admin Foundation (MVP 핵심)
목표: **정책/권한/시맨틱/엔드포인트/매핑**을 Admin에서 정의하고, Builder/Viewer가 이를 상속할 수 있게 만든다.

---

## 0) 범위 (In / Out)
### In
- Workspace + WorkspacePolicy CRUD
- AD Group ↔ Role Binding CRUD
- Semantic 최소: Dataset/Metric/Hierarchy(연결)
- Endpoint(SP) CRUD: timeout/max_rows
- SPParameterMap CRUD: param_name → sp_param + transform + 제한(max_items/regex)
- `/api/me/policies` 번들 구현
- 기본 Standards seed: theme 1개 + conditional class tokens allowlist

### Out (Phase 0에서는 제외)
- Standards UI 완전 구현(theme/preset 편집 화면)
- Release/Rollback UI(Phase 4)
- Perf dashboard(Phase 4)
- Expert override UI(Phase 3~4)

---

## 1) Admin 화면 (최소 5개)
1. Workspace & Policy
2. Role Bindings (AD group ↔ Role)
3. Datasets (allowedParams, hierarchy 연결)
4. Endpoints(SP)
5. ParamMap editor (transform, max_items, regex)

---

## 2) 데이터 모델(필수 테이블)
- Workspace / WorkspacePolicy / WorkspaceRoleBinding
- SemanticDataset / SemanticMetric
- SemanticHierarchy / SemanticDatasetHierarchy
- SemanticMetricEndpoint / SPParameterMap
- AuditLog(최소: admin 변경 이벤트)

---

## 3) `/api/me/policies` (필수 계약)
### 요구사항
- 로그인 사용자(헤더 기반)의 workspace 목록 + role 반환
- 각 workspace별로:
  - policy 토글
  - 사용 가능한 dataset 목록 + allowedParams + hierarchies
  - metrics + endpointId
  - endpoint 제한값(timeout, max_rows, max_items)
  - standards 최소(allowedClassNames, themeId)

### Acceptance Criteria
- Builder/Viewer는 **이 번들만**으로 UI 제한이 가능해야 한다.
- allowedParams 외 파라미터는 이후 Phase 1에서 400으로 차단되어야 한다.

---

## 4) Seed 데이터(권장)
- 기본 Workspace 1개(ws_default)
- 기본 Policy 1개(Expert OFF)
- 기본 Theme 1개(corp_default)
- allowedClassNames: ok/warn/fail/muted/info/accent
- 샘플 Dataset + Endpoint + ParamMap 1세트

---

## 5) 테스트/검증
- AD 그룹이 바뀌면 `/api/me/policies` 결과가 즉시 달라진다.
- DataAdmin만 endpoint/paramMap 편집 가능
- PlatformAdmin만 workspace/policy 변경 가능(권장)

---

## 6) 산출물(Deliverables)
- Admin UI MVP
- Meta DB 마이그레이션 스크립트
- `/api/me/policies` API 문서
- Seed 스크립트
