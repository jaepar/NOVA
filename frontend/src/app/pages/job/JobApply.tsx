import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import axios from 'axios'
import { CheckCircle2, Eye, FileText, Plus, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  jobApi,
  type ApplicationFormPortfolioResponse,
  type ApplicationFormResponse,
  type JobOpeningResponse,
} from '../../../api'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import { CommonInputGroup } from '../../components/design-system/CommonInputGroup'
import { MobileLayout } from '../../components/layout/MobileLayout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

type LocalPortfolioFile = {
  id: number
  name: string
  createdAt: string
  file: File
}

function createNewPortfolioFile(file: File, index: number): LocalPortfolioFile {
  return {
    id: Date.now() + index,
    name: file.name,
    createdAt: new Date().toISOString().slice(0, 10).replaceAll('-', '.'),
    file,
  }
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError<{ message?: string }>(error)) {
    return fallbackMessage
  }

  const message = error.response?.data?.message
  return message && message.trim().length > 0 ? message : fallbackMessage
}

function ReadOnlyProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="block font-medium text-[#111827]">{label}</span>
      <div
        aria-label={`${label}: ${value}`}
        className="mt-[6px] flex min-h-[50px] w-full items-center rounded-lg border border-border bg-input-background px-4 text-[16px] text-[#111827]"
      >
        {value}
      </div>
    </div>
  )
}

function PortfolioPreviewModal({
  portfolio,
  onClose,
}: {
  portfolio: ApplicationFormPortfolioResponse
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/65 px-7 py-8">
      <div className="flex h-[78%] w-full flex-col rounded-xl bg-background p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-semibold text-[#111827]">
                {portfolio.name}
              </h2>
              <p className="text-sm text-muted-foreground">등록된 포트폴리오</p>
            </div>
          </div>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-secondary"
            aria-label="미리보기 닫기"
          >
            <X className="h-6 w-6" />
          </AppButton>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-white">
          <iframe
            title={`${portfolio.name} 미리보기`}
            src={portfolio.url}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  )
}

