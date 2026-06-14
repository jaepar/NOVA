import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Eye, EyeOff, FileText, Plus, Trash2 } from 'lucide-react'
import { getUserApiError, userApi } from '../../../api'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import { BottomSheet } from '../../components/layout/BottomSheet'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { languages } from '../../data/languages'
import { getLanguageCookie, setLanguageCookie, translateError, useTranslation } from '../../i18n'
import { useMainPageStore } from '../../stores/pageStores'
import { PortfolioFileType, PortfolioItem, useProfileStore } from '../../stores/profileStore'

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,16}$/

const fileStyleByType = {
  pdf: {
    icon: FileText,
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'PDF',
  },
  docx: {
    icon: FileText,
    color: 'text-primary-light',
    bg: 'bg-primary-soft',
    label: 'DOCX',
  },
  file: {
    icon: FileText,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    label: 'FILE',
  },
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function getPortfolioFileType(file: File): PortfolioFileType {
  const lowerName = file.name.toLowerCase()

  if (file.type === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return 'pdf'
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerName.endsWith('.docx')
  ) {
    return 'docx'
  }

  return 'file'
}

export function ProfileEdit() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn)
  const profile = useProfileStore((state) => state.profile)
  const storedPortfolios = useProfileStore((state) => state.portfolios)
  const setProfileFromResponse = useProfileStore((state) => state.setProfileFromResponse)
  const [language, setLanguage] = useState(profile?.languageId ?? getLanguageCookie())
  const [isLanguageSheetOpen, setLanguageSheetOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isPasswordInputCompleted, setPasswordInputCompleted] = useState(false)
  const [isCurrentPasswordVisible, setCurrentPasswordVisible] = useState(false)
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const [isPasswordConfirmVisible, setPasswordConfirmVisible] = useState(false)
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(() => storedPortfolios)
  const [deletedPortfolioIds, setDeletedPortfolioIds] = useState<number[]>([])
  const [portfolioError, setPortfolioError] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const loadProfile = useCallback(async () => {
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
      void loadProfile()
    }
  }, [isLoggedIn, loadProfile, profile])

  useEffect(() => {
    if (!profile) return

    setLanguage(profile.languageId)
    setPortfolios(storedPortfolios)
    setDeletedPortfolioIds([])
  }, [profile, storedPortfolios])

  const CurrentPasswordIcon = isCurrentPasswordVisible ? EyeOff : Eye
  const PasswordIcon = isPasswordVisible ? EyeOff : Eye
  const PasswordConfirmIcon = isPasswordConfirmVisible ? EyeOff : Eye
  const selectedLanguage = languages.find((item) => item.id === language) ?? languages[0]
  const isPasswordChangeStarted =
    currentPassword.length > 0 || password.length > 0 || passwordConfirm.length > 0
  const isCurrentPasswordMissing = isPasswordChangeStarted && currentPassword.length === 0
  const isPasswordIncomplete =
    isPasswordChangeStarted && (password.length === 0 || passwordConfirm.length === 0)
  const isPasswordFormatInvalid = password.length > 0 && !PASSWORD_PATTERN.test(password)
  const isSameAsCurrentPassword =
    currentPassword.length > 0 && password.length > 0 && currentPassword === password
  const shouldShowPasswordConfirmMissing =
    currentPassword.length > 0 &&
    password.length > 0 &&
    passwordConfirm.length === 0 &&
    isPasswordInputCompleted &&
    !isPasswordFormatInvalid &&
    !isSameAsCurrentPassword
  const isPasswordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm
  const newPortfolioFiles = portfolios
    .filter((portfolio) => portfolio.isNew && portfolio.file)
    .map((portfolio) => portfolio.file as File)
  const isLanguageChanged = Boolean(profile && language !== profile.languageId)
  const hasPortfolioChange = deletedPortfolioIds.length > 0 || newPortfolioFiles.length > 0
  const hasChanges = isLanguageChanged || isPasswordChangeStarted || hasPortfolioChange
  const canSave =
    Boolean(profile) &&
    hasChanges &&
    !isSaving &&
    !isCurrentPasswordMissing &&
    !isPasswordIncomplete &&
    !isPasswordFormatInvalid &&
    !isSameAsCurrentPassword &&
    !isPasswordMismatch

  const openPortfolioFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handlePortfolioFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (!file) return

    const fileType = getPortfolioFileType(file)

    setPortfolios((current) => [
      ...current,
      {
        name: file.name,
        date: formatDate(new Date()),
        type: fileType,
        file,
        isNew: true,
      },
    ])
    setPortfolioError('')
    event.target.value = ''
  }

  const handleRemovePortfolio = (portfolio: PortfolioItem, index: number) => {
    if (portfolio.isNew) {
      setPortfolios((current) => current.filter((_, itemIndex) => itemIndex !== index))
      setPortfolioError('')
      return
    }

    if (!portfolio.portfolioId) {
      setPortfolioError(t('profile.portfolioDeleteError'))
      return
    }

    setDeletedPortfolioIds((current) => [...current, portfolio.portfolioId as number])
    setPortfolios((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setPortfolioError('')
  }

  const handleSave = async () => {
    if (!canSave || !profile) return

    setIsSaving(true)
    setErrorMessage(null)

    try {
      const [firstDeletePortfolioId, ...remainingDeletePortfolioIds] = deletedPortfolioIds

      await userApi.updateProfile({
        request: {
          language: isLanguageChanged ? language : undefined,
          currentPassword: isPasswordChangeStarted ? currentPassword : undefined,
          newPassword: isPasswordChangeStarted ? password : undefined,
          newPasswordConfirm: isPasswordChangeStarted ? passwordConfirm : undefined,
          deletePortfolioId: firstDeletePortfolioId,
        },
        portfolioFiles: newPortfolioFiles,
      })

      await Promise.all(
        remainingDeletePortfolioIds.map((deletePortfolioId) =>
          userApi.updateProfile({ request: { deletePortfolioId } })
        )
      )

      if (isLanguageChanged) {
        setLanguageCookie(language)
      }

      const latestProfile = await userApi.getProfile()
      setProfileFromResponse(latestProfile, language)
      navigate('/mypage')
    } catch (error) {
      const apiError = getUserApiError(error)
      setErrorMessage(translateError(apiError?.code, apiError?.message || t('profile.saveFailed')))
    } finally {
      setIsSaving(false)
    }
  }

  const bottomContent = !isLoggedIn ? (
    <Btn_1Col onClick={() => navigate('/login/form')}>{t('profile.login')}</Btn_1Col>
  ) : undefined

  return (
    <MobileLayout
      title={t('profile.editTitle')}
      headerType="back"
      backPath="/mypage"
      bottomContent={bottomContent}
    >
      {!isLoggedIn ? (
        <CenteredTaskContent
          task={t('profile.loginRequiredTask')}
          description={t('profile.editLoginRequiredDescription')}
        />
      ) : isLoading ? (
        <CenteredTaskContent
          task={t('profile.loadingTask')}
          description={t('profile.loadingDescription')}
        />
      ) : errorMessage && !profile ? (
        <CenteredTaskContent task={errorMessage} description={t('profile.retryDescription')}>
          <Btn_1Col onClick={loadProfile}>{t('profile.retry')}</Btn_1Col>
        </CenteredTaskContent>
      ) : profile ? (
        <div className="-mb-32 space-y-6 pb-3 pt-3">
          <section className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {t('profile.editableInfoNote')}
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('profile.languageSetting')}</label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setLanguageSheetOpen(true)}
                className="mt-[6px] flex w-full items-center justify-between rounded-lg border border-border bg-input-background px-4 py-3 text-left text-base transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t('profile.languageSetting')}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex items-center justify-center text-xl leading-none">
                    {selectedLanguage.flag}
                  </span>
                  <span className="truncate">{selectedLanguage.name}</span>
                </span>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
              </AppButton>
              <p className="text-xs text-muted-foreground">
                {t('profile.languageChangeNote')}
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('profile.passwordChangeTitle')}</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('profile.currentPassword')}</label>
              <div className="relative">
                <input
                  type={isCurrentPasswordVisible ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder={t('profile.currentPasswordPlaceholder')}
                  autoComplete="current-password"
                  className="mt-[6px] w-full rounded-lg border border-border bg-input-background py-3 pl-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontSize: '16px' }}
                />
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setCurrentPasswordVisible((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={isCurrentPasswordVisible ? t('profile.hideCurrentPassword') : t('profile.showCurrentPassword')}
                >
                  <CurrentPasswordIcon className="h-5 w-5" />
                </AppButton>
              </div>
              {isCurrentPasswordMissing ? (
                <p className="text-xs text-red-500">{t('profile.currentPasswordRequired')}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('profile.newPassword')}</label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setPasswordInputCompleted(false)
                  }}
                  placeholder={t('profile.newPasswordPlaceholder')}
                  autoComplete="off"
                  className="mt-[6px] w-full rounded-lg border border-border bg-input-background py-3 pl-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontSize: '16px' }}
                />
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={isPasswordVisible ? t('login.hidePassword') : t('login.showPassword')}
                >
                  <PasswordIcon className="h-5 w-5" />
                </AppButton>
              </div>
              {isPasswordFormatInvalid ? (
                <p className="text-xs text-red-500">{t('profile.passwordFormatHint')}</p>
              ) : isSameAsCurrentPassword ? (
                <p className="text-xs text-red-500">{t('profile.passwordSameAsCurrent')}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{t('profile.passwordFormatHint')}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('profile.passwordConfirmLabel')}</label>
              <div className="relative">
                <input
                  type={isPasswordConfirmVisible ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  onFocus={() => setPasswordInputCompleted(password.length > 0)}
                  placeholder={t('profile.passwordConfirmPlaceholder')}
                  autoComplete="off"
                  className="mt-[6px] w-full rounded-lg border border-border bg-input-background py-3 pl-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontSize: '16px' }}
                />
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setPasswordConfirmVisible((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={isPasswordConfirmVisible ? t('profile.hidePasswordConfirm') : t('profile.showPasswordConfirm')}
                >
                  <PasswordConfirmIcon className="h-5 w-5" />
                </AppButton>
              </div>
              {shouldShowPasswordConfirmMissing ? (
                <p className="text-xs text-red-500">{t('profile.passwordConfirmRequired')}</p>
              ) : isPasswordMismatch ? (
                <p className="text-xs text-red-500">{t('profile.passwordMismatch')}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('profile.portfolioManageTitle')}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('profile.portfolioManageNote')}
              </p>
            </div>

            {portfolios.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border">
                {portfolios.map((portfolio, index) => {
                  const fileStyle = fileStyleByType[portfolio.type]
                  const FileIcon = fileStyle.icon

                  return (
                    <div
                      key={`${portfolio.portfolioId ?? portfolio.name}-${index}`}
                      className={`flex items-center gap-3 px-3 py-3 ${
                        index !== portfolios.length - 1 ? 'border-b border-border' : ''
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${fileStyle.bg} ${fileStyle.color}`}
                        aria-label={fileStyle.label}
                      >
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {portfolio.name}
                        </p>
                      </div>
                      <AppButton
                        type="button"
                        variant="unstyled"
                        onClick={() => handleRemovePortfolio(portfolio, index)}
                        className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                        aria-label={`${portfolio.name} ${t('common.cancel')}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </AppButton>
                    </div>
                  )
                })}
              </div>
            )}

            <AppButton
              type="button"
              variant="unstyled"
              onClick={openPortfolioFilePicker}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-4 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
            >
              <Plus className="h-5 w-5" />
              {t('profile.portfolioAdd')}
            </AppButton>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handlePortfolioFileChange}
            />
            {portfolioError && <p className="text-xs text-red-500">{portfolioError}</p>}
          </section>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{errorMessage}</p>
          )}

          <section>
            <Btn_1Col disabled={!canSave} onClick={handleSave}>
              {isSaving ? t('common.saving') : t('common.save')}
            </Btn_1Col>
          </section>
        </div>
      ) : (
        <CenteredTaskContent
          task={t('profile.emptyTask')}
          description={t('profile.emptyDescription')}
        >
          <Btn_1Col onClick={loadProfile}>{t('profile.retry')}</Btn_1Col>
        </CenteredTaskContent>
      )}

      {isLoggedIn && (
        <BottomSheet
          isOpen={isLanguageSheetOpen}
          onClose={() => setLanguageSheetOpen(false)}
          title={t('profile.languageSetting')}
          height="560px"
        >
          <div className="space-y-2 pb-2">
            {languages.map((item) => {
              const isSelected = item.id === language

              return (
                <AppButton
                  type="button"
                  variant="unstyled"
                  key={item.id}
                  onClick={() => {
                    setLanguage(item.id)
                    setLanguageSheetOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:border-primary/30'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex items-center justify-center text-2xl leading-none">
                      {item.flag}
                    </span>
                    <span className="truncate font-normal">{item.name}</span>
                  </span>
                  {isSelected && <Check className="h-5 w-5 shrink-0 text-primary" />}
                </AppButton>
              )
            })}
          </div>
        </BottomSheet>
      )}
    </MobileLayout>
  )
}
