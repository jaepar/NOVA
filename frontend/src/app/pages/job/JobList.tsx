import { useMemo, useState } from 'react'
import { BriefcaseBusiness } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { HeaderActionButton } from '../../components/layout/HeaderActionButton'
import { MobileLayout } from '../../components/layout/MobileLayout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { jobPostings, jobRegionLabels, jobRegions } from '../../domains/job/mock'
import type { JobRegion } from '../../domains/job/types'

export function JobList() {
  const navigate = useNavigate()
  const [selectedRegion, setSelectedRegion] = useState<JobRegion>('ALL')

  const filteredJobs = useMemo(() => {
    if (selectedRegion === 'ALL') {
      return jobPostings
    }

    return jobPostings.filter((job) => job.region === selectedRegion)
  }, [selectedRegion])

  return (
    <MobileLayout
      title="구인구직"
      backPath="/main"
      headerRightContent={
        <HeaderActionButton onClick={() => navigate('/jobs/applications')} align="right">
          <BriefcaseBusiness className="h-5 w-5" />
        </HeaderActionButton>
      }
    >
      <div className="sticky top-0 z-10 -mx-5 border-b border-border bg-background px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <Select
            value={selectedRegion}
            onValueChange={(value) => setSelectedRegion(value as JobRegion)}
          >
            <SelectTrigger
              aria-label="지역 선택"
              className="h-9 w-auto min-w-[96px] justify-start rounded-full border-border bg-background px-4 text-sm text-foreground shadow-none transition-colors hover:bg-secondary focus-visible:ring-primary/20"
            >
              <span className="text-muted-foreground">지역</span>
              <span className="h-3 w-px bg-border" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" className="max-h-[280px] rounded-xl">
              {jobRegions.map((region) => (
                <SelectItem key={region} value={region} className="h-10">
                  {jobRegionLabels[region]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {filteredJobs.length}건
          </span>
        </div>
      </div>

      <section className="-mx-5">
        {filteredJobs.map((job) => (
          <AppButton
            key={job.jobId}
            type="button"
            variant="unstyled"
            onClick={() => navigate(`/jobs/${job.jobId}`)}
            className="block w-full border-b border-border px-5 py-6 text-left transition-colors hover:bg-blue-50"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-[#0057ff]">
                {jobRegionLabels[job.region]}
              </span>
              <span className="shrink-0 text-[15px] text-muted-foreground">{job.createdAt}</span>
            </div>

            <h2 className="mb-3 text-[21px] font-semibold leading-8 text-[#111827]">
              {job.openingTitle}
            </h2>

            <p className="text-[16px] leading-7 text-muted-foreground">
              {[
                job.employmentType,
                job.experience,
                job.jobCategory,
                job.workDays,
                job.salary,
              ].join('  ·  ')}
            </p>
          </AppButton>
        ))}

        {filteredJobs.length === 0 && (
          <div className="px-5 py-20 text-center">
            <p className="text-muted-foreground">해당 지역의 공고가 없습니다.</p>
          </div>
        )}
      </section>
    </MobileLayout>
  )
}
