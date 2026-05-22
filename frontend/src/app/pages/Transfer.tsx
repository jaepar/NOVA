import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'

export function Transfer() {
  return (
    <>
      <MobileLayout title="송금" headerType="close" closePath="/main">
        <div className="flex items-center justify-center pt-24 w-full">
          <div className="text-center space-y-4">
            <h2>송금 페이지</h2>
            <p className="text-muted-foreground">준비중입니다</p>
          </div>
        </div>
      </MobileLayout>
      <BottomNav />
    </>
  )
}
