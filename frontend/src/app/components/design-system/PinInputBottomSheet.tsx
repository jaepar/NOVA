import { useState, useEffect } from "react";
import { BottomSheet } from "../layout/BottomSheet";
import { Delete } from "lucide-react";

interface PinInputBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  pinLength?: number;
  onComplete?: (pin: string) => void;
}

export function PinInputBottomSheet({
  isOpen,
  onClose,
  title = "계좌 비밀번호",
  pinLength = 4,
  onComplete,
}: PinInputBottomSheetProps) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPin("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (pin.length === pinLength && onComplete) {
      onComplete(pin);
    }
  }, [pin, pinLength, onComplete]);

  const handleNumberClick = (num: number) => {
    if (pin.length < pinLength) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      height="520px"
      disableScroll={true}
    >
      <div className="space-y-6 overflow-hidden">
        {/* Pin Dots */}
        <div className="flex justify-center gap-3 py-4">
          {Array.from({ length: pinLength }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                index < pin.length
                  ? "bg-primary border-primary"
                  : "bg-transparent border-border"
              }`}
            />
          ))}
        </div>

        {/* Number Pad */}
        <div className="space-y-3">
          {numbers.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-3 gap-3"
            >
              {row.map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="h-16 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
                >
                  <span className="text-2xl">{num}</span>
                </button>
              ))}
            </div>
          ))}

          {/* Bottom Row: Clear, 0, Delete */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleClear}
              className="h-16 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
            >
              <span className="text-sm">전체삭제</span>
            </button>
            <button
              onClick={() => handleNumberClick(0)}
              className="h-16 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
            >
              <span className="text-2xl">0</span>
            </button>
            <button
              onClick={handleDelete}
              className="h-16 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}