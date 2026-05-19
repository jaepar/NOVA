import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { MobileLayout } from '../components/layout/MobileLayout';
import { Btn_2Col } from '../components/design-system/Btn_2Col';
import { Check } from 'lucide-react';

const options = [
  { id: 1, title: 'Beginner', description: 'Just getting started' },
  { id: 2, title: 'Intermediate', description: 'Some experience' },
  { id: 3, title: 'Advanced', description: 'Experienced user' },
  { id: 4, title: 'Expert', description: 'Professional level' },
];

export function Step2() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <MobileLayout
      title="Experience Level"
      bottomContent={
        <Btn_2Col
          leftLabel="Back"
          rightLabel="Continue"
          onLeftClick={() => navigate(-1)}
          onRightClick={() => navigate('/step-3')}
        />
      }
    >
      <div className="space-y-6 ">
        <div className="space-y-2">
          <h2>Select your level</h2>
          <p className="text-muted-foreground">
            Choose the option that best describes your experience.
          </p>
        </div>

        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selected === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{option.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </div>
                {selected === option.id && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Additional scroll content */}
        <div className="space-y-4 ">
          <h3>What this means</h3>
          <p className="text-muted-foreground">
            Your experience level helps us customize the interface and content to match your needs.
            You can always change this later in your settings.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
