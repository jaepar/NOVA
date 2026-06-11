import { FileText } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../../../api'
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
      setProfileFromResponse(response, profile?.languageId)
    } catch (error) {
      setErrorMessage('프로필 정보를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, profile?.languageId, setProfileFromResponse])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const selectedLanguage = profile
    ? languages.find((language) => language.id === profile.languageId)?.name ?? profile.languageId
    : '-'
  const profileRows = profile
    ? [
        { label: '생년월일', value: profile.birthDate },
        { label: '성별', value: profile.gender },
        { label: '언어 설정', value: selectedLanguage },
        { label: '인증서 보유 여부', value: profile.hasCertificate },
        { label: '외국인 등록증 보유 여부', value: profile.hasForeignerCard },
      ]
    : []
  const selectedPortfolioStyle = selectedPortfolio
    ? fileStyleByType[selectedPortfolio.type]
    : fileStyleByType.pdf
  const isSelectedPortfolioImage = isImagePreviewUrl(selectedPortfolio?.url)

  const bottomContent = !isLoggedIn ? (
    <Btn_1Col onClick={() => navigate('/login/form')}>로그인하기</Btn_1Col>
  ) : undefined

  return (
    <MobileLayout
      title="프로필"
      headerType="back"
      backPath="/main"
      bottomContent={bottomContent}
    >
      {!isLoggedIn ? (
        <CenteredTaskContent
          task="로그인이 필요합니다"
          description="프로필 정보를 확인하려면 먼저 로그인해주세요."
        />
      ) : isLoading ? (
        <CenteredTaskContent
          task="프로필 정보를 불러오고 있습니다"
          description="잠시만 기다려주세요."
        />
      ) : errorMessage ? (
        <CenteredTaskContent task={errorMessage} description="잠시 후 다시 시도해주세요.">
          <Btn_1Col onClick={fetchProfile}>다시 시도</Btn_1Col>
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
            <h3 className="text-sm font-semibold text-foreground">포트폴리오 목록</h3>
            {portfolioItems.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-xs text-muted-foreground">등록된 포트폴리오가 없어요</p>
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
            <Btn_1Col onClick={() => navigate('/mypage/edit')}>회원정보 수정</Btn_1Col>
          </section>
        </div>
      ) : (
        <CenteredTaskContent
          task="프로필 정보가 없습니다"
          description="프로필 정보를 다시 불러와주세요."
        >
          <Btn_1Col onClick={fetchProfile}>다시 시도</Btn_1Col>
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
              {selectedPortfolio?.name ?? '선택한 파일을 확인합니다.'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              선택한 포트폴리오 파일의 미리보기입니다.
            </DialogDescription>
          </DialogHeader>

          {selectedPortfolio && (
            <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-white">
              {selectedPortfolio.url && isSelectedPortfolioImage ? (
                <div className="flex h-full w-full items-center justify-center bg-[#f8fafc]">
                  <img
                    src={selectedPortfolio.url}
                    alt={`${selectedPortfolio.name} 미리보기`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : selectedPortfolio.url ? (
                <iframe
                  title={`${selectedPortfolio.name} 미리보기`}
                  src={selectedPortfolio.url}
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-5 text-center">
                  <p className="text-sm text-muted-foreground">
                    저장 전 파일은 저장 후 다시 확인할 수 있습니다.
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
