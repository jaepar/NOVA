import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  X,
} from 'lucide-react'
import {
  certificateApi,
  getCertificateApiError,
  type CorrectionDocumentResponse,
  type CorrectionDocumentType,
} from '../../../api'
import { AppButton, Btn_1Col, InlineBanner } from '../../components/design-system'
import { MobileLayout } from '../../components/layout/MobileLayout'

const documentLabelMap: Record<CorrectionDocumentType, string> = {
  RESIDENCE_VERIFICATION_DOCUMENT: '거소확인서',
  ALIEN_REGISTRATION_SUPPORTING_DOCUMENT: '외국인등록증 신청서',
}

const uploadFieldMap: Record<
  CorrectionDocumentType,
  'residenceVerificationPdf' | 'alienRegistrationApplicationPdf'
> = {
  RESIDENCE_VERIFICATION_DOCUMENT: 'residenceVerificationPdf',
  ALIEN_REGISTRATION_SUPPORTING_DOCUMENT: 'alienRegistrationApplicationPdf',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ENABLE_CORRECTION_SUBMIT_MOCK = true

function getDocumentLabel(documentType: CorrectionDocumentType) {
  return documentLabelMap[documentType]
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}MB`
  if (size >= 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${size}B`
}

function formatUploadedDate() {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .replace(/\. /g, '.')
    .replace(/\.$/, '')
}

function isPdfFile(file: File) {
  const lowerName = file.name.toLowerCase()
  return file.type === 'application/pdf' || lowerName.endsWith('.pdf')
}

function CorrectionSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((item) => (
        <div key={item} className="rounded-2xl border border-border bg-background p-4">
          <div className="flex gap-3">
            <div className="h-[54px] w-[54px] rounded-xl bg-secondary animate-pulse" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-40 rounded bg-secondary animate-pulse" />
              <div className="mt-3 h-4 w-28 rounded bg-secondary animate-pulse" />
            </div>
          </div>
          <div className="mt-4 h-24 rounded-xl bg-secondary animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function ReviewProgress() {
  const steps = [
    { label: '접수완료', state: 'done' },
    { label: '보완요청', state: 'active' },
    { label: '심사중', state: 'pending' },
    { label: '완료', state: 'pending' },
  ] as const

  return (
    <section className="space-y-4">
      <h3 className="text-[17px] font-semibold text-foreground">서류 심사 진행 상태</h3>
      <div className="grid grid-cols-4 items-start">
        {steps.map((step, index) => (
          <div key={step.label} className="relative flex flex-col items-center gap-2">
            {index < steps.length - 1 ? (
              <span
                className={`absolute left-1/2 top-[15px] h-0.5 w-full ${
                  step.state === 'pending' ? 'bg-border' : 'bg-primary'
                }`}
              />
            ) : null}
            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                step.state === 'done'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : step.state === 'active'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-transparent'
              }`}
            >
              {step.state === 'done' ? (
                <Check className="h-5 w-5" strokeWidth={3} />
              ) : step.state === 'active' ? (
                <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
              ) : null}
            </div>
            <p
              className={`text-center text-[13px] font-medium ${
                step.state === 'active' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CertificateCorrectionDetail() {
  const navigate = useNavigate()
  const fileInputRefs = useRef<Record<CorrectionDocumentType, HTMLInputElement | null>>({
    RESIDENCE_VERIFICATION_DOCUMENT: null,
    ALIEN_REGISTRATION_SUPPORTING_DOCUMENT: null,
  })
  const [documents, setDocuments] = useState<CorrectionDocumentResponse[]>([])
  const [files, setFiles] = useState<Partial<Record<CorrectionDocumentType, File>>>({})
  const [fileErrors, setFileErrors] = useState<Partial<Record<CorrectionDocumentType, string>>>({})
  const [openDocumentType, setOpenDocumentType] = useState<CorrectionDocumentType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const rejectedDocuments = useMemo(
    () =>
      documents.filter(
        (document): document is CorrectionDocumentResponse & { documentType: CorrectionDocumentType } =>
          document.status === 'REJECTED'
      ),
    [documents]
  )

  const isAllAttached =
    rejectedDocuments.length > 0 &&
    rejectedDocuments.every((document) => Boolean(files[document.documentType]))

  const loadCorrectionDocuments = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const nextDocuments = await certificateApi.getCorrectionDocuments()
      const nextRejectedDocuments = nextDocuments.filter(
        (document): document is CorrectionDocumentResponse & { documentType: CorrectionDocumentType } =>
          document.status === 'REJECTED'
      )

      setDocuments(nextDocuments)
      setFiles({})
      setFileErrors({})
      setOpenDocumentType(nextRejectedDocuments[0]?.documentType ?? null)
    } catch {
      setDocuments([])
      setOpenDocumentType(null)
      setErrorMessage('서류 정보를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCorrectionDocuments()
  }, [])

  const openPicker = (documentType: CorrectionDocumentType) => {
    fileInputRefs.current[documentType]?.click()
  }

  const handleFileChange = (documentType: CorrectionDocumentType, file: File | null) => {
    if (!file) return

    if (!isPdfFile(file)) {
      setFiles((prevFiles) => {
        const nextFiles = { ...prevFiles }
        delete nextFiles[documentType]
        return nextFiles
      })
      setFileErrors((prevErrors) => ({
        ...prevErrors,
        [documentType]: 'PDF 파일만 첨부할 수 있어요.',
      }))
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFiles((prevFiles) => {
        const nextFiles = { ...prevFiles }
        delete nextFiles[documentType]
        return nextFiles
      })
      setFileErrors((prevErrors) => ({
        ...prevErrors,
        [documentType]: '10MB 이하 파일만 첨부할 수 있어요.',
      }))
      return
    }

    setFiles((prevFiles) => ({
      ...prevFiles,
      [documentType]: file,
    }))
    setFileErrors((prevErrors) => {
      const nextErrors = { ...prevErrors }
      delete nextErrors[documentType]
      return nextErrors
    })
  }

  const removeFile = (documentType: CorrectionDocumentType) => {
    setFiles((prevFiles) => {
      const nextFiles = { ...prevFiles }
      delete nextFiles[documentType]
      return nextFiles
    })
  }

  const handleSubmit = async () => {
    if (!isAllAttached || isSubmitting) {
      return
    }

    if (ENABLE_CORRECTION_SUBMIT_MOCK) {
      setIsSubmitting(true)
      navigate('/certificate/corrections/complete')
      return
    }

    const payload: Parameters<typeof certificateApi.uploadCorrectionDocuments>[0] = {}

    rejectedDocuments.forEach((document) => {
      const file = files[document.documentType]

      if (file) {
        payload[uploadFieldMap[document.documentType]] = file
      }
    })

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      await certificateApi.uploadCorrectionDocuments(payload)
      navigate('/certificate/corrections/complete')
    } catch (error) {
      const apiError = getCertificateApiError(error)
      setErrorMessage(apiError?.message || '서류 제출에 실패했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MobileLayout
      title="보완 서류 제출"
      backPath="/main"
      bottomContent={
        errorMessage && rejectedDocuments.length === 0 ? (
          <Btn_1Col variant="outline" onClick={loadCorrectionDocuments}>
            다시 불러오기
          </Btn_1Col>
        ) : rejectedDocuments.length > 0 ? (
          <Btn_1Col disabled={!isAllAttached || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? '제출 중...' : '제출하기'}
          </Btn_1Col>
        ) : undefined
      }
    >
      <div className="space-y-6 pb-2">
        <section>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            아래 서류를 확인하고 누락된 항목을 보완해 주세요.
          </p>
        </section>

        <ReviewProgress />

        <section className="rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-semibold text-foreground">
              보완 필요 서류 ({rejectedDocuments.length})
            </h3>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <CorrectionSkeleton />
            ) : errorMessage && rejectedDocuments.length === 0 ? (
              <InlineBanner message={errorMessage} variant="error" />
            ) : rejectedDocuments.length === 0 ? (
              <div className="rounded-xl bg-secondary p-5 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" strokeWidth={2.4} />
                <h4 className="mt-3 text-[16px] font-semibold text-foreground">
                  다시 제출할 서류가 없습니다
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  현재 보완이 필요한 서류가 없어요.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {errorMessage ? <InlineBanner message={errorMessage} variant="error" /> : null}

                {rejectedDocuments.map((document) => {
                  const documentType = document.documentType
                  const selectedFile = files[documentType]
                  const fileError = fileErrors[documentType]
                  const reasons = document.missingItems.filter(Boolean)
                  const isOpen = openDocumentType === documentType

                  return (
                    <section
                      key={documentType}
                      className="overflow-hidden rounded-2xl border border-border bg-background"
                    >
                      <AppButton
                        variant="unstyled"
                        onClick={() => setOpenDocumentType(isOpen ? null : documentType)}
                        className="flex w-full items-center gap-3 px-4 py-4 text-left"
                        aria-expanded={isOpen}
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="break-words text-[16px] font-semibold leading-snug text-foreground">
                            {getDocumentLabel(documentType)}
                          </h4>
                          <span className="mt-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-medium leading-none text-red-600">
                            보완 필요
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                        )}
                      </AppButton>

                      {isOpen ? (
                        <div className="border-t border-border bg-secondary/20 px-4 py-4">
                          {reasons.length > 0 ? (
                            <div>
                              <p className="text-[14px] font-semibold text-foreground">누락 항목</p>
                              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-foreground/90">
                                {reasons.map((reason) => (
                                  <li key={reason}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          <input
                            ref={(el) => {
                              fileInputRefs.current[documentType] = el
                            }}
                            type="file"
                            accept="application/pdf,.pdf"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null
                              handleFileChange(documentType, file)
                              event.target.value = ''
                            }}
                          />

                          <AppButton
                            variant="unstyled"
                            onClick={() => openPicker(documentType)}
                            className="mt-5 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center transition-colors hover:bg-blue-50"
                          >
                            <Upload className="h-7 w-7 text-primary" strokeWidth={2.2} />
                            <span className="mt-2 text-[15px] font-semibold text-primary">
                              파일을 업로드해 주세요
                            </span>
                            <span className="mt-1 text-[13px] text-muted-foreground">
                              PDF 최대 10MB
                            </span>
                          </AppButton>

                          {selectedFile ? (
                            <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {selectedFile.name}
                                </p>
                                <p className="mt-0.5 text-[13px] text-muted-foreground">
                                  {formatUploadedDate()} 업로드 완료 · {formatFileSize(selectedFile.size)}
                                </p>
                              </div>
                              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" strokeWidth={2.3} />
                              <AppButton
                                variant="unstyled"
                                onClick={() => removeFile(documentType)}
                                aria-label={`${getDocumentLabel(documentType)} 파일 삭제`}
                                className="rounded-md p-1 transition-colors hover:bg-secondary"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </AppButton>
                            </div>
                          ) : null}

                          {fileError ? <p className="mt-2 text-xs text-red-600">{fileError}</p> : null}
                        </div>
                      ) : null}
                    </section>
                  )
                })}

                <section className="rounded-2xl border border-border bg-background p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-medium text-foreground">
                        제출 후 예상 소요시간
                      </p>
                      <p className="shrink-0 text-[17px] font-semibold text-primary">
                        약 1영업일
                      </p>
                    </div>
                    <div className="my-3 h-px bg-border" />
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      담당자가 확인 후 알림으로 결과를 안내해드립니다.
                    </p>
                  </div>
                </section>
              </div>
            )}
          </div>
        </section>
      </div>
    </MobileLayout>
  )
}
