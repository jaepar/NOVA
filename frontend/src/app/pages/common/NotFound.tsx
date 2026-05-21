import { useNavigate } from "react-router-dom";
import { MobileLayout } from '../../components/layout/MobileLayout';
import { Btn_1Col } from '../../components/design-system/Btn_1Col';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="Page Not Found"
      headerType="close"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/')}>
          Go Home
        </Btn_1Col>
      }
    >
      <div className="flex flex-col items-center justify-center gap-6 text-center h-full">
        <div className="text-8xl">404</div>
        <div className="space-y-2">
          <h2>Oops! Page not found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}

