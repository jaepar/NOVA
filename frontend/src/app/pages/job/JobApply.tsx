import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { CheckCircle2, ChevronDown, FileText, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CommonInputGroup } from '../../components/design-system/CommonInputGroup'
import { MobileLayout } from '../../components/layout/MobileLayout'
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

export function JobApply() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const job = jobPostings.find((item) => item.jobId === Number(jobId)) ?? jobPostings[0]
  const [name, setName] = useState('조우재')
  const [email, setEmail] = useState('woo jae.cho@example.com'.replace(' ', ''))
  const [phone, setPhone] = useState('010-1234-5678')
  const [recommender, setRecommender] = useState('')
  const [files, setFiles] = useState<PortfolioFile[]>(portfolioFiles)
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([portfolioFiles[0].fileId])

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
            <label>연락처</label>
            <div className="grid grid-cols-[86px_1fr] gap-3">
              <AppButton
                type="button"
                variant="unstyled"
                className="mt-[6px] flex h-[50px] items-center justify-center gap-2 rounded-lg border border-border bg-input-background text-[16px]"
              >
                +82
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </AppButton>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
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
                    <span className="block text-sm text-muted-foreground">
                      {file.createdAt}  ·  {file.version}
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
  )
}
