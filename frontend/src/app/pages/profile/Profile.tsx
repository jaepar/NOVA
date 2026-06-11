import { FileText } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserApiError, userApi } from '../../../api'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import { MobileLayout } from '../../components/layout/MobileLayout'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { languages } from '../../data/languages'
import { translateError, useTranslation } from '../../i18n'
import { useMainPageStore } from '../../stores/pageStores'
import { PortfolioItem, useProfileStore } from '../../stores/profileStore'

const fileStyleByType = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' },
  docx: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', label: 'DOCX' },
  file: { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-50', label: 'FILE' },
}

function isImagePreviewUrl(value?: string) {
  if (!value) {
    return false
  }

  const pathname = value.split('?')[0].toLowerCase()
  return /\.(apng|avif|gif|jpe?g|png|svg|webp)$/.test(pathname)
}

export function Profile() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn)
  const profile = useProfileStore((state) => state.profile)
  const portfolioItems = useProfileStore((state) => state.portfolios)
  const setProfileFromResponse = useProfileStore((state) => state.setProfileFromResponse)
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await userApi.getProfile()
      setProfileFromResponse(response)
    } catch (error) {
      const apiError = getUserApiError(error)
      setErrorMessage(translateError(apiError?.code, apiError?.message || t('profile.loadFailedFallback')))
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, setProfileFromResponse, t])

  useEffect(() => {
    if (isLoggedIn && !profile) {
      void fetchProfile()
    }
  }, [isLoggedIn, profile, fetchProfile])

  const genderDisplay: Record<string, string> = {
    male: t('profile.genderMale'),
    female: t('profile.genderFemale'),
  }
  const statusDisplay: Record<string, string> = {
    owned: t('profile.statusOwned'),
    notOwned: t('profile.statusNotOwned'),
    pending: t('profile.statusPending'),
  }

  const selectedLanguage = profile
    ? languages.find((language) => language.id === profile.languageId)?.name ?? profile.languageId
    : '-'
  const profileRows = profile
    ? [
        { label: t('profile.birthDate'), value: profile.birthDate },
        { label: t('profile.genderLabel'), value: genderDisplay[profile.gender] ?? profile.gender },
        { label: t('profile.languageSetting'), value: selectedLanguage },
        { label: t('profile.hasCertificate'), value: statusDisplay[profile.hasCertificate] ?? profile.hasCertificate },
        { label: t('profile.hasForeignerCard'), value: statusDisplay[profile.hasForeignerCard] ?? profile.hasForeignerCard },
      ]
    : []
  const selectedPortfolioStyle = selectedPortfolio
    ? fileStyleByType[selectedPortfolio.type]
    : fileStyleByType.pdf
  const isSelectedPortfolioImage = isImagePreviewUrl(selectedPortfolio?.url)

  const bottomContent = !isLoggedIn ? (
    <Btn_1Col onClick={() => navigate('/login/form')}>{t('profile.login')}</Btn_1Col>
  ) : undefined

  return (
    <MobileLayout
      title={t('profile.title')}
      headerType="back"
      backPath="/main"
      bottomContent={bottomContent}
    >
      {!isLoggedIn ? (
        <CenteredTaskContent
          task={t('profile.loginRequiredTask')}
          description={t('profile.loginRequiredDescription')}
        />
      ) : isLoading ? (
        <CenteredTaskContent
          task={t('profile.loadingTask')}
          description={t('profile.loadingDescription')}
        />
      ) : errorMessage ? (
        <CenteredTaskContent task={errorMessage} description={t('profile.retryDescription')}>
          <Btn_1Col onClick={fetchProfile}>{t('profile.retry')}</Btn_1Col>
        </CenteredTaskContent>
      ) : profile ? (
        <div className="-mb-28 flex min-h-full flex-col gap-4 pb-5 pt-3">
          <section className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {profile.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">{profile.name}</h2>
                <p className="mt-1 truncate text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-border">
            {profileRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="text-xs font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </section>

          <section className="flex min-h-[320px] shrink-0 flex-col gap-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">{t('profile.portfolioList')}</h3>
            {portfolioItems.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-xs text-muted-foreground">{t('profile.portfolioEmpty')}</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                {portfolioItems.map((portfolio, index) => {
                  const fileStyle = fileStyleByType[portfolio.type]
                  const FileIcon = fileStyle.icon

                  return (
                    <AppButton
                      type="button"
                      variant="unstyled"
                      key={`${portfolio.portfolioId ?? portfolio.name}-${index}`}
                      onClick={() => setSelectedPortfolio(portfolio)}
                      className={`flex w-full items-center gap-3 px-3 py-3 text-left ${
                        index !== portfolioItems.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${fileStyle.bg} ${fileStyle.color}`}
                      >
                        <FileIcon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 truncate text-xs font-medium text-foreground">
                        {portfolio.name}
                      </span>
                    </AppButton>
                  )
                })}
              </div>
            )}
          </section>

          <section className="pt-2">
            <Btn_1Col onClick={() => navigate('/mypage/edit')}>{t('profile.edit')}</Btn_1Col>
          </section>
        </div>
      ) : (
        <CenteredTaskContent
          task={t('profile.emptyTask')}
          description={t('profile.emptyDescription')}
        >
          <Btn_1Col onClick={fetchProfile}>{t('profile.retry')}</Btn_1Col>
        </CenteredTaskContent>
      )}

      <Dialog
        open={selectedPortfolio !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPortfolio(null)
        }}
      >
        <DialogContent className="flex h-[620px] max-w-[342px] flex-col rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="truncate text-base">
              {selectedPortfolio?.name ?? t('profile.dialogDefaultTitle')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t('profile.dialogDescription')}
            </DialogDescription>
          </DialogHeader>

          {selectedPortfolio && (
            <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-white">
              {selectedPortfolio.url && isSelectedPortfolioImage ? (
                <div className="flex h-full w-full items-center justify-center bg-[#f8fafc]">
                  <img
                    src={selectedPortfolio.url}
                    alt={`${selectedPortfolio.name} ${t('profile.portfolioList')}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : selectedPortfolio.url ? (
                <iframe
                  title={`${selectedPortfolio.name} ${t('profile.portfolioList')}`}
                  src={selectedPortfolio.url}
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-5 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('profile.previewUnavailable')}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  )
}
