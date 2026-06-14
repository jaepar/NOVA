export function normalizeTransferAmount(amount: string) {
  return amount.replace(/,/g, "").trim();
}

export function toTransferAmountNumber(amount: string) {
  const numericAmount = Number(normalizeTransferAmount(amount));

  if (Number.isNaN(numericAmount) || numericAmount < 0) {
    return 0;
  }

  return numericAmount;
}

export function formatForeignAmount(currencyCode: string, amount: string) {
  const numericAmount = toTransferAmountNumber(amount);

  return `${currencyCode} ${numericAmount.toFixed(2)}`;
}

export function formatExchangeRate(amount: number) {
  return `KRW ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatKrwAmount(amount: number) {
  return `KRW ${amount.toLocaleString("ko-KR")}`;
}
