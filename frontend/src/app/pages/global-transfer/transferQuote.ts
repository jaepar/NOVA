export const MOCK_TRANSFER_EXCHANGE_RATE = 1505.25;
export const MOCK_TRANSFER_TRANSFER_FEE = "면제";
export const MOCK_TRANSFER_CABLE_FEE = "면제";

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

export function calculateKrwAmount(
  amount: string,
  exchangeRate = MOCK_TRANSFER_EXCHANGE_RATE
) {
  return Math.round(toTransferAmountNumber(amount) * exchangeRate);
}

export function formatKrwAmount(amount: string) {
  return `KRW ${calculateKrwAmount(amount).toLocaleString("ko-KR")}`;
}
