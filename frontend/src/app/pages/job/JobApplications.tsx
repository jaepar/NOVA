import { useEffect, useState } from 'react'
import axios from 'axios'
import { ChevronLeft, ChevronRight, FileText, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  jobApi,
  type ApplicationItemResponse,
  type ApplicationPortfolioResponse,
  type ApplicationStatus,
} from '../../../api'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import { MobileLayout } from '../../components/layout/MobileLayout'

const statusLabels: Record<ApplicationStatus, string> = {
  PASSED: '합격',
  FAILED: '불합격',
  UNREAD: '읽지 않음',
  READ: '읽음',
}

const statusBadgeClasses: Record<ApplicationStatus, string> = {
  PASSED: 'border-green-100 bg-green-50 text-green-700',
  FAILED: 'border-red-100 bg-red-50 text-red-700',
  UNREAD: 'border-primary/20 bg-primary/10 text-primary',
  READ: 'border-border bg-secondary text-muted-foreground',
}

const statusDotClasses: Partial<Record<ApplicationStatus, string>> = {
  PASSED: 'bg-green-500',
  FAILED: 'bg-red-500',
  UNREAD: 'bg-primary',
}

function formatDate(value: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

function isImagePreviewUrl(value?: string) {
  if (!value) {
    return false
  }

  const pathname = value.split('?')[0].toLowerCase()
  return /\.(apng|avif|gif|jpe?g|png|svg|webp)$/.test(pathname)
}

function PortfolioPreviewModal({
  application,
  portfolios,
  isLoading,
  errorMessage,
  onClose,
}: {
  application: ApplicationItemResponse
  portfolios: ApplicationPortfolioResponse
  isLoading: boolean
  errorMessage: string
  onClose: () => void
}) {
  const [portfolioIndex, setPortfolioIndex] = useState(0)
  const portfolio = portfolios[portfolioIndex]
  const hasMultiplePortfolios = portfolios.length > 1
  const appliedDate = formatDate(application.applied_at)
  const isImagePreview = isImagePreviewUrl(portfolio?.url)

  const movePortfolio = (direction: -1 | 1) => {
    setPortfolioIndex((current) => {
      const next = current + direction

      if (next < 0) {
        return portfolios.length - 1
      }

      if (next >= portfolios.length) {
        return 0
      }

      return next
    })
  }

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/65 px-5 py-8">
      <div className="flex h-[78%] w-full flex-col rounded-xl bg-background p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-4 flex shrink-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-[17px] font-semibold leading-6 text-[#111827]">
              {application.opening_title}
            </h2>
            {portfolio?.name && (
              <p className="mt-2 truncate text-sm font-semibold text-[#111827]">
                {portfolio.name}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {hasMultiplePortfolios
                ? `${portfolioIndex + 1} / ${portfolios.length} · ${appliedDate}`
                : appliedDate}
            </p>
          </div>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 transition-colors hover:bg-secondary"
            aria-label="미리보기 닫기"
          >
            <X className="h-5 w-5" />
          </AppButton>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-white">
          {isLoading && (
            <div className="flex h-full items-center justify-center px-5 text-center">
              <p className="text-muted-foreground">포트폴리오를 불러오는 중입니다.</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex h-full items-center justify-center px-5 text-center">
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && portfolio?.url && isImagePreview && (
            <div className="flex h-full w-full items-center justify-center bg-[#f8fafc]">
              <img
                src={portfolio.url}
                alt={`${portfolio.name || '첨부파일'} 미리보기`}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {!isLoading && !errorMessage && portfolio?.url && !isImagePreview && (
            <iframe
              title={`${portfolio.name || '첨부파일'} 미리보기`}
              src={portfolio.url}
              className="h-full w-full border-0"
            />
          )}

          {!isLoading && !errorMessage && !portfolio?.url && (
            <div className="flex h-full items-center justify-center px-5 text-center">
              <p className="text-muted-foreground">첨부된 포트폴리오가 없습니다.</p>
            </div>
          )}
        </div>

        {hasMultiplePortfolios && !isLoading && !errorMessage && (
          <div className="mt-3 flex shrink-0 items-center justify-between">
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => movePortfolio(-1)}
              className="rounded-lg p-2 transition-colors hover:bg-secondary"
              aria-label="이전 포트폴리오"
            >
              <ChevronLeft className="h-5 w-5" />
            </AppButton>
            <span className="rounded-lg bg-[#374151] px-3 py-1 text-sm font-semibold text-white">
              {portfolioIndex + 1} / {portfolios.length}
            </span>
            <AppButton
              type="button"
              variant="unstyled"
              onClick={() => movePortfolio(1)}
              className="rounded-lg p-2 transition-colors hover:bg-secondary"
              aria-label="다음 포트폴리오"
            >
              <ChevronRight className="h-5 w-5" />
            </AppButton>
          </div>
        )}
      </div>
    </div>
  )
}

export function JobApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<ApplicationItemResponse[]>([])
  const [selectedApplication, setSelectedApplication] = useState<ApplicationItemResponse | null>(
    null
  )
  const [selectedPortfolios, setSelectedPortfolios] = useState<ApplicationPortfolioResponse>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false)
  const [portfolioErrorMessage, setPortfolioErrorMessage] = useState('')
  const [requiresLogin, setRequiresLogin] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadApplications() {
      setIsLoading(true)
      setErrorMessage('')
      setRequiresLogin(false)

      try {
        const response = await jobApi.listApplications()
        if (isMounted) {
          setApplications(response.items)
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (isUnauthorizedError(error)) {
          setRequiresLogin(true)
          setErrorMessage('로그인이 필요한 서비스입니다.')
        } else {
          setErrorMessage('지원내역을 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSelectApplication = async (application: ApplicationItemResponse) => {
    setSelectedApplication(application)
    setSelectedPortfolios([])
    setIsPortfolioLoading(true)
    setPortfolioErrorMessage('')

    try {
      const portfolio = await jobApi.getApplicationPortfolio(application.application_id)
      setSelectedPortfolios(portfolio)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setPortfolioErrorMessage('로그인이 필요한 서비스입니다.')
      } else {
        setPortfolioErrorMessage('포트폴리오를 불러오지 못했습니다.')
      }
    } finally {
      setIsPortfolioLoading(false)
    }
  }

  const renderStatusContent = () => {
    if (isLoading) {
      return (
        <CenteredTaskContent
          task="지원내역을 불러오는 중입니다"
          description="잠시만 기다려주세요."
        />
      )
    }

    if (errorMessage) {
      return (
        <CenteredTaskContent
          task={requiresLogin ? '로그인이 필요합니다' : '지원내역을 불러오지 못했습니다'}
          description={requiresLogin ? '로그인 후 지원내역을 확인해주세요.' : errorMessage}
        />
      )
    }

    if (applications.length === 0) {
      return (
        <CenteredTaskContent
          task="지원내역이 없습니다"
          description="지원한 공고가 생기면 여기에서 확인할 수 있습니다."
        />
      )
    }

    return null
  }

  const statusContent = renderStatusContent()
  const shouldShowTotalCount = !isLoading && !errorMessage

  return (
    <div className="relative h-full w-full">
      <MobileLayout
        title="지원내역"
        backPath="/jobs"
        bottomContent={
          requiresLogin ? (
            <Btn_1Col onClick={() => navigate('/login/form')}>로그인하기</Btn_1Col>
          ) : undefined
        }
      >
        <div className="pt-6">
          {shouldShowTotalCount && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[17px] font-semibold text-muted-foreground">
                전체 {applications.length}건
              </p>
            </div>
          )}

          {statusContent && <div className="h-[520px]">{statusContent}</div>}

          {!isLoading && !errorMessage && applications.length > 0 && (
            <section className="space-y-3">
              {applications.map((application, index) => {
                const appliedDate = formatDate(application.applied_at)
                const previousAppliedDate =
                  index > 0 ? formatDate(applications[index - 1].applied_at) : ''
                const shouldShowDate = appliedDate !== previousAppliedDate

                return (
                  <div
                    key={application.application_id}
                    className={shouldShowDate ? 'pt-2 first:pt-0' : ''}
                  >
                    {shouldShowDate && (
                      <p className="mb-3 text-[15px] font-semibold text-muted-foreground">
                        {appliedDate}
                      </p>
                    )}
                    <AppButton
                      type="button"
                      variant="unstyled"
                      onClick={() => handleSelectApplication(application)}
                      className="flex w-full items-center gap-4 rounded-xl border border-border bg-background px-5 py-5 text-left shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-[18px] font-semibold leading-7 text-[#111827]">
                          {application.opening_title}
                        </span>
                        <span
                          className={`mt-3 inline-flex h-7 items-center rounded-full border px-2.5 text-[13px] font-semibold ${statusBadgeClasses[application.status]}`}
                        >
                          {statusDotClasses[application.status] && (
                            <span
                              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                statusDotClasses[application.status]
                              }`}
                            />
                          )}
                          {statusLabels[application.status]}
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </AppButton>
                  </div>
                )
              })}
            </section>
          )}
        </div>
      </MobileLayout>

      {selectedApplication && (
        <PortfolioPreviewModal
          application={selectedApplication}
          portfolios={selectedPortfolios}
          isLoading={isPortfolioLoading}
          errorMessage={portfolioErrorMessage}
          onClose={() => {
            setSelectedApplication(null)
            setSelectedPortfolios([])
            setPortfolioErrorMessage('')
          }}
        />
      )}
    </div>
  )
}