export function JobApply() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const numericJobId = Number(jobId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [job, setJob] = useState<JobOpeningResponse | null>(null)
  const [form, setForm] = useState<ApplicationFormResponse | null>(null)
  const [countryCode, setCountryCode] = useState('+82')
  const [phone, setPhone] = useState('')
  const [recommender, setRecommender] = useState('')
  const [localFiles, setLocalFiles] = useState<LocalPortfolioFile[]>([])
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<number[]>([])
  const [selectedLocalFileIds, setSelectedLocalFileIds] = useState<number[]>([])
  const [previewPortfolio, setPreviewPortfolio] =
    useState<ApplicationFormPortfolioResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitErrorMessage, setSubmitErrorMessage] = useState('')
  const [requiresLogin, setRequiresLogin] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadApplyData() {
      if (!Number.isFinite(numericJobId)) {
        setErrorMessage('공고 정보를 찾을 수 없습니다.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')
      setRequiresLogin(false)

      try {
        const jobResponse = await jobApi.getOpening(numericJobId)

        if (isMounted) {
          setJob(jobResponse)
        }

        const formResponse = await jobApi.getApplicationForm()

        if (isMounted) {
          setForm(formResponse)
        }
      } catch (error) {
        if (isMounted) {
          if (isUnauthorizedError(error)) {
            setRequiresLogin(true)
            setErrorMessage('로그인이 필요한 서비스입니다. 로그인 후 지원서를 작성해주세요.')
          } else {
            setErrorMessage('지원서 정보를 불러오지 못했습니다.')
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadApplyData()

    return () => {
      isMounted = false
    }
  }, [numericJobId])

  const selectedFiles = useMemo(
    () =>
      localFiles
        .filter((file) => selectedLocalFileIds.includes(file.id))
        .map((file) => file.file),
    [localFiles, selectedLocalFileIds]
  )

  const selectedPortfolioUrls = useMemo(() => {
    if (!form) {
      return []
    }

    return form.portfolios
      .filter((portfolio) => selectedPortfolioIds.includes(portfolio.portfolio_id))
      .map((portfolio) => portfolio.url)
  }, [form, selectedPortfolioIds])

  const canSubmit = Boolean(form?.name && form.email && job) && !isSubmitting

  const togglePortfolio = (portfolioId: number) => {
    setSelectedPortfolioIds((prev) =>
      prev.includes(portfolioId)
        ? prev.filter((id) => id !== portfolioId)
        : [...prev, portfolioId]
    )
  }

  const toggleLocalFile = (fileId: number) => {
    setSelectedLocalFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    )
  }

  const handleAddFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    const nextFiles = files.map(createNewPortfolioFile)
    setLocalFiles((prev) => [...prev, ...nextFiles])
    setSelectedLocalFileIds((prev) => [...prev, ...nextFiles.map((file) => file.id)])
    event.target.value = ''
  }

  const handleSubmit = async () => {
    if (!canSubmit || !job) {
      return
    }

    setIsSubmitting(true)
    setSubmitErrorMessage('')

    try {
      await jobApi.submitApplication(job.job_id, {
        portfolioUrls: selectedPortfolioUrls,
        files: selectedFiles,
      })
      navigate('/jobs')
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setRequiresLogin(true)
        setErrorMessage('로그인이 필요한 서비스입니다. 로그인 후 지원서를 작성해주세요.')
      } else {
        setSubmitErrorMessage(getApiErrorMessage(error, '지원서를 제출하지 못했습니다.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative h-full w-full">
      <MobileLayout
        title="지원하기"
        backPath={job ? `/jobs/${job.job_id}` : '/jobs'}
        bottomContent={
          !isLoading && requiresLogin ? (
            <Btn_1Col onClick={() => navigate('/login/form')}>로그인하기</Btn_1Col>
          ) : !isLoading && !errorMessage ? (
            <Btn_1Col disabled={!canSubmit} onClick={handleSubmit}>
              {isSubmitting ? '제출 중' : '제출하기'}
            </Btn_1Col>
          ) : undefined
        }
      >
        {isLoading && (
          <CenteredTaskContent
            task="지원서 정보를 불러오는 중입니다."
            description="잠시만 기다려주세요."
          />
        )}

        {!isLoading && errorMessage && (
          <CenteredTaskContent
            task={requiresLogin ? '로그인이 필요합니다.' : errorMessage}
            description={
              requiresLogin
                ? '지원서를 작성하려면 먼저 로그인해주세요.'
                : '잠시 후 다시 시도해주세요.'
            }
          />
        )}

        {!isLoading && !errorMessage && job && form && (
          <div className="space-y-8 pt-6">
            <section className="space-y-5">
              <div>
                <h2 className="mb-1 text-[22px] font-semibold text-[#111827]">지원 정보</h2>
                <p className="text-sm text-muted-foreground">{job.opening_title}</p>
              </div>

              <ReadOnlyProfileField label="이름" value={form.name} />
              <ReadOnlyProfileField label="이메일" value={form.email} />

              <div className="flex flex-col gap-2">
                <label>연락처 (선택 사항)</label>
                <div className="grid grid-cols-[94px_1fr] gap-3">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger
                      aria-label="국가번호 선택"
                      className="mt-[6px] !h-[50px] w-full rounded-lg border-border bg-input-background px-3 text-[16px] shadow-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start" className="rounded-xl">
                      <SelectItem value="+82">+82</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+81">+81</SelectItem>
                      <SelectItem value="+86">+86</SelectItem>
                      <SelectItem value="+84">+84</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    value={phone}
                    placeholder="010-1234-5678"
                    inputMode="tel"
                    onChange={(event) => setPhone(formatPhoneNumber(event.target.value))}
                    className="mt-[6px] h-[50px] w-full rounded-lg border border-border bg-input-background px-4 text-[16px] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <CommonInputGroup
                label="추천인 (선택 사항)"
                placeholder="선택 사항"
                value={recommender}
                onChange={setRecommender}
              />
            </section>

            {submitErrorMessage && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-[15px] font-medium text-red-600">
                {submitErrorMessage}
              </p>
            )}

            <section className="-mx-5 border-t border-border px-5 pt-6">
              <h2 className="mb-2 text-[22px] font-semibold text-[#111827]">첨부파일 선택</h2>
              <p className="mb-5 text-[16px] text-muted-foreground">
                이번 지원서에 반영할 포트폴리오와 새 파일을 선택해주세요.
              </p>

              <div className="space-y-3">
                {form.portfolios.length === 0 && localFiles.length === 0 && (
                  <p className="rounded-xl bg-secondary px-4 py-5 text-[15px] text-muted-foreground">
                    등록된 포트폴리오가 없습니다. 필요한 파일을 새로 추가해주세요.
                  </p>
                )}

                {form.portfolios.map((portfolio) => {
                  const isSelected = selectedPortfolioIds.includes(portfolio.portfolio_id)

                  return (
                    <AppButton
                      key={portfolio.portfolio_id}
                      type="button"
                      variant="unstyled"
                      onClick={() => togglePortfolio(portfolio.portfolio_id)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[#0057ff] bg-blue-50'
                          : 'border-border bg-background hover:bg-secondary'
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          isSelected
                            ? 'bg-blue-100 text-[#0057ff]'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <FileText className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[17px] font-semibold text-[#111827]">
                          {portfolio.name}
                        </span>
                        <span className="mt-2 flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">등록된 포트폴리오</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation()
                              setPreviewPortfolio(portfolio)
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') {
                                return
                              }

                              event.preventDefault()
                              event.stopPropagation()
                              setPreviewPortfolio(portfolio)
                            }}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                          >
                            <Eye className="h-4 w-4" />
                            보기
                          </span>
                        </span>
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="h-7 w-7 shrink-0 text-[#0057ff]" />
                      ) : (
                        <span className="h-7 w-7 shrink-0 rounded-full border-2 border-[#9ca3af]" />
                      )}
                    </AppButton>
                  )
                })}

                {localFiles.map((file) => {
                  const isSelected = selectedLocalFileIds.includes(file.id)

                  return (
                    <AppButton
                      key={file.id}
                      type="button"
                      variant="unstyled"
                      onClick={() => toggleLocalFile(file.id)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[#0057ff] bg-blue-50'
                          : 'border-border bg-background hover:bg-secondary'
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          isSelected
                            ? 'bg-blue-100 text-[#0057ff]'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <FileText className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[17px] font-semibold text-[#111827]">
                          {file.name}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          새 파일 · {file.createdAt}
                        </span>
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="h-7 w-7 shrink-0 text-[#0057ff]" />
                      ) : (
                        <span className="h-7 w-7 shrink-0 rounded-full border-2 border-[#9ca3af]" />
                      )}
                    </AppButton>
                  )
                })}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAddFiles}
                />

                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-dashed border-border text-[#0057ff] transition-colors hover:bg-blue-50"
                >
                  <Plus className="h-5 w-5" />새 파일 추가
                </AppButton>
              </div>
            </section>
          </div>
        )}
      </MobileLayout>

      {previewPortfolio && (
        <PortfolioPreviewModal
          portfolio={previewPortfolio}
          onClose={() => setPreviewPortfolio(null)}
        />
      )}
    </div>
  )
}
