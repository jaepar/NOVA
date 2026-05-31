# Domains AGENTS Guide

적용 범위: `src/app/domains/*`

이 문서는 약관 동의 도메인 공통 규격을 정의한다.  
`src/app/domains` 하위 작업 시 본 문서를 우선 참고한다.

시스템 가이드라인 원칙:

- 이 문서는 `src/app/domains` 범위의 시스템 가이드라인 소스다.
- `README.md`는 시스템 가이드라인 소스로 취급하지 않는다.

## 1) 핵심 목표

- 서비스별 약관 페이지를 동일한 데이터 구조/상태 규칙으로 구현한다.
- 약관 교체 시 페이지 로직이 아니라 정의 파일만 바꿔 반영한다.

## 2) 현재 폴더 구조

- `spec.ts`: 약관 정의 타입/유틸
- `storage.ts`: Zustand 기반 약관 상태 저장 API
- `definition.sample.ts`: 공통 샘플 정의
- `certificate-consent/definition.certificate.ts`: 인증서 발급 실사용 정의
- `verification-consent/definition.passport-consent.ts`: 여권 인증 실사용 정의
- `verification-consent/definition.liveness-consent.ts`: 생체인증 실사용 정의
- `account-consent/definition.open-account.ts`: 계좌개설 실사용 정의

## 3) 구현 규칙

- `ConsentDefinition.version`은 `v1`을 사용한다.
- 체크/아코디언/캐러셀 상태는 반드시 `storage.ts` API를 사용한다.
- `window.sessionStorage` 직접 접근을 금지한다.
- 약관 메인/상세/캐러셀 이동 시 라우트 상태 플래그(`preserve...State`)로 내부 복귀를 구분한다.
- 단건 상세 페이지 버튼 텍스트는 `동의하기`를 유지한다.
- 카테고리 캐러셀 버튼 텍스트는 `모두 동의하기`를 유지한다.

## 4) 수정 절차

1. 요구사항 확인:
- 카테고리 개수(필수/선택)
- 카테고리별 세부 약관 개수

2. 정의 파일 작성:
- 새 서비스는 `definition.sample.ts`를 복사해 도메인 폴더에 실사용 정의 생성

3. 페이지 연결:
- `ConsentOverviewAccordion`, `ConsentTermDetailView`, `ConsentCategoryCarouselView`에 정의 파일 주입

4. 상태/복귀 검증:
- 필수 동의 완료 판정
- 상세/캐러셀 진입/복귀 시 상태 유지
- 신규 진입 시 초기화

## 5) 유지보수 원칙

- 실사용 정의와 샘플 정의를 분리 유지한다.
- 실사용 정의 파일명은 `definition.<domain-or-scenario>.ts` 패턴을 사용한다.
  - 예: `definition.certificate.ts`, `definition.liveness-consent.ts`, `definition.open-account.ts`
- 공통 규격(`spec.ts`, `storage.ts`) 변경 시 관련 페이지/정의/문서를 함께 갱신한다.
