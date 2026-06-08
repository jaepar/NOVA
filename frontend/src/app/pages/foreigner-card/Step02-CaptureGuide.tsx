import { CalendarDays, IdCard, ScanLine, SunMedium, Type } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Btn_1Col } from '../../components/design-system/Btn_1Col'
import { MobileLayout } from '../../components/layout/MobileLayout'

const cautionItems = [
  {
    icon: SunMedium,
    text: '빛 반사가 없는 곳에서 촬영해 주세요',
  },
  {
    icon: Type,
    text: '글자가 선명하게 보여야 합니다',
  },
  {
    icon: CalendarDays,
    text: '유효기간이 지난 등록증은 사용할 수 없어요',
  },
]

export function ForeignerCardCaptureGuide() {
  const navigate = useNavigate()

  return (
    <MobileLayout
      title="외국인등록증 등록"
      backPath="/foreigner-card/step-01"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/foreigner-card/step-03')}>촬영하기</Btn_1Col>
      }
    >
      <div className="space-y-7 pb-2">
        <section className="space-y-3 pt-2">
          <h2 className="text-2xl font-semibold leading-tight">
            외국인 등록증을
            <br />
            <span className="text-primary">촬영</span>해 주세요.
          </h2>
        </section>

        <section className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 px-5 py-10">
          <div className="flex flex-col items-center justify-center gap-5 text-center">
            <div className="flex h-12 w-16 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-primary">
              <IdCard className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">등록증이 프레임 안에</p>
              <p className="text-sm text-muted-foreground">꽉 차도록 배치해 주세요</p>
            </div>
            <ScanLine className="h-5 w-5 text-primary/60" />
          </div>
        </section>

        <section className="space-y-3">
          <p className="font-semibold">주의사항</p>
          <div className="divide-y divide-border">
            {cautionItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.text} className="flex items-center gap-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </MobileLayout>
  )
}
