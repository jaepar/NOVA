import { RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/design-system/AppButton";
import { MobileLayout } from "../../components/layout/MobileLayout";

const paymentBalance = 12500;
const qrSize = 29;

function isFinderPattern(row: number, col: number, startRow: number, startCol: number) {
  const localRow = row - startRow;
  const localCol = col - startCol;

  if (localRow < 0 || localRow > 6 || localCol < 0 || localCol > 6) {
    return false;
  }

  const isOuter = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
  const isInner = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;

  return isOuter || isInner;
}

function shouldFillQrCell(row: number, col: number, seed: number) {
  if (
    isFinderPattern(row, col, 1, 1) ||
    isFinderPattern(row, col, 1, 21) ||
    isFinderPattern(row, col, 21, 1)
  ) {
    return true;
  }

  if (
    (row <= 8 && col <= 8) ||
    (row <= 8 && col >= 20) ||
    (row >= 20 && col <= 8)
  ) {
    return false;
  }

  const value = (row * 17 + col * 31 + seed * 13 + row * col) % 9;
  return value === 0 || value === 2 || value === 5 || (row + col + seed) % 11 === 0;
}

function WalletQrCode({ seed }: { seed: number }) {
  const cells = useMemo(
    () =>
      Array.from({ length: qrSize * qrSize }, (_, index) => {
        const row = Math.floor(index / qrSize);
        const col = index % qrSize;

        return {
          id: `${row}-${col}`,
          col,
          row,
          filled: shouldFillQrCell(row, col, seed),
        };
      }),
    [seed],
  );

  return (
    <svg
      viewBox={`0 0 ${qrSize} ${qrSize}`}
      className="h-full w-full"
      shapeRendering="crispEdges"
      aria-label="월렛 결제 QR 코드"
      role="img"
    >
      <rect width={qrSize} height={qrSize} fill="#ffffff" />
      {cells.map((cell) =>
        cell.filled ? (
          <rect
            key={cell.id}
            x={cell.col}
            y={cell.row}
            width="1"
            height="1"
            fill="#000000"
          />
        ) : null,
      )}
    </svg>
  );
}

export function WalletPayment() {
  const navigate = useNavigate();
  const [qrSeed, setQrSeed] = useState(1);

  return (
    <MobileLayout
      title="결제"
      bottomContent={
        <AppButton
          type="button"
          variant="unstyled"
          onClick={() => navigate("/wallet/home")}
          className="h-[56px] w-full rounded-lg bg-black text-[17px] font-semibold text-white"
        >
          완료
        </AppButton>
      }
    >
      <div className="flex min-h-[640px] flex-col justify-center pb-3">
        <h2 className="text-center text-[20px] font-medium leading-9 text-[#868484]">
          QR 코드로 결제
        </h2>

        <section className="mt-7 rounded-[24px] bg-white px-5 pb-6 pt-6 shadow-[0_14px_36px_rgba(0,0,0,0.08)]">
          <div className="relative mx-auto h-[220px] w-[220px]">
            <div className="absolute left-0 top-0 h-7 w-7 rounded-tl-[7px] border-l-[3px] border-t-[3px] border-[#777777]" />
            <div className="absolute right-0 top-0 h-7 w-7 rounded-tr-[7px] border-r-[3px] border-t-[3px] border-[#777777]" />
            <div className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-[7px] border-b-[3px] border-l-[3px] border-[#777777]" />
            <div className="absolute bottom-0 right-0 h-7 w-7 rounded-br-[7px] border-b-[3px] border-r-[3px] border-[#777777]" />

            <div className="absolute inset-8">
              <WalletQrCode seed={qrSeed} />
            </div>
          </div>

          <div className="mt-6 h-px bg-[#e5e5e5]" />

          <div className="mt-5 text-center">
            <p className="text-[14px] font-medium leading-5 text-[#777777]">
              현재 잔액
            </p>
            <p className="mt-2 text-[38px] font-bold leading-[46px] tracking-[-0.02em] text-[#111111]">
              {paymentBalance.toLocaleString("ko-KR")}
              <span className="ml-1 text-[24px] font-semibold">원</span>
            </p>
          </div>

          <AppButton
            type="button"
            variant="unstyled"
            onClick={() => setQrSeed((seed) => seed + 1)}
            className="mt-6 flex h-[52px] w-full items-center justify-center gap-3 rounded-[8px] border border-[#e0e0e0] bg-white text-[17px] font-semibold text-[#111111]"
          >
            <RefreshCcw className="h-5 w-5" strokeWidth={2.2} />
            새로고침
          </AppButton>
        </section>
      </div>
    </MobileLayout>
  );
}
