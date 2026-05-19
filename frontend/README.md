# NOVA Mobile App

외국인을 위한 모바일 뱅킹 애플리케이션

## 📱 프로젝트 개요

- **타겟 디바이스**: iPhone 13 (390 x 844)
- **플랫폼**: Web View 기반 모바일 앱
- **주요 기능**: 계좌 관리, 송금, 환전, 거래 내역, 알림

## 🛠 기술 스택

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS v4
- **상태 관리**: React Hooks
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **패키지 매니저**: pnpm
- **UI 라이브러리**: Material-UI, Lucide Icons

## 🚀 시작하기

### 1. 필수 요구사항

- **Node.js**: 18.x 이상
- **pnpm**: 8.x 이상

pnpm이 설치되어 있지 않다면:
```bash
npm install -g pnpm
```

### 2. 설치

```bash
# 저장소 클론
git clone <repository-url>
cd <project-directory>

# 의존성 설치
pnpm install
```

**📦 패키지 파일 설명:**

- **`package.json`**: 프로젝트 의존성 및 스크립트 정의
- **`pnpm-workspace.yaml`**: pnpm 워크스페이스 설정 (현재 루트 패키지만 사용)
- **`pnpm-lock.yaml`**: 의존성 버전 잠금 파일 (자동 생성, 수정 금지)

`pnpm install` 명령어는 위 파일들을 읽어 자동으로 의존성을 설치합니다.

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
# API Configuration
VITE_API_BASE_URL=https://your-api-url.com

# Environment
VITE_ENV=development
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

개발 서버가 실행되면 자동으로 브라우저가 열립니다.
기본 주소: `http://localhost:5173`

### 5. 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

## 📁 프로젝트 구조

```
src/
├── api/                      # API 클라이언트 및 엔드포인트
│   ├── client.ts            # Axios 인스턴스 설정
│   ├── types.ts             # 공통 타입 정의
│   ├── endpoints/           # API 엔드포인트 함수들
│   └── README.md            # API 사용 가이드
├── app/
│   ├── components/          # React 컴포넌트
│   │   ├── design-system/  # 디자인 시스템 컴포넌트
│   │   │   ├── Btn_1Col.tsx
│   │   │   ├── Btn_2Col.tsx
│   │   │   ├── CommonInputGroup.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── tokens.ts   # 디자인 토큰
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   │   ├── FixedHeader.tsx
│   │   │   ├── FloatingBottom.tsx
│   │   │   ├── MobileLayout.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── BottomSheet.tsx
│   │   └── ui/             # shadcn/ui 컴포넌트들
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── common/         # 공통 템플릿 페이지
│   │   │   ├── Success.tsx
│   │   │   ├── Failed.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── OneButtonTemplate.tsx
│   │   │   ├── TwoButtonTemplate.tsx
│   │   │   └── CloseButtonTemplate.tsx
│   │   ├── Home.tsx
│   │   ├── Main.tsx
│   │   ├── Login.tsx
│   │   ├── Notifications.tsx
│   │   └── ...
│   ├── App.tsx             # 앱 진입점
│   └── routes.tsx          # 라우팅 설정
├── styles/
│   ├── theme.css           # CSS 변수 및 글로벌 스타일
│   └── fonts.css           # 폰트 import
└── imports/                # Figma 에서 가져온 컴포넌트

guidelines/                  # 개발 가이드라인
├── Guidelines.md           # (템플릿)

DESIGN_SYSTEM.md            # 디자인 시스템 문서
LAYOUT_GUIDELINES.md        # 레이아웃 가이드라인
```

## 📚 개발 가이드

### 필수 문서

개발 시작 전 반드시 읽어야 할 문서들:

1. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**
   - 디자인 토큰 (Spacing, Typography, Colors)
   - 컴포넌트 사용법 (Btn_1Col, Btn_2Col, CommonInputGroup)
   - 레이아웃 컴포넌트 (FixedHeader, FloatingBottom, MobileLayout)
   - 버튼 규칙 및 호버 효과

