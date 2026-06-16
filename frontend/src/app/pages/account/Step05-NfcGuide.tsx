import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountMobileLayout } from './components/AccountMobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { InlineBanner } from '../../components/design-system/InlineBanner'
import { useTranslation } from '../../i18n'
import { useLivenessFlowStore, useStep5PassportCaptureStore } from '../../stores/pageStores'

type ParsedNfcRecord = {
  recordType: string
  mediaType?: string
  id?: string
  encoding?: string
  lang?: string
  data?: string
}

type PassportLikeData = {
  type: string
  issueCountry: string
  num: string
  surName: string
  givenName: string
  nationlity: string
  birthDate: string
  sex: string
  authority: string
  issueDate: string
  expireDate: string
}

const comparisonFields: Array<{ key: keyof PassportLikeData; labelKey: string }> = [
  { key: 'type', labelKey: 'account.passportCapture.labels.type' },
  { key: 'issueCountry', labelKey: 'account.passportCapture.labels.issueCountry' },
  { key: 'num', labelKey: 'account.passportCapture.labels.passportNumber' },
  { key: 'surName', labelKey: 'account.passportCapture.labels.surname' },
  { key: 'givenName', labelKey: 'account.passportCapture.labels.givenName' },
  { key: 'nationlity', labelKey: 'account.passportCapture.labels.nationality' },
  { key: 'birthDate', labelKey: 'account.passportCapture.labels.birthDate' },
  { key: 'sex', labelKey: 'account.passportCapture.labels.sex' },
  { key: 'authority', labelKey: 'account.passportCapture.labels.authority' },
  { key: 'issueDate', labelKey: 'account.passportCapture.labels.issueDate' },
  { key: 'expireDate', labelKey: 'account.passportCapture.labels.expiryDate' },
]

function comparePassportData(step05Data: PassportLikeData, nfcData: PassportLikeData) {
  const mismatches = comparisonFields.filter(({ key }) => {
    return step05Data[key] !== nfcData[key]
  })

  return {
    isMatch: mismatches.length === 0,
    mismatchLabelKeys: mismatches.map((item) => item.labelKey),
  }
}

function parseNdefRecords(event: NDEFReadingEvent): ParsedNfcRecord[] {
  const decoder = new TextDecoder()

  return event.message.records.map((record) => {
    let parsedData = ''

    if (record.recordType === 'text') {
      parsedData = record.data ? decoder.decode(record.data) : ''
    } else if (record.recordType === 'url') {
      parsedData = record.data ? decoder.decode(record.data) : ''
    } else {
      parsedData = record.data ? decoder.decode(record.data) : ''
    }

    return {
      recordType: record.recordType,
      mediaType: record.mediaType,
      id: record.id,
      encoding: (record as { encoding?: string }).encoding,
      lang: (record as { lang?: string }).lang,
      data: parsedData,
    }
  })
}

