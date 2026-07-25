export const CURRENCY = "TND";

export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `${value.toLocaleString("fr-TN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${CURRENCY}`;
}