2. **[LAYOUT_GUIDELINES.md](./LAYOUT_GUIDELINES.md)**
   - 반응형 레이아웃 규칙
   - 스페이싱 표준
   - 페이지 구조 패턴
   - 체크리스트

3. **[src/api/README.md](./src/api/README.md)**
   - API 클라이언트 사용법
   - 엔드포인트 작성 가이드
   - 에러 처리 패턴

### 핵심 규칙 (Quick Reference)

```tsx
// ✅ DO: 디자인 시스템 버튼 사용
import { Btn_1Col, Btn_2Col } from './components/design-system/Btn_1Col';

<Btn_1Col variant="primary">확인</Btn_1Col>

// ❌ DON'T: 커스텀 button 태그 사용 금지
<button className="bg-primary">확인</button>
```

```tsx
// ✅ DO: 하단 버튼은 FloatingBottom으로 감싸기
import { FloatingBottom } from './components/layout/FloatingBottom';

<FloatingBottom>
  <Btn_1Col>계속하기</Btn_1Col>
</FloatingBottom>

// ❌ DON'T: 커스텀 div로 하단 버튼 배치 금지
<div className="fixed bottom-0">
  <Btn_1Col>계속하기</Btn_1Col>
</div>
```

```tsx
// ✅ DO: 호버 시 순수 색상 변경
className="hover:bg-blue-700"

// ❌ DON'T: 투명도 변경 금지
className="hover:opacity-90"
className="hover:bg-primary/90"
```

## 🎨 디자인 시스템 페이지

개발 중 디자인 시스템을 확인하려면:

```
http://localhost:5173/design-system
```

또는 홈 페이지에서 "Design System" 버튼 클릭

## 🧪 주요 명령어

```bash
# 개발 서버 실행
pnpm dev

# 타입 체크 (있는 경우)
pnpm type-check

# 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview

# 의존성 업데이트
pnpm update

# 새로운 패키지 설치
pnpm add <package-name>

# 개발 의존성 설치
pnpm add -D <package-name>

# package.json 스크립트 확인
pnpm run
```

### 패키지 관리

```bash
# 모든 의존성 재설치 (문제 발생 시)
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 특정 패키지 버전 설치
pnpm add <package-name>@<version>

# 패키지 제거
pnpm remove <package-name>

# 사용하지 않는 패키지 확인
pnpm outdated
```

## 🌐 주요 라우트

| 경로 | 설명 |
|------|------|
| `/` | 홈 (데모/네비게이션) |
| `/main` | 메인 앱 페이지 |
| `/login` | 로그인 |
| `/notifications` | 알림 |
| `/transfer` | 송금 |
| `/exchange` | 환전 |
| `/mypage` | 마이페이지 |
| `/transaction-history` | 거래 내역 |
| `/design-system` | 디자인 시스템 문서 |

전체 라우트는 `src/app/routes.tsx` 참조

## 🔧 트러블슈팅

### Vite 개발 서버가 실행되지 않을 때

```bash
# 포트가 이미 사용 중인 경우
pnpm dev -- --port 3000

# 캐시 삭제 후 재시작
rm -rf node_modules/.vite
pnpm dev
```

### 빌드 에러 발생 시

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 타입 에러 발생 시

```bash
# TypeScript 캐시 삭제
rm -rf node_modules/.cache
pnpm type-check
```

## 📝 코딩 컨벤션

### 컴포넌트 파일명
- PascalCase 사용: `UserProfile.tsx`
- 하나의 파일에 하나의 컴포넌트

### 폴더 구조
- 컴포넌트: `src/app/components/`
- 페이지: `src/app/pages/`
- API: `src/api/endpoints/`

### Import 순서
```tsx
// 1. 외부 라이브러리
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 내부 컴포넌트
import { MobileLayout } from '../components/layout/MobileLayout';
import { Btn_1Col } from '../components/design-system/Btn_1Col';

// 3. 타입
import { User } from '@/api/types';
```

---

**Built with Figma Make** 🎨
