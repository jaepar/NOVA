import { Check, CheckCircle2, ChevronDown, ChevronUp, FileText, Upload, X } from 'lucide-react'
import type { CorrectionDocumentResponse, CorrectionDocumentType } from '../../../api'
import { AppButton } from '../../components/design-system'

export const correctionDocumentLabelMap: Record<CorrectionDocumentType, string> = {
  RESIDENCE_VERIFICATION_DOCUMENT: '거소확인서',
  ALIEN_REGISTRATION_SUPPORTING_DOCUMENT: '외국인등록증 신청서',
}

export const correctionUploadFieldMap: Record<
  CorrectionDocumentType,
  'residenceVerificationPdf' | 'alienRegistrationApplicationPdf'
> = {
  RESIDENCE_VERIFICATION_DOCUMENT: 'residenceVerificationPdf',
  ALIEN_REGISTRATION_SUPPORTING_DOCUMENT: 'alienRegistrationApplicationPdf',
}

export type RejectedCorrectionDocument = CorrectionDocumentResponse & {
  status: 'REJECTED'
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)}MB`
  if (size >= 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${size}B`
}

const uploadedDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function formatUploadedDate() {
  return uploadedDateFormatter.format(new Date()).replace(/\. /g, '.').replace(/\.$/, '')
}

export function getCorrectionDocumentLabel(documentType: CorrectionDocumentType) {
  return correctionDocumentLabelMap[documentType]
}

export function CorrectionSkeleton() {
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

const reviewSteps = [
  { label: '접수완료', state: 'done' },
  { label: '보완요청', state: 'active' },
  { label: '심사중', state: 'pending' },
  { label: '완료', state: 'pending' },
] as const

export function CorrectionReviewProgress() {
  return (
    <section className="space-y-4">
      <h3 className="text-[17px] font-semibold text-foreground">서류 심사 진행 상태</h3>
      <div className="grid grid-cols-4 items-start">
        {reviewSteps.map((step, index) => (
          <div key={step.label} className="relative flex flex-col items-center gap-2">
            {index < reviewSteps.length - 1 ? (
              <span
                className={`absolute left-1/2 top-[15px] h-0.5 w-full ${
                  step.state === 'pending' ? 'bg-border' : 'bg-primary'
                }`}
              />
            ) : null}
            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                step.state !== 'pending'
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

export function CorrectionEmptyState() {
  return (
    <div className="rounded-xl bg-secondary p-5 text-center">
      <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" strokeWidth={2.4} />
      <h4 className="mt-3 text-[16px] font-semibold text-foreground">
        다시 제출할 서류가 없습니다
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        현재 보완이 필요한 서류가 없어요.
      </p>
    </div>
  )
}

interface CorrectionDocumentCardProps {
  document: RejectedCorrectionDocument
  selectedFile?: File
  fileError?: string
  isOpen: boolean
  inputRef: (element: HTMLInputElement | null) => void
  onToggle: () => void
  onPick: () => void
  onFileChange: (file: File | null) => void
  onRemove: () => void
}

export function CorrectionDocumentCard({
  document,
  selectedFile,
  fileError,
  isOpen,
  inputRef,
  onToggle,
  onPick,
  onFileChange,
  onRemove,
}: CorrectionDocumentCardProps) {
  const reasons = document.missingItems.filter(Boolean)
  const label = getCorrectionDocumentLabel(document.documentType)

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <AppButton
        variant="unstyled"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-[16px] font-semibold leading-snug text-foreground">
            {label}
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
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              onFileChange(file)
              event.target.value = ''
            }}
          />

          <AppButton
            variant="unstyled"
            onClick={onPick}
            className="mt-5 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center transition-colors hover:bg-blue-50"
          >
            <Upload className="h-7 w-7 text-primary" strokeWidth={2.2} />
            <span className="mt-2 text-[15px] font-semibold text-primary">
              파일을 업로드해 주세요
            </span>
            <span className="mt-1 text-[13px] text-muted-foreground">PDF 최대 10MB</span>
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
                onClick={onRemove}
                aria-label={`${label} 파일 삭제`}
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
}

export function CorrectionExpectedTimeCard() {
  return (
    <section className="rounded-2xl border border-border bg-background p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14px] font-medium text-foreground">제출 후 예상 소요시간</p>
          <p className="shrink-0 text-[17px] font-semibold text-primary">약 1영업일</p>
        </div>
        <div className="my-3 h-px bg-border" />
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          담당자가 확인 후 알림으로 결과를 안내해드립니다.
        </p>
      </div>
    </section>
  )
}
