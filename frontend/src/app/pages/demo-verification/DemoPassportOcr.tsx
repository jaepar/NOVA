import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  Flag,
  Globe,
  IdCard,
  Landmark,
  ShieldCheck,
  User,
  WholeWord,
} from 'lucide-react'
import { createWorker, OEM, PSM } from 'tesseract.js'
import { CameraCapturePage } from '../../components/camera/CameraCapturePage'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { Btn_2Col } from '../../components/design-system/Btn_2Col'
import { InlineBanner } from '../../components/design-system/InlineBanner'
import { MobileLayout } from '../../components/layout/MobileLayout'
import { useTranslation } from '../../i18n'
import { DemoVerificationProgress } from './DemoVerificationProgress'

type PassportValues = {
  type: string
  countryCode: string
  passportNum: string
  surName: string
  givenName: string
  birthDate: string
  sex: string
  nationality: string
  authority: string
  issueDate: string
  expireDate: string
}

const emptyPassportValues: PassportValues = {
  type: '',
  countryCode: '',
  passportNum: '',
  surName: '',
  givenName: '',
  birthDate: '',
  sex: '',
  nationality: '',
  authority: '',
  issueDate: '',
  expireDate: '',
}

const stripFillers = (value: string) => value.replace(/</g, '').trim()

const formatMrzDate = (value: string, expiry = false) => {
  if (!/^\d{6}$/.test(value)) return ''
  const year = Number(value.slice(0, 2))
  const fullYear = expiry ? 2000 + year : year > new Date().getFullYear() % 100 ? 1900 + year : 2000 + year
  return `${fullYear}.${value.slice(2, 4)}.${value.slice(4, 6)}`
}

const calculateIssueDate = (expiryDate: string) => {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(expiryDate)
  if (!match) return ''
  return `${Number(match[1]) - 10}.${match[2]}.${match[3]}`
}

const parsePassportMrz = (rawText: string): PassportValues | null => {
  const candidates = rawText
    .toUpperCase()
    .split(/\r?\n/)
    .map((line) => line.replace(/\s/g, '').replace(/[^A-Z0-9<]/g, ''))
    .filter((line) => line.length >= 30)

  const firstLineIndex = candidates.findIndex((line) => line.startsWith('P<'))
  const firstLine = firstLineIndex >= 0 ? candidates[firstLineIndex] : candidates.at(-2)
  const secondLine = firstLineIndex >= 0 ? candidates[firstLineIndex + 1] : candidates.at(-1)
  if (!firstLine || !secondLine || firstLine.length < 30 || secondLine.length < 27) return null

  const [surname = '', givenNames = ''] = firstLine.slice(5).split('<<')
  const expireDate = formatMrzDate(secondLine.slice(21, 27), true)

  return {
    type: stripFillers(firstLine.slice(0, 2)) || 'P',
    countryCode: stripFillers(firstLine.slice(2, 5)),
    passportNum: stripFillers(secondLine.slice(0, 9)),
    surName: stripFillers(surname).replace(/<+/g, ' '),
    givenName: stripFillers(givenNames).replace(/<+/g, ' '),
    birthDate: formatMrzDate(secondLine.slice(13, 19)),
    sex: stripFillers(secondLine.slice(20, 21)) || 'X',
    nationality: stripFillers(secondLine.slice(10, 13)),
    authority: stripFillers(firstLine.slice(2, 5)),
    issueDate: calculateIssueDate(expireDate),
    expireDate,
  }
}

