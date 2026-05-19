import { spacing } from './tokens';

interface Btn1ColProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export function Btn_1Col({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}: Btn1ColProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-blue-700 border-2 border-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-accent border-2 border-secondary',
    outline: 'bg-background border-2 border-primary text-primary hover:bg-blue-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 px-6 rounded-xl transition-all ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
