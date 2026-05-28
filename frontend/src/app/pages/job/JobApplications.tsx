import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileText, X } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { jobApplications } from '../../domains/job/mock'
import type { ApplicationStatus, JobApplication } from '../../domains/job/types'

const statusLabels: Record<ApplicationStatus, string> = {
  PASSED: '합격',
  FAILED: '불합격',
  UNREAD: '읽지 않음',
  READ: '읽음',
}

const statusClasses: Record<ApplicationStatus, string> = {
  PASSED: 'text-green-600',
  FAILED: 'text-red-600',
  UNREAD: 'text-[#374151]',
  READ: 'text-[#374151]',
}

function PortfolioPreviewModal({
  application,
  onClose,
}: {
  application: JobApplication
  onClose: () => void
}) {
  const [fileIndex, setFileIndex] = useState(0)
  const file = application.files[fileIndex]

  const move = (direction: -1 | 1) => {
    setFileIndex((current) => {
      const next = current + direction

      if (next < 0) {
        return application.files.length - 1
      }

      if (next >= application.files.length) {
        return 0
      }

      return next
    })
  }

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/65 px-7">
      <div className="w-full rounded-xl bg-background p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-semibold text-[#111827]">{application.openingTitle}</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{file.fileName}</p>
                <p className="text-sm text-[#374151]">
                  {fileIndex + 1} / {application.files.length}
                </p>
              </div>
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

        <div className="rounded-lg border border-border bg-white px-7 py-6">
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

        <div className="mt-3 flex items-center justify-between">
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => move(-1)}
            className="rounded-lg p-2 hover:bg-secondary"
          >
            <ChevronLeft className="h-6 w-6" />
          </AppButton>
          <span className="rounded-lg bg-[#374151] px-3 py-1 text-sm font-semibold text-white">
            {fileIndex + 1} / {application.files.length}
          </span>
          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => move(1)}
            className="rounded-lg p-2 hover:bg-secondary"
          >
            <ChevronRight className="h-6 w-6" />
          </AppButton>
        </div>
      </div>
    </div>
  )
}

export function JobApplications() {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)

  return (
    <div className="relative h-full w-full">
      <MobileLayout title="지원내역" backPath="/jobs">
        <div className="space-y-6 pt-6">
          <p className="text-[18px] font-semibold text-muted-foreground">
            전체 {jobApplications.length}건
          </p>

          <section className="space-y-6">
            {jobApplications.map((application) => (
              <div key={application.applicationId}>
                <p className="mb-3 text-[17px] font-semibold text-muted-foreground">
                  {application.createdAt}
                </p>
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setSelectedApplication(application)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-5 py-6 text-left shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-colors hover:bg-blue-50"
                >
                  <span>
                    <span className="mb-4 block text-[20px] font-semibold text-[#111827]">
                      {application.openingTitle}
                    </span>
                    <span className={`text-[16px] font-semibold ${statusClasses[application.status]}`}>
                      {statusLabels[application.status]}
                    </span>
                  </span>
                  <ChevronRight className="h-6 w-6 text-muted-foreground" />
                </AppButton>
              </div>
            ))}
          </section>
        </div>
      </MobileLayout>

      {selectedApplication && (
        <PortfolioPreviewModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  )
}