export function DemoPassportOcr() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [mode, setMode] = useState<'live' | 'review'>('live')
  const [cameraError, setCameraError] = useState('')
  const [ocrError, setOcrError] = useState('')
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [passportValues, setPassportValues] = useState<PassportValues>(emptyPassportValues)

  const ocrResultRows = useMemo(
    () => [
      { id: 'type', label: t('certificate.passportLabelType'), icon: IdCard },
      { id: 'countryCode', label: t('certificate.passportLabelCountryCode'), icon: Globe },
      { id: 'passportNum', label: t('certificate.passportLabelNumber'), icon: IdCard },
      { id: 'surName', label: t('certificate.passportLabelSurname'), icon: User },
      { id: 'givenName', label: t('certificate.passportLabelGivenName'), icon: WholeWord },
      { id: 'birthDate', label: t('certificate.passportLabelBirthDate'), icon: Calendar },
      { id: 'sex', label: t('certificate.passportLabelGender'), icon: User },
      { id: 'nationality', label: t('certificate.passportLabelNationality'), icon: Flag },
      { id: 'authority', label: t('certificate.passportLabelAuthority'), icon: Landmark },
      { id: 'issueDate', label: t('certificate.passportLabelIssueDate'), icon: CalendarDays },
      { id: 'expireDate', label: t('certificate.passportLabelExpiryDate'), icon: CalendarClock },
    ] as const,
    [t],
  )

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  useEffect(() => {
    if (mode !== 'live') return

    const startCamera = async () => {
      try {
        setCameraError('')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch {
        setCameraError(t('certificate.cameraError'))
      }
    }

    void startCamera()
    return stopCamera
  }, [mode, t])

  const handleCapture = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return

    setOcrError('')
    setIsOcrProcessing(true)
    setOcrProgress(0)

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const mrzCanvas = document.createElement('canvas')
    const cropTop = Math.floor(canvas.height * 0.52)
    const cropHeight = canvas.height - cropTop
    mrzCanvas.width = canvas.width * 2
    mrzCanvas.height = cropHeight * 2
    const mrzContext = mrzCanvas.getContext('2d')
    if (!mrzContext) return
    mrzContext.filter = 'grayscale(1) contrast(1.8)'
    mrzContext.drawImage(
      canvas,
      0,
      cropTop,
      canvas.width,
      cropHeight,
      0,
      0,
      mrzCanvas.width,
      mrzCanvas.height,
    )

    let worker: Awaited<ReturnType<typeof createWorker>> | null = null
    try {
      worker = await createWorker('eng', OEM.LSTM_ONLY, {
        logger: ({ progress }) => setOcrProgress(Math.round(progress * 100)),
      })
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
        preserve_interword_spaces: '1',
      })
      const result = await worker.recognize(mrzCanvas)
      const parsed = parsePassportMrz(result.data.text)
      if (!parsed) {
        setOcrError(t('demoVerification.ocrFailed'))
        return
      }

      stopCamera()
      setPassportValues(parsed)
      setMode('review')
    } catch {
      setOcrError(t('demoVerification.ocrFailed'))
    } finally {
      await worker?.terminate()
      setIsOcrProcessing(false)
    }
  }

  if (mode === 'review') {
    return (
      <MobileLayout
        title={t('certificate.title')}
        backPath="/demo/verification/passport-guide"
        bottomContent={
          <Btn_2Col
            leftLabel={t('certificate.retake')}
            rightLabel={t('common.next')}
            leftVariant="outline"
            rightVariant="primary"
            onLeftClick={() => {
              setPassportValues(emptyPassportValues)
              setMode('live')
            }}
            onRightClick={() => navigate('/demo/verification/nfc')}
          />
        }
      >
        <div className="space-y-4 pb-2">
          <DemoVerificationProgress currentStep={2} />
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold leading-tight">
              {t('certificate.passportReviewHeading')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('certificate.passportReviewSubheading')}
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border bg-background">
            {ocrResultRows.map((row) => {
              const Icon = row.icon
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-[minmax(0,46%)_minmax(0,1fr)] border-b border-border last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3 bg-secondary/20 px-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="min-w-0 break-words text-sm leading-snug">{row.label}</p>
                  </div>
                  <div className="flex min-w-0 items-center px-4 py-4">
                    <input
                      type="text"
                      value={passportValues[row.id]}
                      onChange={(event) =>
                        setPassportValues((current) => ({
                          ...current,
                          [row.id]: event.target.value,
                        }))
                      }
                      className="w-full min-w-0 rounded-md bg-background px-2 py-1 text-base outline-none ring-1 ring-transparent focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )
            })}
          </section>
        </div>
      </MobileLayout>
    )
  }

  return (
    <CameraCapturePage
      title={t('certificate.title')}
      onClose={() => navigate('/demo/verification')}
      headerBackgroundColor="#ffffff"
      headerTextColor="#000000"
      bottomBackgroundColor="#ffffff"
      contentBackgroundColor="#ffffff"
      contentTextColor="#000000"
      bottomContent={
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-black">
            <ShieldCheck className="h-4 w-4" />
            <p>{t('certificate.passportNoReflect')}</p>
          </div>
          <Btn_1Col onClick={() => void handleCapture()} disabled={isOcrProcessing}>
            {isOcrProcessing
              ? `${t('certificate.ocrProcessing')} ${ocrProgress}%`
              : t('certificate.captureButton')}
          </Btn_1Col>
        </div>
      }
    >
      <div className="space-y-5">
        <DemoVerificationProgress currentStep={2} />
        <div className="flex h-[58vh] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-secondary">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      {cameraError && <InlineBanner message={cameraError} variant="error" className="mt-4" />}
      {ocrError && <InlineBanner message={ocrError} variant="error" className="mt-4" />}
    </CameraCapturePage>
  )
}
