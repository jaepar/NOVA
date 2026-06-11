import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle2, CircleAlert } from 'lucide-react'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'

const guideItems = [
  'account.passportGuide.item1',
  'account.passportGuide.item2',
  'account.passportGuide.item3',
  'account.passportGuide.item4',
] as const

export function PassportCaptureGuide() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <MobileLayout
      title={t('account.identityTitle', '비대면 실명확인')}
      titleKey="account.identityTitle"
      backPath="/account/step-02"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/account/step-04')}>
          {t('account.passportGuide.start', '여권 촬영 시작하기')}
        </Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('account.passportGuide.heading', '여권 촬영 전\n아래 내용을 확인해 주세요')
              .split('\n')
              .map((line, index, lines) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('account.passportGuide.description', '정확한 인증을 위해 촬영 가이드를 먼저 확인해 주세요.')}
          </p>
        </section>

        <section className="rounded-2xl bg-secondary p-5 space-y-4">
          <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center text-primary">
            <Camera className="w-7 h-7" />
          </div>
          <div className="space-y-3">
            {guideItems.map((itemKey) => (
              <div key={itemKey} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm leading-relaxed">{t(itemKey)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-secondary p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <CircleAlert className="w-5 h-5" />
            <p className="font-medium">{t('account.passportGuide.warningTitle', '주의사항')}</p>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {t('account.passportGuide.warningDescription', '반사광, 접힘, 손가락 가림이 있는 경우 인증이 실패할 수 있습니다. 실패 시 안내에 따라 다시 촬영해 주세요.')}
          </p>
        </section>
      </div>
    </MobileLayout>
  )
}



