export const PRICE_IDS = {
  starter_monthly: process.env.NEXT_PUBLIC_PRICE_STARTER_M ?? "",
  pro_monthly: process.env.NEXT_PUBLIC_PRICE_PRO_M ?? ""
} as const;
