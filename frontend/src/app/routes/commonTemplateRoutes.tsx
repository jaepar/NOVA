import type { RouteObject } from 'react-router-dom'
import { lazyComponent } from './lazyRoute'

export const commonTemplateRoutes: RouteObject[] = [
  { path: '/consent-template', lazy: lazyComponent(() => import('../pages/common/ConsentTemplate'), 'ConsentTemplate') },
  { path: '/consent-template/terms/:termId', lazy: lazyComponent(() => import('../pages/common/ConsentDetailTemplate'), 'ConsentDetailTemplate') },
  { path: '/consent-template/categories/:categoryId/consent', lazy: lazyComponent(() => import('../pages/common/ConsentCategoryCarouselTemplate'), 'ConsentCategoryCarouselTemplate') },
  {
    path: '/loading',
    lazy: async () => {
      const { Loading } = await import('../pages/common/Loading')

      return {
        Component: () => (
          <Loading
            headerTitle="Template"
            task="Task"
            description="description(optional)"
            spinnerSize="lg"
          />
        ),
      }
    },
  },
  {
    path: '/failed',
    lazy: async () => {
      const { Failed } = await import('../pages/common/Failed')

      return {
        Component: () => (
          <Failed
            headerTitle="Template"
            task="Task"
            description="description(optional)"
            buttonText="돌아가기"
            redirectPath="/"
          />
        ),
      }
    },
  },
  {
    path: '/success',
    lazy: async () => {
      const { Success } = await import('../pages/common/Success')

      return {
        Component: () => (
          <Success
            headerTitle="Template"
            task="Task"
            description="description(optional)"
            buttonText="확인"
            redirectPath="/main"
          />
        ),
      }
    },
  },
  {
    path: '/one-button-template',
    lazy: async () => {
      const { OneButtonTemplate } = await import('../pages/common/OneButtonTemplate')

      return {
        Component: () => (
          <OneButtonTemplate headerTitle="Template" buttonText="확인" redirectPath="/">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <h2 className="text-xl">1열 버튼 템플릿</h2>
              <p className="text-muted-foreground text-center">
                이 페이지는 재사용 가능한 템플릿입니다.
                <br />
                원하는 컨텐츠를 children으로 전달하세요.
              </p>
            </div>
          </OneButtonTemplate>
        ),
      }
    },
  },
  {
    path: '/two-button-template',
    lazy: async () => {
      const { TwoButtonTemplate } = await import('../pages/common/TwoButtonTemplate')

      return {
        Component: () => (
          <TwoButtonTemplate
            headerTitle="Template"
            leftButtonText="취소"
            rightButtonText="다음"
            leftRedirectPath="/"
            rightRedirectPath="/main"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <h2 className="text-xl">2열 버튼 템플릿</h2>
              <p className="text-muted-foreground text-center">
                이 페이지는 재사용 가능한 템플릿입니다.
                <br />
                좌측 버튼: 취소, 이전, 재촬영 등
                <br />
                우측 버튼: 다음, 확인, 완료 등
              </p>
            </div>
          </TwoButtonTemplate>
        ),
      }
    },
  },
  {
    path: '/close-button-template',
    lazy: async () => {
      const { CloseButtonTemplate } = await import('../pages/common/CloseButtonTemplate')

      return {
        Component: () => (
          <CloseButtonTemplate headerTitle="Template" closePath="/">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <h2 className="text-xl">닫기 버튼 템플릿</h2>
              <p className="text-muted-foreground text-center">
                이 페이지는 재사용 가능한 템플릿입니다.
                <br />
                우측 상단 X 버튼으로 닫을 수 있습니다.
                <br />
                뒤로가기 버튼은 표시되지 않습니다.
              </p>
            </div>
          </CloseButtonTemplate>
        ),
      }
    },
  },
]
