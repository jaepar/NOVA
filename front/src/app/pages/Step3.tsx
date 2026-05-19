import { useNavigate } from "react-router-dom";
import { MobileLayout } from '../components/layout/MobileLayout';
import { Btn_1Col } from '../components/design-system/Btn_1Col';
import { CheckCircle2 } from 'lucide-react';

export function Step3() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="All Set!"
      bottomContent={
        <Btn_1Col onClick={() => navigate('/product')}>
          Explore Product
        </Btn_1Col>
      }
    >
      <div className="flex flex-col items-center gap-6 text-center pt-12">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>

        <div className="space-y-3">
          <h2>Setup Complete!</h2>
          <p className="text-muted-foreground">
            You're all set to start using the app. Let's explore what you can do.
          </p>
        </div>

        <div className="w-full space-y-3 ">
          <div className="bg-secondary p-4 rounded-xl">
            <h4 className="mb-2">✓ Profile Created</h4>
            <p className="text-sm text-muted-foreground">
              Your account is ready to use
            </p>
          </div>

          <div className="bg-secondary p-4 rounded-xl">
            <h4 className="mb-2">✓ Preferences Set</h4>
            <p className="text-sm text-muted-foreground">
              We've customized your experience
            </p>
          </div>

          <div className="bg-secondary p-4 rounded-xl">
            <h4 className="mb-2">✓ Ready to Go</h4>
            <p className="text-sm text-muted-foreground">
              Start exploring features now
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
