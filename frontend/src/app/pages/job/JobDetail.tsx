import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { jobApi, type JobOpeningResponse } from '../../../api'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'

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

function formatRecruitCount(value: string, undeterminedLabel: string, peopleUnit: string) {
  if (!value) {
    return '-'
  }

  const trimmedValue = value.trim()
  if (trimmedValue.includes('인원미정')) {
    return undeterminedLabel
  }

  const koreanCountMatch = trimmedValue.match(/^(\d+)\s*명$/)
  if (koreanCountMatch) {
    return `${koreanCountMatch[1]}${peopleUnit}`
  }

  return /^\d+$/.test(trimmedValue) ? `${trimmedValue}${peopleUnit}` : trimmedValue
}

export function JobDetail() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const { jobId } = useParams()
  const numericJobId = Number(jobId)
  const [job, setJob] = useState<JobOpeningResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadJob() {
      if (!Number.isFinite(numericJobId)) {
        setErrorMessage(t('job.detailNotFound'))
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await jobApi.getOpening(numericJobId, { language })
        if (isMounted) {
          setJob(response)
        }
      } catch {
        if (isMounted) {
          setErrorMessage(t('job.detailLoadFailed'))
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
  }, [language, numericJobId, t])

  const workConditions = job
    ? [
        [t('job.detail.employmentType'), job.employment_type],
        [t('job.detail.experience'), job.experience],
        [t('job.detail.category'), job.job_category],
        [t('job.detail.salary'), job.salary],
        [t('job.detail.workPeriod'), job.work_period],
        [t('job.detail.deadline'), job.deadline_type],
        [
          t('job.detail.recruitCount'),
          formatRecruitCount(
            job.recruit_count,
            t('job.detail.recruitUndetermined'),
            t('job.detail.peopleUnit')
          ),
        ],
        [t('job.detail.address'), job.address],
        [t('job.detail.benefits'), job.benefits],
      ]
    : []

  return (
    <MobileLayout
      title={t('job.title')}
      titleKey="job.title"
      backPath="/jobs"
      bottomContent={
        job ? (
          <Btn_1Col onClick={() => navigate(`/jobs/${job.job_id}/apply`)}>
            {t('job.apply')}
          </Btn_1Col>
        ) : undefined
      }
    >
      {isLoading && (
        <div className="px-5 py-20 text-center">
          <p className="text-muted-foreground">{t('job.listLoading')}</p>
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
            <h3 className="mb-4 text-[20px] font-semibold text-[#111827]">
              {t('job.detail.workConditions')}
            </h3>
            <dl className="space-y-3">
              {workConditions.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[92px_1fr] gap-4 text-[16px] leading-7">
                  <dt className="text-[#4b5563]">{label}</dt>
                  <dd className="text-[#111827]">{value || '-'}</dd>
                </div>
              ))}
            </dl>
          </section>

          <DetailSection title={t('job.detail.companyIntro')}>
            <p>{job.introduce || '-'}</p>
          </DetailSection>

          <DetailSection title={t('job.detail.jobRole')}>
            <p>{job.job_role || '-'}</p>
          </DetailSection>

          <DetailSection title={t('job.detail.requirements')}>
            <dl className="space-y-2">
              <div className="grid grid-cols-[92px_1fr] gap-4">
                <dt className="text-[#4b5563]">{t('job.detail.age')}</dt>
                <dd>{job.age || '-'}</dd>
              </div>
              <div className="grid grid-cols-[92px_1fr] gap-4">
                <dt className="text-[#4b5563]">{t('job.detail.gender')}</dt>
                <dd>{job.gender || '-'}</dd>
              </div>
              <div className="grid grid-cols-[92px_1fr] gap-4">
                <dt className="text-[#4b5563]">{t('job.detail.preferred')}</dt>
                <dd>{job.preferred || '-'}</dd>
              </div>
            </dl>
          </DetailSection>
        </article>
      )}
    </MobileLayout>
  )
}
