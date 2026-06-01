import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { InlineBanner } from '../../components/design-system/InlineBanner'
import { useStep5PassportCaptureStore } from '../../stores/pageStores'

type ParsedNfcRecord = {
  recordType: string
  mediaType?: string
  id?: string
  encoding?: string
  lang?: string
  data?: string
}

type PassportLikeData = {
  docType: string
  nationalityCode: string
  passportNumber: string
  surname: string
  givenNames: string
  birthDate: string
  sex: string
  country: string
  issuingCountryCode: string
  authority: string
  issueDate: string
  expiryDate: string
}

const comparisonFields: Array<{ key: keyof PassportLikeData; label: string }> = [
  { key: 'docType', label: '종류' },
  { key: 'nationalityCode', label: '국가 코드' },
  { key: 'passportNumber', label: '여권번호' },
  { key: 'surname', label: '성' },
  { key: 'givenNames', label: '이름' },
  { key: 'birthDate', label: '생년월일' },
  { key: 'sex', label: '성별' },
  { key: 'country', label: '국적' },
  { key: 'issuingCountryCode', label: '발행국 코드' },
  { key: 'authority', label: '발행 관청' },
  { key: 'issueDate', label: '발급일' },
  { key: 'expiryDate', label: '기간만료일' },
]

function normalizeValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase()
}

function normalizeDate(value: string): string {
  return normalizeValue(value).replace(/[-/]/g, '.')
}

function comparePassportData(step05Data: PassportLikeData, nfcData: PassportLikeData) {
  const mismatches = comparisonFields.filter(({ key }) => {
    const left =
      key === 'birthDate' || key === 'issueDate' || key === 'expiryDate'
        ? normalizeDate(step05Data[key])
        : normalizeValue(step05Data[key])
    const right =
      key === 'birthDate' || key === 'issueDate' || key === 'expiryDate'
        ? normalizeDate(nfcData[key])
        : normalizeValue(nfcData[key])
    return left !== right
  })

  return {
    isMatch: mismatches.length === 0,
    mismatchLabels: mismatches.map((item) => item.label),
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
  const parsedPassportData = useStep5PassportCaptureStore((state) => state.parsedPassportData)
  const setParsedPassportData = useStep5PassportCaptureStore((state) => state.setParsedPassportData)
  const [isScanning, setIsScanning] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [isMismatchFailure, setIsMismatchFailure] = useState(false)
  const statusVariant = isMismatchFailure
    ? 'error'
    : statusMessage.includes('성공')
      ? 'success'
      : statusMessage.includes('기다리는 중') || statusMessage.includes('테스트 우회')
        ? 'info'
        : statusMessage
          ? 'warning'
          : 'info'

  const nfcUnsupportedMessage = useMemo(() => {
    return '이 기기/브라우저에서는 Web NFC를 지원하지 않습니다.'
  }, [])

  const handleStartNfcTagging = async () => {
    if (isScanning) return
    setIsMismatchFailure(false)
    if (!parsedPassportData) {
      setStatusMessage('Step05 여권 정보가 없습니다. 이전 단계에서 다시 진행해 주세요.')
      return
    }

    if (!('NDEFReader' in window)) {
      setStatusMessage(nfcUnsupportedMessage)
      console.warn('[NFC] Web NFC is not supported in this browser.')
      return
    }

    setIsScanning(true)
    setStatusMessage('NFC 태깅을 기다리는 중입니다. (최대 10초)')

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
        setStatusMessage('NFC 데이터에서 JSON 형식을 찾지 못했어요.')
        return
      }

      let parsedNfcData: PassportLikeData
      try {
        parsedNfcData = JSON.parse(firstJsonRecord.data) as PassportLikeData
      } catch {
        setStatusMessage('NFC JSON 파싱에 실패했어요. 저장 포맷을 확인해 주세요.')
        return
      }

      const compareResult = comparePassportData(parsedPassportData, parsedNfcData)

      if (!compareResult.isMatch) {
        setIsMismatchFailure(true)
        setStatusMessage('인증 정보가 일치하지 않습니다.')
        return
      }

      // 인증 성공 직전에만 인증 비교용 데이터를 폐기
      setParsedPassportData(null)
      setStatusMessage('NFC 인식 및 정보 비교에 성공했어요. 다음 단계로 이동합니다.')
      navigate('/account/step-06')
    } catch (error) {
      if (error instanceof Error && error.message === 'NFC_TIMEOUT') {
        setStatusMessage('10초 안에 NFC를 인식하지 못했어요. 다시 시도해 주세요.')
      } else if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setStatusMessage('NFC 권한이 필요합니다. 브라우저 권한을 허용해 주세요.')
      } else {
        setStatusMessage('NFC 인식에 실패했어요. 다시 시도해 주세요.')
      }
      console.error('[NFC] read failed', error)
    } finally {
      setIsScanning(false)
    }
  }

  // [TEST ONLY START] 인증/비교와 무관하게 다음 단계 이동하는 임시 버튼
  const handleSkipForTest = () => {
    setIsMismatchFailure(false)
    setStatusMessage('테스트 우회: 인증/비교 없이 다음 단계로 이동합니다.')
    navigate('/account/step-06')
  }
  // [TEST ONLY END]

  return (
    <MobileLayout
      title="비대면 실명확인"
      backPath="/account/step-04"
      bottomContent={
        <div className="space-y-2">
          <Btn_1Col onClick={handleStartNfcTagging} disabled={isScanning}>
            {isScanning ? 'NFC 태깅 중...' : 'NFC 태깅 시작'}
          </Btn_1Col>
          <Btn_1Col variant="outline" onClick={handleSkipForTest} disabled={isScanning}>
            인증 없이 다음으로 (테스트)
          </Btn_1Col>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        <section className="space-y-1">
          <h2 className="text-2xl font-semibold leading-tight">여권 NFC 태깅을 수행해 주세요</h2>
          <p className="text-sm text-muted-foreground">전자여권(e-Passport) 대상</p>
        </section>

        <section className="rounded-2xl bg-secondary p-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-border bg-background min-h-[280px] flex items-center justify-center text-center px-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                이미지 자리 영역
                <br />
                권장 규격: 280 x 220 (px)
                <br />
                비율: 14 : 11
              </p>
            </div>
            <p className="text-sm text-center text-foreground/90">
              휴대폰 뒷면을 여권 칩에 가까이 대주세요
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-secondary p-4">
          <ul className="text-sm text-foreground/90 space-y-2 list-disc pl-5">
            <li>NFC 기능이 켜져 있는지 확인해 주세요.</li>
            <li>여권을 움직이지 않고 가만히 대주세요.</li>
          </ul>
        </section>

        {statusMessage ? <InlineBanner message={statusMessage} variant={statusVariant} /> : null}
      </div>
    </MobileLayout>
  )
}