export function NfcGuide() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const parsedPassportData = useStep5PassportCaptureStore((state) => state.parsedPassportData)
  const setParsedPassportData = useStep5PassportCaptureStore((state) => state.setParsedPassportData)
  const setRegisteredPassportIdentity = useLivenessFlowStore(
    (state) => state.setRegisteredPassportIdentity
  )
  const [isScanning, setIsScanning] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusVariant, setStatusVariant] = useState<'error' | 'success' | 'info' | 'warning'>('info')

  const handleStartNfcTagging = async () => {
    if (isScanning) return
    if (!parsedPassportData) {
      setStatusVariant('warning')
      setStatusMessage(t('account.nfc.missingPassport'))
      return
    }

    if (!('NDEFReader' in window)) {
      setStatusVariant('warning')
      setStatusMessage(t('account.nfc.unsupported'))
      console.warn('[NFC] Web NFC is not supported in this browser.')
      return
    }

    setIsScanning(true)
    setStatusVariant('info')
    setStatusMessage(t('account.nfc.waiting'))

    try {
      const reader = new NDEFReader()

      const readEvent = await new Promise<NDEFReadingEvent>((resolve, reject) => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null
        let settled = false

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId)
          reader.onreading = null
          reader.onreadingerror = null
        }

        timeoutId = setTimeout(() => {
          if (settled) return
          settled = true
          cleanup()
          reject(new Error('NFC_TIMEOUT'))
        }, 10000)

        reader.onreading = (event) => {
          if (settled) return
          settled = true
          cleanup()
          resolve(event)
        }

        reader.onreadingerror = () => {
          if (settled) return
          settled = true
          cleanup()
          reject(new Error('NFC_READ_ERROR'))
        }

        reader.scan().catch((error) => {
          if (settled) return
          settled = true
          cleanup()
          reject(error)
        })
      })

      const parsedRecords = parseNdefRecords(readEvent)
      const firstJsonRecord = parsedRecords.find((record) => {
        if (!record.data) return false
        const trimmed = record.data.trim()
        return trimmed.startsWith('{') && trimmed.endsWith('}')
      })

      if (!firstJsonRecord?.data) {
        setStatusVariant('warning')
        setStatusMessage(t('account.nfc.jsonMissing'))
        return
      }

      let parsedNfcData: PassportLikeData
      try {
        parsedNfcData = JSON.parse(firstJsonRecord.data) as PassportLikeData
      } catch {
        setStatusVariant('warning')
        setStatusMessage(t('account.nfc.jsonParseFailed'))
        return
      }

      const compareResult = comparePassportData(parsedPassportData, parsedNfcData)

      if (!compareResult.isMatch) {
        setStatusVariant('error')
        setStatusMessage(t('account.nfc.mismatch'))
        return
      }

      setRegisteredPassportIdentity(
        parsedPassportData.issueCountry,
        parsedPassportData.num
      )
      // 인증 성공 직전에만 인증 비교용 데이터를 폐기
      setParsedPassportData(null)
      setStatusVariant('success')
      setStatusMessage(t('account.nfc.success'))
      navigate('/account/step-06')
    } catch (error) {
      setStatusVariant('warning')
      if (error instanceof Error && error.message === 'NFC_TIMEOUT') {
        setStatusMessage(t('account.nfc.timeout'))
      } else if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setStatusMessage(t('account.nfc.permissionRequired'))
      } else {
        setStatusMessage(t('account.nfc.failed'))
      }
      console.error('[NFC] read failed', error)
    } finally {
      setIsScanning(false)
    }
  }

  // [TEST ONLY START] 인증/비교와 무관하게 다음 단계 이동하는 임시 버튼
  const handleSkipForTest = () => {
    setStatusVariant('info')
    setStatusMessage(t('account.nfc.testSkipped'))
    navigate('/account/step-06')
  }
  // [TEST ONLY END]

  return (
    <AccountMobileLayout
      title={t('account.identityTitle')}
      titleKey="account.identityTitle"
      backPath="/account/step-03"
      bottomContent={
        <div className="space-y-2">
          <Btn_1Col onClick={handleStartNfcTagging} disabled={isScanning}>
            {isScanning ? t('account.nfc.scanning') : t('account.nfc.start')}
          </Btn_1Col>
          <Btn_1Col variant="outline" onClick={handleSkipForTest} disabled={isScanning}>
            {t('account.nfc.skipTest')}
          </Btn_1Col>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">
            {t('account.nfc.heading')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('account.nfc.description')}</p>
        </section>

        <section className="rounded-2xl bg-secondary p-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-background min-h-[280px] flex items-center justify-center text-center px-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('account.nfc.imageArea')}
                <br />
                {t('account.nfc.recommendedSize')}
                <br />
                {t('account.nfc.ratio')}
              </p>
            </div>
            <p className="text-sm text-center text-foreground/90">
              {t('account.nfc.instruction')}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-secondary p-4">
          <ul className="text-sm text-foreground/90 space-y-2 list-disc pl-5">
            <li>{t('account.nfc.guide1')}</li>
            <li>{t('account.nfc.guide2')}</li>
          </ul>
        </section>

        {statusMessage ? <InlineBanner message={statusMessage} variant={statusVariant} /> : null}
      </div>
    </AccountMobileLayout>
  )
}



