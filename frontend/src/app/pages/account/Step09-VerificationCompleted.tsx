import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { AccountMobileLayout } from './components/AccountMobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { useTranslation } from '../../i18n'

const completedItems = [
  'account.verificationCompleted.document',
  'account.verificationCompleted.ocr',
  'account.verificationCompleted.nfc',
  'account.verificationCompleted.liveness',
] as const

export function VerificationCompleted() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <AccountMobileLayout
      title={t('account.identityTitle')}
      titleKey="account.identityTitle"
      backPath="/account/step-07"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/account/step-10')}>
          {t('account.verificationCompleted.submit')}
        </Btn_1Col>
      }
    >
      <div className="space-y-8 pb-2">
        <section className="pt-8">
          <h2 className="text-2xl leading-tight font-semibold text-center">
            {t('account.verificationCompleted.heading')
              .split('\n')
              .map((line, index, lines) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < lines.length - 1 && <br />}
                </span>
              ))}
          </h2>
        </section>

        <section className="rounded-3xl border border-border bg-background p-4">
          <div className="divide-y divide-border">
            {completedItems.map((itemKey) => (
              <div
                key={itemKey}
                className="flex items-center justify-between py-4 first:pt-2 last:pb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Check className="w-5 h-5" />
                  </div>
                  <p>{t(itemKey)}</p>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-primary-soft text-primary text-sm font-medium">
                  {t('account.verificationCompleted.completed')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AccountMobileLayout>
  )
}
