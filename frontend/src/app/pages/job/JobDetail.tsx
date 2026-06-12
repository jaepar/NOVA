import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { jobApi, type JobOpeningResponse } from '../../../api'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'

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
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </AppButton>

      {isOpen && <div className="mt-3 text-[16px] leading-7 text-[#374151]">{children}</div>}
    </section>
  )
}

function formatRecruitCount(value: string) {
  if (!value) {
    return '-'
  }

  const trimmedValue = value.trim()
  if (trimmedValue.includes('인원미정')) {
    return '인원미정'
  }

  return trimmedValue.endsWith('명') ? trimmedValue : `${trimmedValue}명`
}

export function JobDetail() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const numericJobId = Number(jobId)
  const [job, setJob] = useState<JobOpeningResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadJob() {
      if (!Number.isFinite(numericJobId)) {
        setErrorMessage('공고 정보를 찾을 수 없습니다.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await jobApi.getOpening(numericJobId)
        if (isMounted) {
          setJob(response)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('공고 상세 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadJob()

    return () => {
      isMounted = false
    }
  }, [numericJobId])

  const workConditions = job
    ? [
        ['근무형태', job.employment_type],
        ['경력', job.experience],
        ['직종', job.job_category],
        ['급여', job.salary],
        ['근무기간', job.work_period],
        ['마감', job.deadline_type],
        ['모집인원', formatRecruitCount(job.recruit_count)],
        ['근무지', job.address],
        ['복리후생', job.benefits],
      ]
    : []

  return (
    <MobileLayout
      title="구인구직"
      backPath="/jobs"
      bottomContent={
        job ? (
          <Btn_1Col onClick={() => navigate(`/jobs/${job.job_id}/apply`)}>지원하기</Btn_1Col>
        ) : undefined
      }
    >
      {isLoading && (
        <div className="px-5 py-20 text-center">
          <p className="text-muted-foreground">공고를 불러오는 중입니다.</p>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="px-5 py-20 text-center">
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && job && (
        <article className="pt-6">
          <div className="pb-6">
            <span className="mb-4 inline-flex rounded-lg bg-primary-soft px-3 py-1 text-sm font-semibold text-[#2563EB]">
              {job.region}
            </span>
            <h2 className="mb-3 text-[24px] font-semibold leading-9 text-[#111827]">
              {job.opening_title}
            </h2>
            <p className="mb-3 text-[17px] text-[#374151]">{job.company}</p>
          </div>

          <section className="border-t border-border py-6">
            <h3 className="mb-4 text-[20px] font-semibold text-[#111827]">근무 조건</h3>
            <dl className="space-y-3">
              {workConditions.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[92px_1fr] gap-4 text-[16px] leading-7">
                  <dt className="text-[#4b5563]">{label}</dt>
                  <dd className="text-[#111827]">{value || '-'}</dd>
                </div>
              ))}
            </dl>
          </section>

          <DetailSection title="회사 소개">
            <p>{job.introduce || '-'}</p>
          </DetailSection>

          <DetailSection title="담당 업무">
            <p>{job.job_role || '-'}</p>
          </DetailSection>

          <DetailSection title="지원 조건">
            <dl className="space-y-2">
              <div className="grid grid-cols-[92px_1fr] gap-4">
                <dt className="text-[#4b5563]">나이</dt>
                <dd>{job.age || '-'}</dd>
              </div>
              <div className="grid grid-cols-[92px_1fr] gap-4">
                <dt className="text-[#4b5563]">성별</dt>
                <dd>{job.gender || '-'}</dd>
              </div>
              <div className="grid grid-cols-[92px_1fr] gap-4">
                <dt className="text-[#4b5563]">우대</dt>
                <dd>{job.preferred || '-'}</dd>
              </div>
            </dl>
          </DetailSection>
        </article>
      )}
    </MobileLayout>
  )
}
