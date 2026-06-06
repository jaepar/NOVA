import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { certificateApi, getCertificateApiError, type IdCardOcrResult } from '../../../api'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { InlineBanner } from '../../components/design-system/InlineBanner'
import { CameraCapturePage } from '../../components/camera/CameraCapturePage'
import { useForeignerCardRegistrationStore } from '../../stores/pageStores'

const tempOcrValues = {
  name: 'HONG SPECIMEN',
  registrationNumber: '123456-1234567',
  issueDate: '2018. 04. 01.',
}

function isIdCardOcrResult(result: unknown): result is IdCardOcrResult {
  if (!result || typeof result !== 'object') {
    return false
  }

  return 'name' in result || 'residentRegistrationNumber' in result || 'issueDate' in result
}

function getOcrErrorMessage(error: unknown) {
  const apiError = getCertificateApiError(error)

  switch (apiError?.code) {
    case 'USER-009':
      return '외국인등록증 이미지를 다시 촬영해 주세요.'
    case 'USER-015':
    case 'USER-017':
      return '사진이 올바르지 않습니다. 외국인등록증을 다시 촬영해 주세요.'
    case 'USER-016':
      return '인식에 실패했습니다. 등록증 위치와 조명을 확인해 주세요.'
    case 'USER-018':
      return '등록증 이름이 사용자 정보와 일치하지 않습니다.'
    case 'USER-020':
      return '정부 DB의 신원 정보와 일치하지 않습니다. 정보를 확인해 주세요.'
    case 'USER-021':
      return '정부 DB 통신에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    default:
      return apiError?.message || 'OCR 처리 중 오류가 발생했습니다. 다시 촬영해 주세요.'
  }
}

export function ForeignerCardCameraCapture() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const cameraError = useForeignerCardRegistrationStore((state) => state.cameraError)
  const setCapturedImage = useForeignerCardRegistrationStore((state) => state.setCapturedImage)
  const setCameraError = useForeignerCardRegistrationStore((state) => state.setCameraError)
  const setOcrValues = useForeignerCardRegistrationStore((state) => state.setOcrValues)
  const setVerificationResult = useForeignerCardRegistrationStore(
    (state) => state.setVerificationResult,
  )
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  useEffect(() => {
    let isMounted = true

    async function startCamera() {
      try {
        setCameraError(null)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch {
        setCameraError('카메라를 사용할 수 없습니다. 권한을 확인해 주세요.')
      }
    }

    startCamera()

    return () => {
      isMounted = false
      stopCamera()
    }
  }, [setCameraError])

  const processImageForOcr = async (imageFile: File, imageDataUrl: string) => {
    setOcrError(null)
    setIsOcrProcessing(true)

    try {
      const verification = await certificateApi.recognizeIdCard(imageFile)
      const result = isIdCardOcrResult(verification.result) ? verification.result : null

      setCapturedImage(imageDataUrl)
      setOcrValues({
        name: result?.name ?? '',
        registrationNumber: result?.residentRegistrationNumber ?? '',
        issueDate: result?.issueDate ?? '',
      })
      setVerificationResult(verification.verificationStatus, verification.failureReasonCode)
      stopCamera()
      navigate('/foreigner-card/step-04')
    } catch (error) {
      setOcrError(getOcrErrorMessage(error))
    } finally {
      setIsOcrProcessing(false)
    }
  }

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92)
    const blob = await (await fetch(imageDataUrl)).blob()
    const imageFile = new File([blob], 'foreigner-card-capture.jpg', {
      type: 'image/jpeg',
    })

    await processImageForOcr(imageFile, imageDataUrl)
  }

  const handleOpenReviewWithTempData = () => {
    setCapturedImage(null)
    setOcrValues(tempOcrValues)
    setVerificationResult('VERIFIED', null)
    stopCamera()
    navigate('/foreigner-card/step-04')
  }

  return (
    <CameraCapturePage
      title="외국인등록증"
      onClose={() => navigate('/foreigner-card/step-02')}
      bottomContent={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs text-white">
            <ShieldCheck className="h-4 w-4" />
            <p>빛 반사가 없도록 주의해 주세요.</p>
          </div>
          <Btn_1Col onClick={handleCapture} disabled={isOcrProcessing}>
            촬영하기
          </Btn_1Col>
          <Btn_1Col
            onClick={handleOpenReviewWithTempData}
            variant="outline"
            disabled={isOcrProcessing}
          >
            더미 파싱 결과 보기 (임시)
          </Btn_1Col>
        </div>
      }
    >
      <section className="space-y-5 pt-8 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">외국인 등록증 촬영</h2>
          <p className="text-sm leading-relaxed text-white/70">
            영역 안에 <span className="text-primary">외국인 등록증</span>이 꽉 차도록 배치 후
            <br />
            하단의 버튼을 누르면 촬영됩니다
          </p>
        </div>

        <div className="relative h-[32vh] overflow-hidden rounded-xl border border-dashed border-white/60 bg-white/10">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-4 rounded-lg border border-dashed border-white/60" />
        </div>
      </section>

      <canvas ref={canvasRef} className="hidden" />

      {cameraError && <InlineBanner message={cameraError} variant="error" className="mt-4" />}
      {ocrError && <InlineBanner message={ocrError} variant="error" className="mt-4" />}
      {isOcrProcessing && (
        <div className="mt-4 rounded-xl border border-white/20 bg-white/10 p-3 text-center text-sm text-white">
          OCR 분석 중입니다. 잠시만 기다려 주세요.
        </div>
      )}
    </CameraCapturePage>
  )
}
