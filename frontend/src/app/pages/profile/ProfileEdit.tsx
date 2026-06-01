import { ChangeEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Eye, EyeOff, FileText, Plus, Trash2 } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import { BottomSheet } from '../../components/layout/BottomSheet'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { languages } from '../../data/languages'
import { useMainPageStore } from '../../stores/pageStores'
import { PortfolioFileType, PortfolioItem, useProfileStore } from '../../stores/profileStore'

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,16}$/
const MAX_PORTFOLIO_FILE_SIZE = 5 * 1024 * 1024
const PORTFOLIO_FILE_ACCEPT =
  '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const fileStyleByType = {
  pdf: {
    icon: FileText,
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'PDF',
  },
  docx: {
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'DOCX',
  },
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function getPortfolioFileType(file: File): 'pdf' | 'docx' | null {
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

  return null
}

export function ProfileEdit() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn)
  const profile = useProfileStore((state) => state.profile)
  const storedPortfolios = useProfileStore((state) => state.portfolios)
  const updateProfile = useProfileStore((state) => state.updateProfile)
  const [language, setLanguage] = useState(profile.languageId)
  const [isLanguageSheetOpen, setLanguageSheetOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isPasswordInputCompleted, setPasswordInputCompleted] = useState(false)
  const [isCurrentPasswordVisible, setCurrentPasswordVisible] = useState(false)
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const [isPasswordConfirmVisible, setPasswordConfirmVisible] = useState(false)
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(() => storedPortfolios)
  const [portfolioError, setPortfolioError] = useState('')

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
  const isPasswordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm
  const canSave =
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

    if (!fileType) {
      setPortfolioError('PDF, DOCX 파일만 업로드 가능합니다.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_PORTFOLIO_FILE_SIZE) {
      setPortfolioError('파일은 최대 5MB까지 업로드 가능합니다.')
      event.target.value = ''
      return
    }

    setPortfolios((current) => [
      ...current,
      {
        name: file.name,
        date: formatDate(new Date()),
        type: fileType,
      },
    ])
    setPortfolioError('')
    event.target.value = ''
  }

  const handleSave = () => {
    if (!canSave) return

    updateProfile({
      languageId: language,
      portfolios,
    })
    navigate('/mypage')
  }

  const bottomContent = !isLoggedIn ? (
    <Btn_1Col onClick={() => navigate('/login')}>로그인하기</Btn_1Col>
  ) : undefined

  return (
    <MobileLayout
      title="회원정보 수정"
      headerType="back"
      backPath="/mypage"
      bottomContent={bottomContent}
    >
      {!isLoggedIn ? (
        <CenteredTaskContent
          task="로그인이 필요합니다."
          description="프로필 정보를 확인하려면 먼저 로그인해주세요."
        />
      ) : (
        <div className="-mb-32 space-y-6 pb-3 pt-3">
          <section className="space-y-3">
            <p className="text-xs text-muted-foreground">
              변경 가능한 정보만 수정할 수 있습니다.
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">언어 설정</label>
              <AppButton
                type="button"
                variant="unstyled"
                onClick={() => setLanguageSheetOpen(true)}
                className="mt-[6px] flex w-full items-center justify-between rounded-lg border border-border bg-input-background px-4 py-3 text-left text-base transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="언어 설정"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-xl">{selectedLanguage.flag}</span>
                  <span className="truncate">{selectedLanguage.name}</span>
                </span>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
              </AppButton>
              <p className="text-xs text-muted-foreground">
                언어를 변경하면 앱 전체에 적용됩니다.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">비밀번호 변경</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">현재 비밀번호</label>
              <div className="relative">
                <input
                  type={isCurrentPasswordVisible ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="현재 비밀번호 입력"
                  autoComplete="current-password"
                  className="mt-[6px] w-full rounded-lg border border-border bg-input-background py-3 pl-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontSize: '16px' }}
                />
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setCurrentPasswordVisible((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={isCurrentPasswordVisible ? '현재 비밀번호 숨기기' : '현재 비밀번호 보기'}
                >
                  <CurrentPasswordIcon className="h-5 w-5" />
                </AppButton>
              </div>
              {isCurrentPasswordMissing ? (
                <p className="text-xs text-red-500">현재 비밀번호를 입력해주세요.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">새 비밀번호 입력</label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setPasswordInputCompleted(false)
                  }}
                  placeholder="새 비밀번호 입력"
                  autoComplete="off"
                  className="mt-[6px] w-full rounded-lg border border-border bg-input-background py-3 pl-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontSize: '16px' }}
                />
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  <PasswordIcon className="h-5 w-5" />
                </AppButton>
              </div>
              {isPasswordFormatInvalid ? (
                <p className="text-xs text-red-500">
                  영문, 숫자, 특수문자 포함 8~16자로 입력해주세요.
                </p>
              ) : isSameAsCurrentPassword ? (
                <p className="text-xs text-red-500">
                  새 비밀번호는 현재 비밀번호와 다르게 입력해주세요.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  영문, 숫자, 특수문자 포함 8~16자로 입력해주세요.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">새 비밀번호 확인</label>
              <div className="relative">
                <input
                  type={isPasswordConfirmVisible ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  onFocus={() => setPasswordInputCompleted(password.length > 0)}
                  placeholder="새 비밀번호 확인"
                  autoComplete="off"
                  className="mt-[6px] w-full rounded-lg border border-border bg-input-background py-3 pl-4 pr-12 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ fontSize: '16px' }}
                />
                <AppButton
                  type="button"
                  variant="unstyled"
                  onClick={() => setPasswordConfirmVisible((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    isPasswordConfirmVisible ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'
                  }
                >
                  <PasswordConfirmIcon className="h-5 w-5" />
                </AppButton>
              </div>
              {shouldShowPasswordConfirmMissing ? (
                <p className="text-xs text-red-500">
                  새 비밀번호와 새 비밀번호 확인을 모두 입력해주세요.
                </p>
              ) : isPasswordMismatch ? (
                <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">포트폴리오 관리</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                포트폴리오를 추가하거나 삭제할 수 있습니다.
              </p>
            </div>

            {portfolios.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border">
                {portfolios.map((portfolio, index) => {
                  const fileStyle = fileStyleByType[portfolio.type]
                  const FileIcon = fileStyle.icon

                  return (
                    <div
                      key={`${portfolio.name}-${index}`}
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
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          업로드일: {portfolio.date}
                        </p>
                      </div>
                      <AppButton
                        type="button"
                        variant="unstyled"
                        onClick={() =>
                          setPortfolios((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                        aria-label={`${portfolio.name} 삭제`}
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
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-4 text-sm font-medium text-primary transition-colors hover:bg-blue-50"
            >
              <Plus className="h-5 w-5" />
              포트폴리오 추가
            </AppButton>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={PORTFOLIO_FILE_ACCEPT}
              onChange={handlePortfolioFileChange}
            />
            {portfolioError && <p className="text-xs text-red-500">{portfolioError}</p>}
            <p className="text-xs text-muted-foreground">
              PDF, DOCX 파일만 업로드 가능합니다. 최대 5MB
            </p>
          </section>

          <section>
            <Btn_1Col disabled={!canSave} onClick={handleSave}>
              저장하기
            </Btn_1Col>
          </section>
        </div>
      )}

      {isLoggedIn && (
        <BottomSheet
          isOpen={isLanguageSheetOpen}
          onClose={() => setLanguageSheetOpen(false)}
          title="언어 설정"
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
                    <span className="text-2xl">{item.flag}</span>
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
