# BI Platform (PowerBI/MS Fabric-like) — Master Plan (v1)
- 기준일: 2026-01-28
- 구현 방식(확정): **Next.js 풀스택 + DB Daemon(SP 보호층) + IIS Windows Auth 헤더 전달**
- 목표: 사내 AD 기반으로 관리자가 허용한 데이터(Endpoint/SP)만 사용해 대시보드를 생성/배포/공유하는 웹 플랫폼 구축

---

## 0) 핵심 원칙 (변하지 않는 계약)
### 보안/거버넌스
1. **사용자 인증**: IIS Windows Integrated Auth → Next에 `X-Auth-User`, `X-Auth-Groups` 전달
2. **권한 소스**: `/api/me/policies` 번들(단일 Source of Truth)
3. **DB 접근**: UI/Next는 **Meta DB만 직접 접근** 가능, 실제 분석 DB 접근은 **Daemon**만 가능
4. **DB 실행**: **SP whitelist + SPParameterMap(표준 param_name → SP param) + timeout/maxRows/maxItems + 감사로그**
5. **Expert override**: 기본 OFF(WorkspacePolicy로만 허용)

### 제품/UX
1. Admin이 정의한 **Semantic/Endpoint/Policy**를 Builder/Viewer가 그대로 상속(자동 제한 UI)
2. Draft 자동저장 + Publish 명시 배포(조회는 Published 기반)
3. 대용량 가드레일: chart points ≤ 5000 / grid client rows ≤ 5000(정책으로 강제)
4. 외부 공유 금지(내부 AD만), 공유 URL은 Published 기준

---

## 1) 단계(Phase) 로드맵
> 파일별 상세 PRD/체크리스트는 각 Phase 문서 참고

### Phase 0 — Admin Foundation (정책/시맨틱/엔드포인트)
- Workspace/Policy
- AD Group ↔ Role Binding
- Dataset/Metric/Hierarchy 최소
- Endpoint(SP) + SPParameterMap 구축
- `/api/me/policies` 번들 구현

**산출물**
- Admin 콘솔 MVP
- Meta DB 스키마 반영
- Seed 데이터(기본 workspace/policy/standards)

### Phase 1 — Runtime + Viewer MVP
- `/api/query/execute`(Next → Daemon)
- Viewer: Published 대시보드 렌더(Chart/Grid)

**산출물**
- Viewer MVP(2 위젯 타입)
- Daemon 실행/감사 로그 정상

### Phase 2 — Builder MVP
- Builder: react-grid-layout 기반 배치
- Widget Basic 설정(Inspector: Data/Visual)
- Draft 저장 + Publish

**산출물**
- Builder MVP → Publish → Viewer에서 확인

### Phase 3 — Productization (사용성/드릴/필터/저장된 뷰)
- Undo/Redo(권장)
- Drill 상태 URL 반영 + Breadcrumb
- Saved View(조회자용)
- Conditional Formatting UI(DSL 편집) 1차
- Preset 확대(차트 타입 확장)

### Phase 4 — Admin Advanced (표준/배포/감사/성능)
- Release/rollback UI
- Impact preview(영향 대시보드/위젯)
- Standards UI(Theme/Presets/Tokens)
- Sanitizer ruleset 관리 UI
- Perf 대시보드(Endpoint p95/timeout/cache hit)

### Phase 5 — Enterprise Features
- Export(PDF/Excel) / Scheduled refresh (옵션)
- Embed(내부) / API 토큰(내부 서비스용)
- 세밀 권한(Dataset/Metric/Object-level) 강화
- 고급 캐시/프리페치/쿼리 최적화

### Phase 6 — LLM Integration (옵션)
- LLM Endpoint Registry(LMStudio)
- “대시보드 설명/요약/인사이트” + “SQL/SP suggestion(읽기전용)” 단계적 도입
- 보안: 데이터 유출 방지(요약만, 마스킹, 정책 기반)

---

## 2) 완성 정의 (Final Completion)
“PowerBI-like” 최소 완성 기준:
1. Admin이 Semantic/Endpoint/Policy를 안전하게 관리
2. Builder가 정책 기반으로 대시보드 생성/배포
3. Viewer가 안정적으로 조회/공유(내부 AD)
4. 감사/성능/롤백 등 운영 기능 확보
5. 사용자 설정(필터/드릴/서식) 경험이 충분히 성숙

---

## 3) 문서 패키지 구성
- `01_PHASE0_ADMIN_FOUNDATION.md`
- `02_PHASE1_RUNTIME_VIEWER.md`
- `03_PHASE2_BUILDER_MVP.md`
- `04_PHASE3_PRODUCTIZATION.md`
- `05_PHASE4_ADMIN_ADVANCED.md`
- `06_PHASE5_ENTERPRISE_FEATURES.md`
- `07_PHASE6_LLM_INTEGRATION.md`
- `PROMPT_CODEX_IMPLEMENTATION.md` (Codex용)
- `PROMPT_CLAUDECODE_REVIEW.md` (Claude Code용, 선택)

---

## 4) 권장 운영 방식
- 모든 설정/정책/시맨틱 변경은 **Draft → Publish**
- 배포 시 Impact preview 확인 + Audit 기록
- Endpoint/SP의 고위험 옵션(함수 주입/외부 URL/스크립트)은 Sanitizer로 차단
