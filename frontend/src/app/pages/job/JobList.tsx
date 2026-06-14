import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { jobApi, type JobOpeningItemResponse } from '../../../api'
import { AppButton } from '../../components/design-system/AppButton'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

function formatDate(value: string, language: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(language === 'en' ? 'en-US' : 'ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function JobList() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const [selectedRegion, setSelectedRegion] = useState('ALL')
  const [jobs, setJobs] = useState<JobOpeningItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadJobs() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await jobApi.listOpenings({ language })
        if (isMounted) {
          setJobs(response.items)
        }
      } catch {
        if (isMounted) {
          setErrorMessage(t('job.listLoadFailed'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadJobs()

    return () => {
      isMounted = false
    }
  }, [language, t])

  const filteredJobs = useMemo(() => {
    if (selectedRegion === 'ALL') {
      return jobs
    }

    return jobs.filter((job) => job.region === selectedRegion)
  }, [jobs, selectedRegion])

  const regionOptions = useMemo(() => {
    return Array.from(new Set(jobs.map((job) => job.region).filter(Boolean))).filter(
      (region) => region !== '전국'
    )
  }, [jobs])

  return (
    <MobileLayout
      title={t('job.title')}
      titleKey="job.title"
      backPath="/main"
      headerRightContent={
        <AppButton
          variant="unstyled"
          onClick={() => navigate('/jobs/applications')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
        >
          <BriefcaseBusiness className="h-5 w-5" />
        </AppButton>
      }
    >
      <div className="sticky top-0 z-10 -mx-5 border-b border-border bg-background px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger
              aria-label={t('job.regionSelect')}
              className="h-9 w-auto min-w-[96px] justify-start rounded-full border-border bg-background px-4 text-sm text-foreground shadow-none transition-colors hover:bg-secondary focus-visible:ring-primary/20"
            >
              <span className="text-muted-foreground">{t('job.region')}</span>
              <span className="h-3 w-px bg-border" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" className="max-h-[280px] rounded-xl">
              <SelectItem value="ALL" className="h-10">
                {t('job.allRegions')}
              </SelectItem>
              {regionOptions.map((region) => (
                <SelectItem key={region} value={region} className="h-10">
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {t('job.count').replace('{count}', String(filteredJobs.length))}
          </span>
        </div>
      </div>

      <section className="-mx-5">
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

        {!isLoading &&
          !errorMessage &&
          filteredJobs.map((job) => (
            <AppButton
              key={job.job_id}
              type="button"
              variant="unstyled"
              onClick={() => navigate(`/jobs/${job.job_id}`)}
              className="block w-full border-b border-border px-5 py-6 text-left transition-colors hover:bg-primary-soft"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="rounded-lg bg-primary-soft px-3 py-1 text-sm font-semibold text-[#2563EB]">
                  {job.region}
                </span>
                <span className="shrink-0 text-[15px] text-muted-foreground">
                  {formatDate(job.created_at, language)}
                </span>
              </div>

              <h2 className="mb-3 text-[21px] font-semibold leading-8 text-[#111827]">
                {job.opening_title}
              </h2>

              <p className="text-[16px] leading-7 text-muted-foreground">
                {[job.experience, job.job_category, job.work_period, job.salary].join('  ·  ')}
              </p>
            </AppButton>
          ))}

        {!isLoading && !errorMessage && filteredJobs.length === 0 && (
          <div className="px-5 py-20 text-center">
            <p className="text-muted-foreground">{t('job.emptyRegion')}</p>
          </div>
        )}
      </section>
    </MobileLayout>
  )
}
