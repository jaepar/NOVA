# FDS Server: NOVA

On-Premise 환경에서 사용하는 Python 기반 해외송금 이상거래 탐지 서버.

## Service Scope

- CoreBanking 서버가 전달한 해외송금 원장 스냅샷 심사
- Isolation Forest 기반 이상거래 점수 산출
- 임계값 기준 `SUCCESS` 또는 `FAILED` 판정 반환
- FDS 모델 입력 필드 튜닝 및 임계값 관리

## Immutable Rules

- FDS 서버는 CoreBanking 원장과 계좌 원장을 직접 수정하지 않는다.
- FDS 서버는 해외송금 거래를 직접 취소하지 않는다.
- FDS 서버는 심사 결과만 반환하고, 상태 변경과 환급은 CoreBanking에서 처리한다.
- 계좌번호 전체, 식별정보 원문, 비밀정보는 코드/로그/예외 메시지에 노출하지 않는다.

## Do

- 계약 우선: `coreBanking -> fds-server` API 스펙을 먼저 고정하고 구현한다.
- 초기 FDS 요청은 `global_transaction` 전체 필드 스냅샷을 기준으로 받고, 모델 성능 튜닝 후 입력 필드를 축소한다.
- 응답 상태는 `SUCCESS | FAILED`만 사용한다.
- `FAILED` 판정은 `failureReason`으로 원인을 구분한다.
- 모델 점수와 임계값은 추적 가능한 형태로 응답 또는 감사 로그에 남긴다.

## Don't

- FDS에서 출금, 입금, 환급, 원장 상태 변경을 수행하지 않는다.
- FDS를 클라우드 AI 챗봇 서버와 섞지 않는다.
- 운영 경로에 심사 우회 플래그를 추가하지 않는다.
- 모델 판단 근거 없이 임의 비즈니스 규칙으로 실패 처리하지 않는다.

## API Design Rules

- 경로 prefix는 `/fds`를 사용한다.
- CoreBanking 서버 간 호출만 허용한다.
- 요청/응답 DTO는 엔티티와 분리한다.
- 실패 사유 코드는 문서화된 값만 반환한다.

## Logging Rules

- 민감정보는 마스킹한다.
- 심사 요청 진입, 모델 판정 결과, 응답 반환, 예외 발생 지점을 로그로 남긴다.
- 통신 장애 처리는 CoreBanking 책임이므로 FDS는 자체 판정 실패와 서버 오류를 구분해 응답한다.

## Document Priority

충돌 시 아래 우선순위를 따른다.

1. `fds/AGENTS.md`
2. 루트 `AGENTS.md`
3. `fds/docs/rest_api.md`
4. 실제 코드
