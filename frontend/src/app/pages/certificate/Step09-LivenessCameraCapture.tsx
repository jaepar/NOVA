import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanFace } from 'lucide-react'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { CameraCapturePage } from '../../components/camera/CameraCapturePage'

export function LivenessCameraCapture() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch {
        // 권한 거부 시에도 기본 화면 구조는 유지
      }
    }

    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  return (
    <CameraCapturePage
      title="비대면 실명확인"
      onClose={() => navigate('/certificate/step-08', { state: { preserveStep08State: true } })}
      bottomContent={
        <Btn_1Col onClick={() => navigate('/certificate/step-10')}>동의하고 촬영하기</Btn_1Col>
      }
      bottomBackgroundColor="#000000"
    >
      <div className="space-y-6 pb-6">
        <h2 className="text-2xl font-semibold leading-tight text-center">
          본인 확인을 위해
          <br />
          얼굴을 촬영해 주세요
        </h2>

        <div className="flex justify-center">
          <div className="relative w-[320px] h-[320px] rounded-full border-4 border-blue-500/90 overflow-hidden">
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-0 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ScanFace className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-lg">정면을 바라봐 주세요</p>
          </div>
          <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ScanFace className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-lg">입을 다물어 주세요</p>
          </div>
          <div className="px-4 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ScanFace className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-lg">천천히 고개를 좌우로 돌려 주세요</p>
          </div>
        </div>
      </div>
    </CameraCapturePage>
  )
}
