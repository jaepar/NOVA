import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle2, CircleAlert } from 'lucide-react'
import { AccountMobileLayout } from './components/AccountMobileLayout'
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
    <AccountMobileLayout
      title={t('account.identityTitle')}
      titleKey="account.identityTitle"
      backPath="/account/step-02"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/account/step-04')}>
          {t('account.passportGuide.start')}
        </Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('account.passportGuide.heading')
              .split('\n')
              .map((line, index, lines) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('account.passportGuide.description')}
          </p>
        </section>

        <section className="rounded-2xl bg-secondary p-5 space-y-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Camera className="h-5 w-5" strokeWidth={2.4} />
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
            <p className="font-medium">{t('account.passportGuide.warningTitle')}</p>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {t('account.passportGuide.warningDescription')}
          </p>
        </section>
      </div>
    </AccountMobileLayout>
  )
}



