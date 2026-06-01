import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { AppButton } from '../../components/design-system/AppButton'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { jobPostings, jobRegionLabels } from '../../domains/job/mock'

interface DetailSectionProps {
  title: string
  children: ReactNode
}

function DetailSection({ title, children }: DetailSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <section className="border-t border-border py-5">
      <AppButton
        type="button"
        variant="unstyled"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-[20px] font-semibold text-[#111827]">{title}</h3>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </AppButton>

      {isOpen && <div className="mt-3 text-[16px] leading-7 text-[#374151]">{children}</div>}
    </section>
  )
}

export function JobDetail() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const job = jobPostings.find((item) => item.jobId === Number(jobId)) ?? jobPostings[0]

  const workConditions = [
    ['근무형태', job.employmentType],
    ['경력', job.experience],
    ['직종', job.jobCategory],
    ['급여', job.salary],
    ['근무요일', job.workDays],
    ['근무시간', '09:00 ~ 18:00 (휴게시간 12:00 ~ 13:00)'],
    ['근무지', job.address],
    ['복리후생', job.benefits],
  ]

  return (
    <MobileLayout
      title="구인구직"
      backPath="/jobs"
      bottomContent={<Btn_1Col onClick={() => navigate(`/jobs/${job.jobId}/apply`)}>지원하기</Btn_1Col>}
    >
      <article className="pt-6">
        <div className="pb-6">
          <span className="mb-4 inline-flex rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-[#0057ff]">
            {jobRegionLabels[job.region]}
          </span>
          <h2 className="mb-3 text-[24px] font-semibold leading-9 text-[#111827]">
            {job.openingTitle}
          </h2>
          <p className="mb-3 text-[17px] text-[#374151]">{job.company}</p>
          <p className="text-[16px] text-muted-foreground">{job.createdAt} 등록</p>
        </div>

        <section className="border-t border-border py-6">
          <h3 className="mb-4 text-[20px] font-semibold text-[#111827]">근무 조건</h3>
          <dl className="space-y-3">
            {workConditions.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[92px_1fr] gap-4 text-[16px] leading-7">
                <dt className="text-[#4b5563]">{label}</dt>
                <dd className="text-[#111827]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <DetailSection title="회사 소개">
          <p>{job.introduce}</p>
        </DetailSection>

        <DetailSection title="담당 업무">
          <ul className="list-disc space-y-1 pl-5">
            {job.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title="지원 자격">
          <ul className="list-disc space-y-1 pl-5">
            {job.qualifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title="우대 사항">
          <ul className="list-disc space-y-1 pl-5">
            {job.advantages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title="기타 사항">
          <ul className="list-disc space-y-1 pl-5">
            {job.notices.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailSection>
      </article>
    </MobileLayout>
  )
}
