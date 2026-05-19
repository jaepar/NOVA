import { MobileLayout } from '../components/layout/MobileLayout';
import { BottomNav } from '../components/layout/BottomNav';

export function Exchange() {
  return (
    <>
      <MobileLayout title="환율" showBackButton={false}>
        <div className="flex items-center justify-center pt-24 w-full">
          <div className="text-center space-y-4">
            <div className="text-6xl">💱</div>
            <h2>환율 페이지</h2>
            <p className="text-muted-foreground">준비 중입니다</p>
          </div>
        </div>
      </MobileLayout>
      <BottomNav />
    </>
  );
}
