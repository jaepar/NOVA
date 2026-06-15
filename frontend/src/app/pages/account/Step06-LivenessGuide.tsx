import { useNavigate } from 'react-router-dom'
import { Camera, Lightbulb, ScanFace } from 'lucide-react'
import { AccountMobileLayout } from './components/AccountMobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'

const guideItems = [
  { key: 'account.livenessGuide.item1', icon: ScanFace },
  { key: 'account.livenessGuide.item2', icon: Lightbulb },
  { key: 'account.livenessGuide.item3', icon: Camera },
] as const

export function LivenessGuide() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <AccountMobileLayout
      title={t('account.identityTitle')}
      titleKey="account.identityTitle"
      backPath="/account/step-05"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/account/step-07')}>
          {t('account.livenessGuide.agreeAndCapture')}
        </Btn_1Col>
      }
    >
      <div className="space-y-5 pb-2">
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('account.livenessGuide.heading')
              .split('\n')
              .map((line, index, lines) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
          </h2>
        </section>

        <section className="rounded-2xl bg-secondary p-5">
          <div className="min-h-[300px] rounded-2xl border-2 border-dashed border-primary-light/30 px-6 flex flex-col items-center justify-center gap-4">
            <div className="h-1 w-24 rounded-full bg-primary-light/70" />
            <div className="h-40 w-40 rounded-full border-2 border-primary-light/60 flex items-center justify-center">
              <ScanFace className="h-16 w-16 text-primary-light" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('account.livenessGuide.guideArea')}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          {guideItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.key} className="flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-primary-soft text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed">{t(item.key)}</p>
              </div>
            )
          })}
        </section>
      </div>
    </AccountMobileLayout>
  )
}
