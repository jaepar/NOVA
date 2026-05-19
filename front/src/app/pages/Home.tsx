import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Btn_1Col } from "../components/design-system/Btn_1Col";

export function Home() {
  const navigate = useNavigate();

  return (
    <MobileLayout
      title="Welcome"
      showBackButton={false}
      bottomContent={
        <Btn_1Col onClick={() => navigate("/step-1")}>
          Get Started
        </Btn_1Col>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl">Mobile App Demo</h1>
          <p className="text-muted-foreground">
            iPhone 13 (390 x 844) Web View
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="bg-secondary p-4 rounded-2xl">
            <h3 className="mb-2">Features</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>✓ Design System Components</li>
              <li>✓ Fixed Header with Scroll</li>
              <li>✓ Floating Bottom Area</li>
              <li>✓ Bottom Sheet Component</li>
              <li>✓ React Router Integration</li>
              <li>✓ Background Blur Effects</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/design-system")}
              className="w-full p-4 bg-primary text-primary-foreground hover:bg-blue-700 rounded-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <span>Design System</span>
                <span>→</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/main")}
              className="w-full p-4 bg-accent hover:bg-secondary rounded-xl transition-colors border border-border"
            >
              <div className="flex items-center justify-between">
                <span>Main Page</span>
                <span className="text-primary">→</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/language")}
              className="w-full p-4 bg-accent hover:bg-secondary rounded-xl transition-colors border border-border"
            >
              <div className="flex items-center justify-between">
                <span>Language Selection</span>
                <span className="text-primary">→</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/landing")}
              className="w-full p-4 bg-accent hover:bg-secondary rounded-xl transition-colors border border-border"
            >
              <div className="flex items-center justify-between">
                <span>Landing Page</span>
                <span className="text-primary">→</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/transaction-history")}
              className="w-full p-4 bg-accent hover:bg-secondary rounded-xl transition-colors border border-border"
            >
              <div className="flex items-center justify-between">
                <span>Bottom Sheet Demo</span>
                <span className="text-primary">→</span>
              </div>
            </button>
          </div>

          <div className="bg-secondary p-4 rounded-2xl mt-6">
            <h3 className="mb-3">Common Pages</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/one-button-template")}
                className="w-full p-3 bg-background hover:bg-accent rounded-xl transition-colors border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">One Button Template</span>
                  <span className="text-primary text-sm">→</span>
                </div>
              </button>

              <button
                onClick={() => navigate("/two-button-template")}
                className="w-full p-3 bg-background hover:bg-accent rounded-xl transition-colors border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two Button Template</span>
                  <span className="text-primary text-sm">→</span>
                </div>
              </button>

              <button
                onClick={() => navigate("/loading")}
                className="w-full p-3 bg-background hover:bg-accent rounded-xl transition-colors border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Loading Page Demo</span>
                  <span className="text-primary text-sm">→</span>
                </div>
              </button>

              <button
                onClick={() => navigate("/failed")}
                className="w-full p-3 bg-background hover:bg-accent rounded-xl transition-colors border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed Page Demo</span>
                  <span className="text-primary text-sm">→</span>
                </div>
              </button>

              <button
                onClick={() => navigate("/success")}
                className="w-full p-3 bg-background hover:bg-accent rounded-xl transition-colors border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Page Demo</span>
                  <span className="text-primary text-sm">→</span>
                </div>
              </button>

              <button
                onClick={() => navigate("/close-button-template")}
                className="w-full p-3 bg-background hover:bg-accent rounded-xl transition-colors border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Close Button Template</span>
                  <span className="text-primary text-sm">→</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}