# Phase 6 — LLM Integration (옵션)
목표: LM Studio(자가 호스팅 LLM) 연동으로 “인사이트/설명/요약”을 안전하게 제공.

---

## 0) 원칙(보안)
- LLM에 원본 데이터 전체를 보내지 않는다(요약/집계/마스킹 우선)
- Prompt injection 방어(시스템 프롬프트 고정 + tool schema 엄격)
- WorkspacePolicy로 기능 on/off

---

## 1) 기능 단계
### 6-1) Dashboard Narration (Low risk)
- 현재 대시보드/필터 상태 요약
- KPI 변화 요약(집계 기반)

### 6-2) Insight Suggestions (Medium)
- 이상치 탐지 제안(룰 기반 + LLM 설명)
- 다음 drill 추천

### 6-3) Query Assistant (High)
- SP 추천/설명(읽기 전용)
- 실제 실행은 Admin 승인 필요(권장)

---

## 2) Acceptance Criteria
- 정책 기반으로 LLM 기능을 안전하게 제공
- 감사로그에 “누가 어떤 프롬프트로 요청했는지” 기록
