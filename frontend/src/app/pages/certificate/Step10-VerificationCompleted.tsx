import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { certificateApi, getCertificateApiError } from '../../../api'
import { novaToast } from '../../components/design-system'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { translateError, useTranslation } from '../../i18n'
import { useStep3PageStore } from '../../stores/pageStores'

export function VerificationCompleted() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const documents = useStep3PageStore((state) => state.documents)
  const resetDocuments = useStep3PageStore((state) => state.reset)

  const completedItems = [
    t('certificate.completedItem1'),
    t('certificate.completedItem2'),
    t('certificate.completedItem3'),
    t('certificate.completedItem4'),
  ]

  const handleFinalSubmit = async () => {
    if (isSubmitting) {
      return
    }

    const registrationApplicationFile =
      documents.find((document) => document.id === 'registration-application')?.file ?? undefined
    const residenceProofFile =
      documents.find((document) => document.id === 'residence-proof')?.file ?? undefined

    if (!registrationApplicationFile || !residenceProofFile) {
      novaToast.error(t('certificate.step03Description'))
      navigate('/certificate/step-03')
      return
    }

    try {
      setIsSubmitting(true)
      await certificateApi.requestIssuance({
        residenceVerificationPdf: residenceProofFile,
        alienRegistrationApplicationPdf: registrationApplicationFile,
      })
      resetDocuments()
      navigate('/certificate/step-11')
    } catch (error) {
      const apiError = getCertificateApiError(error)
      novaToast.error(
        translateError(apiError?.code, apiError?.message || t('certificate.correctionSubmitFailed'))
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MobileLayout
      title={t('certificate.title')}
      backPath="/certificate/step-08"
      bottomContent={
        <Btn_1Col onClick={handleFinalSubmit} disabled={isSubmitting}>
          {isSubmitting ? t('certificate.submitting') : t('certificate.finalSubmit')}
        </Btn_1Col>
      }
    >
      <div className="space-y-8 pb-2">
        <section className="pt-8">
          <h2 className="text-2xl leading-tight font-semibold text-center">
            {t('certificate.step10HeadingLine1')}
            <br />
            {t('certificate.step10HeadingLine2')}
          </h2>
        </section>

        <section className="rounded-3xl border border-border bg-background p-4">
          <div className="divide-y divide-border">
            {completedItems.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between py-4 first:pt-2 last:pb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Check className="w-5 h-5" />
                  </div>
                  <p>{item}</p>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-primary-soft text-primary text-sm font-medium">
                  {t('certificate.completedBadge')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MobileLayout>
  )
}
