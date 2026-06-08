import { FileText } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { Btn_2Col } from '../../components/design-system/Btn_2Col'
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
  docx: { icon: FileText, color: 'text-primary-light', bg: 'bg-primary-soft', label: 'DOCX' },
}

export function Profile() {
  const navigate = useNavigate()
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn)
  const profile = useProfileStore((state) => state.profile)
  const portfolioItems = useProfileStore((state) => state.portfolios)
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null)
  const selectedLanguage =
    languages.find((language) => language.id === profile.languageId)?.name ?? profile.languageId
  const profileRows = [
    { label: '생년월일', value: profile.birthDate },
    { label: '성별', value: profile.gender },
    { label: '언어 설정', value: selectedLanguage },
    { label: '인증서 보유 여부', value: profile.hasCertificate },
    { label: '외국인 등록증 보유 여부', value: profile.hasForeignerCard },
  ]
  const selectedPortfolioStyle = selectedPortfolio
    ? fileStyleByType[selectedPortfolio.type]
    : fileStyleByType.pdf
  const SelectedPortfolioIcon = selectedPortfolioStyle.icon

  const bottomContent = !isLoggedIn ? (
    <Btn_1Col onClick={() => navigate('/login')}>로그인하기</Btn_1Col>
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
          task="로그인이 필요합니다."
          description="프로필 정보를 확인하려면 먼저 로그인해주세요."
        />
      ) : (
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
                <p className="text-xs text-muted-foreground">등록된 포트폴리오가 없어요.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                {portfolioItems.map((portfolio, index) => {
                  const fileStyle = fileStyleByType[portfolio.type as keyof typeof fileStyleByType]
                  const FileIcon = fileStyle.icon

                  return (
                    <AppButton
                      type="button"
                      variant="unstyled"
                      key={portfolio.name}
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
            <Btn_2Col
              leftLabel="회원탈퇴"
              rightLabel="회원정보 수정"
              leftVariant="outline"
              rightVariant="primary"
              onLeftClick={() => navigate('/mypage/withdraw')}
              onRightClick={() => navigate('/mypage/edit')}
            />
          </section>
        </div>
      )}

      <Dialog
        open={selectedPortfolio !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPortfolio(null)
        }}
      >
        <DialogContent className="max-w-[342px] rounded-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-base">포트폴리오 상세</DialogTitle>
            <DialogDescription>선택한 파일 정보를 확인합니다.</DialogDescription>
          </DialogHeader>

          {selectedPortfolio && (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md ${selectedPortfolioStyle.bg} ${selectedPortfolioStyle.color}`}
              >
                <SelectedPortfolioIcon className="h-5 w-5" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="shrink-0 text-muted-foreground">파일명</span>
                  <span className="min-w-0 break-all text-right font-medium text-foreground">
                    {selectedPortfolio.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">파일 형식</span>
                  <span className="font-medium text-foreground">{selectedPortfolioStyle.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">업로드일</span>
                  <span className="font-medium text-foreground">{selectedPortfolio.date}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  )
}
