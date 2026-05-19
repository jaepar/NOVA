import { useNavigate } from "react-router-dom";
import { MobileLayout } from '../components/layout/MobileLayout';
import { Btn_1Col } from '../components/design-system/Btn_1Col';

export function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 로그인 로직 구현 예정
    console.log('로그인 처리');
  };

  return (
    <MobileLayout
      title="로그인"
      bottomContent={
        <Btn_1Col onClick={handleLogin}>
          일반 로그인
        </Btn_1Col>
      }
    >
      <div className="flex flex-col h-full">
        {/* 상단 텍스트 */}
        <div className=" pb-4">
          <h2>반가워요!</h2>
          <p className="text-muted-foreground mt-2">
            로그인을 진행해주세요
          </p>
        </div>

        {/* 중간 빈 공간 (일러스트레이션 영역) */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-64 bg-secondary/30 rounded-2xl flex items-center justify-center">
            <p className="text-muted-foreground text-sm">일러스트레이션 영역</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
