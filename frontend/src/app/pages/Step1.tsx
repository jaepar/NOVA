import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { MobileLayout } from '../components/layout/MobileLayout';
import { CommonInputGroup } from '../components/design-system/CommonInputGroup';
import { Btn_1Col } from '../components/design-system/Btn_1Col';

export function Step1() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    navigate('/step-2');
  };

  return (
    <MobileLayout
      title="Personal Info"
      bottomContent={
        <Btn_1Col
          onClick={handleNext}
          disabled={!name || !email}
        >
          Continue
        </Btn_1Col>
      }
    >
      <div className="space-y-6 ">
        <div className="space-y-2">
          <h2>Tell us about yourself</h2>
          <p className="text-muted-foreground">
            We need some basic information to get started.
          </p>
        </div>

        <div className="space-y-4">
          <CommonInputGroup
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChange={setName}
          />

          <CommonInputGroup
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={setEmail}
          />
        </div>

        <div className="bg-accent p-4 rounded-xl">
          <p className="text-sm text-muted-foreground">
            Your information is securely stored and never shared with third parties.
          </p>
        </div>

        <div className="space-y-4 ">
          <h3>Why we need this</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>We collect your personal information to:</p>
            <ul className="space-y-2 pl-5 list-disc">
              <li>Personalize your experience</li>
              <li>Send important notifications</li>
              <li>Verify your identity</li>
              <li>Improve our services</li>
            </ul>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
