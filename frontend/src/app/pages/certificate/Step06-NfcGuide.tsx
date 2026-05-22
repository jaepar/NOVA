import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'

type ParsedNfcRecord = {
  recordType: string
  mediaType?: string
  id?: string
  encoding?: string
  lang?: string
  data?: string
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
  const [isScanning, setIsScanning] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const nfcUnsupportedMessage = useMemo(() => {
    return '이 기기/브라우저에서는 Web NFC를 지원하지 않습니다.'
  }, [])

  const handleStartNfcTagging = async () => {
    if (isScanning) return

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
      console.log('[NFC] read success', {
        serialNumber: readEvent.serialNumber,
        records: parsedRecords,
      })
      alert(
        `NFC 인식 성공\nserialNumber: ${readEvent.serialNumber ?? 'N/A'}\nrecords: ${JSON.stringify(parsedRecords, null, 2)}`
      )

      setStatusMessage('NFC 인식에 성공했어요. 다음 단계로 이동합니다.')
      navigate('/certificate/step-07')
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

  return (
    <MobileLayout
      title="비대면 실명확인"
      backPath="/certificate/step-05"
      bottomContent={
        <Btn_1Col onClick={handleStartNfcTagging} disabled={isScanning}>
          {isScanning ? 'NFC 태깅 중...' : 'NFC 태깅 시작'}
        </Btn_1Col>
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

        {statusMessage ? (
          <p className="text-sm text-center text-muted-foreground">{statusMessage}</p>
        ) : null}
      </div>
    </MobileLayout>
  )
}
