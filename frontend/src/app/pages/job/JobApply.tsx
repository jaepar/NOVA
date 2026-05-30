import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { CheckCircle2, Eye, FileText, Plus, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../../components/design-system/CommonInputGroup'
import { MobileLayout } from '../../components/layout/MobileLayout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { jobPostings, portfolioFiles } from '../../domains/job/mock'
import type { PortfolioFile } from '../../domains/job/types'

function createNewPortfolioFile(file: File, index: number): PortfolioFile {
  return {
    fileId: Date.now() + index,
    fileName: file.name,
    fileType: 'PORTFOLIO',
    createdAt: new Date().toISOString().slice(0, 10).replaceAll('-', '.'),
    version: 'v1.0',
    pageCount: 1,
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

function PortfolioFilePreviewModal({
  file,
  onClose,
}: {
  file: PortfolioFile
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/65 px-7 py-8">
      <div className="flex max-h-[calc(100%-64px)] w-full flex-col rounded-xl bg-background p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-semibold text-[#111827]">{file.fileName}</h2>
              <p className="text-sm text-muted-foreground">{file.createdAt}</p>
            </div>
          </div>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-secondary"
          >
            <X className="h-6 w-6" />
          </AppButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-white px-7 py-6">
          <div className="mb-5 text-center text-[20px] font-semibold text-[#111827]">이력서</div>
          <div className="mb-5 flex items-start justify-between gap-5">
            <div>
              <h3 className="mb-3 text-[14px] font-semibold">기본 정보</h3>
              <ul className="space-y-2 text-[12px] leading-5 text-[#111827]">
                <li>이름 : 홍길동</li>
                <li>생년월일 : 1995.05.20</li>
                <li>연락처 : 010-1234-5678</li>
                <li>이메일 : honggildong@email.com</li>
              </ul>
            </div>
            <div className="h-20 w-20 rounded-full bg-gradient-to-b from-[#e5e7eb] to-[#c7ccd5]" />
          </div>

          {[
            ['학력', '2014.03 ~ 2018.02        OO대학교 간호학과 (학사)'],
            ['경력', '2018.03 ~ 2020.02        OO병원 내과병동 간호사'],
            ['자격증', '간호사 면허증 · BLS Provider'],
            ['자기소개', '환자 중심의 간호를 실천하고 책임감 있는 자세로 업무에 임해왔습니다.'],
            ['포트폴리오', '수술실 신규 간호사 교육 프로그램 개선 참여'],
          ].map(([title, content]) => (
            <section key={title} className="border-t border-border py-4">
              <h3 className="mb-2 text-[13px] font-semibold text-[#111827]">{title}</h3>
              <p className="text-[12px] leading-5 text-[#111827]">{content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export function JobApply() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const job = jobPostings.find((item) => item.jobId === Number(jobId)) ?? jobPostings[0]
  const [name, setName] = useState('조우재')
  const [email, setEmail] = useState('woo jae.cho@example.com'.replace(' ', ''))
  const [countryCode, setCountryCode] = useState('+82')
  const [phone, setPhone] = useState('')
  const [recommender, setRecommender] = useState('')
  const [files, setFiles] = useState<PortfolioFile[]>(portfolioFiles)
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([portfolioFiles[0].fileId])
  const [previewFile, setPreviewFile] = useState<PortfolioFile | null>(null)

  const canSubmit = useMemo(() => name.trim().length > 0 && email.trim().length > 0, [email, name])

  const toggleFile = (fileId: number) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    )
  }

  const handleAddFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    if (selectedFiles.length === 0) {
      return
    }

    const nextFiles = selectedFiles.map(createNewPortfolioFile)
    setFiles((prev) => [...prev, ...nextFiles])
    setSelectedFileIds((prev) => [...prev, ...nextFiles.map((file) => file.fileId)])
    event.target.value = ''
  }

  return (
    <div className="relative h-full w-full">
      <MobileLayout
      title="지원하기"
      backPath={`/jobs/${job.jobId}`}
      bottomContent={
        <Btn_1Col disabled={!canSubmit} onClick={() => navigate('/jobs/applications')}>
          제출하기
        </Btn_1Col>
      }
    >
      <div className="space-y-8 pt-6">
        <section className="space-y-5">
          <div>
            <h2 className="mb-1 text-[22px] font-semibold text-[#111827]">지원 정보</h2>
            <p className="text-sm text-muted-foreground">{job.openingTitle}</p>
          </div>

          <CommonInputGroup label="이름" value={name} onChange={setName} />
          <CommonInputGroup label="이메일" type="email" value={email} onChange={setEmail} />

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

        <section className="-mx-5 border-t border-border px-5 pt-6">
          <h2 className="mb-2 text-[22px] font-semibold text-[#111827]">첨부파일 선택</h2>
          <p className="mb-5 text-[16px] text-muted-foreground">지원 시 제출할 파일을 선택해주세요.</p>

          <div className="space-y-3">
            {files.map((file) => {
              const isSelected = selectedFileIds.includes(file.fileId)

              return (
                <AppButton
                  key={file.fileId}
                  type="button"
                  variant="unstyled"
                  onClick={() => toggleFile(file.fileId)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-[#0057ff] bg-blue-50'
                      : 'border-border bg-background hover:bg-secondary'
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      isSelected ? 'bg-blue-100 text-[#0057ff]' : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <FileText className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[17px] font-semibold text-[#111827]">
                      {file.fileName}
                    </span>
                    <span className="block text-sm text-muted-foreground">{file.createdAt}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation()
                        setPreviewFile(file)
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') {
                          return
                        }

                        event.preventDefault()
                        event.stopPropagation()
                        setPreviewFile(file)
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                    >
                      <Eye className="h-4 w-4" />
                      보기
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
              <Plus className="h-5 w-5" />
              새 파일 추가
            </AppButton>
          </div>
        </section>
      </div>
      </MobileLayout>

      {previewFile && (
        <PortfolioFilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  )
}
