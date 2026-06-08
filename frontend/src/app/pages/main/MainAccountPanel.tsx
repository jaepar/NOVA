import { MoreVertical } from 'lucide-react'
import { AppButton } from '../../components/design-system/AppButton'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'

interface MainAccountPanelProps {
  isLoggedIn: boolean
  hasAccount: boolean
  onLoginClick: () => void
  onSignupClick: () => void
  onOpenCertificateSheet: () => void
}

export function MainAccountPanel({
  isLoggedIn,
  hasAccount,
  onLoginClick,
  onSignupClick,
  onOpenCertificateSheet,
}: MainAccountPanelProps) {
  if (!isLoggedIn) {
    return (
      <div className="min-h-[220px] rounded-[24px] border border-border bg-background px-5 py-8 shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
        <div className="mb-6 space-y-3 text-center">
          <h3 className="text-lg font-semibold text-foreground">로그인하고 내 계좌를 확인하세요</h3>
          <p className="text-sm font-medium text-muted-foreground">
            안전하고 빠른 금융생활을 시작해보세요.
          </p>
        </div>
        <div className="space-y-3">
          <Btn_1Col onClick={onLoginClick}>로그인</Btn_1Col>
          <Btn_1Col variant="outline" onClick={onSignupClick}>
            회원가입
          </Btn_1Col>
        </div>
      </div>
    )
  }

  if (!hasAccount) {
    return (
      <div className="min-h-[220px] rounded-[24px] border border-border bg-background px-5 py-8 shadow-[0_4px_16px_rgba(15,23,42,0.05)]">
        <div className="mb-6 space-y-3 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            계좌 개설로 더 다양한 서비스를 이용하세요
          </h3>
          <p className="text-sm font-medium text-muted-foreground">새로운 금융의 시작 NOVA</p>
        </div>
        <Btn_1Col onClick={onOpenCertificateSheet}>계좌 개설하기</Btn_1Col>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#003CA6] to-[#2563EB] rounded-2xl p-6 text-white min-h-[180px] flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white" />
          </div>
          <div>
            <span className="font-medium">우리 SUPER 주거래 통장</span>
            <p className="text-xs text-white/80 mt-0.5">우리 1002-959-126226</p>
          </div>
        </div>
        <AppButton variant="unstyled" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </AppButton>
      </div>

      <div>
        <p className="text-sm text-white/80 mb-1">잔액</p>
        <p className="text-2xl font-semibold">1,234,567 원</p>
      </div>
    </div>
  )
}
