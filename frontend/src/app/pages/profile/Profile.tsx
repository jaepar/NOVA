import { FileText, Presentation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CenteredTaskContent } from '../../components/design-system/CenteredTaskContent'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useMainPageStore } from '../../stores/pageStores'

const profile = {
  name: '김민정',
  email: 'minjeong@email.com',
  birthDate: '2000.05.20',
  gender: '여성',
  language: '한국어',
  hasCertificate: '보유',
  hasForeignerCard: '보유',
}

const profileRows = [
  { label: '생년월일', value: profile.birthDate },
  { label: '성별', value: profile.gender },
  { label: '언어 설정', value: profile.language },
  { label: '인증서 보유 여부', value: profile.hasCertificate },
  { label: '외국인 등록증 보유 여부', value: profile.hasForeignerCard },
]

const portfolioItems = [
  { name: '간호사_이력서.pdf', type: 'pdf' },
  { name: '자기소개서.docx', type: 'docx' },
  { name: '포트폴리오_작품집.pptx', type: 'pptx' },
  { name: '자격증_사본.pdf', type: 'pdf' },
  { name: '봉사활동_확인서.docx', type: 'docx' },
]

const fileStyleByType = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  docx: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  pptx: { icon: Presentation, color: 'text-green-500', bg: 'bg-green-50' },
}

export function Profile() {
  const navigate = useNavigate()
  const isLoggedIn = useMainPageStore((state) => state.isLoggedIn)

  const bottomContent = isLoggedIn ? (
    <div className="space-y-3">
      <Btn_1Col onClick={() => navigate('/mypage/edit')}>회원정보 수정</Btn_1Col>
      <Btn_1Col variant="outline">회원탈퇴</Btn_1Col>
    </div>
  ) : (
    <Btn_1Col onClick={() => navigate('/login')}>로그인하기</Btn_1Col>
  )

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
        <div className="space-y-4 pb-16 pt-3">
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

          <section className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">포트폴리오 목록</h3>
            <div className="overflow-hidden rounded-lg border border-border">
              {portfolioItems.map((portfolio, index) => {
                const fileStyle = fileStyleByType[portfolio.type as keyof typeof fileStyleByType]
                const FileIcon = fileStyle.icon

                return (
                  <AppButton
                    type="button"
                    variant="unstyled"
                    key={portfolio.name}
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
          </section>
        </div>
      )}
    </MobileLayout>
  )
}
