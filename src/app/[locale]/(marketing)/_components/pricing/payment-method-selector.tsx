"use client";

import { useTranslations } from "next-intl";
// import Image from "next/image";

interface PaymentMethodSelectorProps {
  onSelectStripe: () => void;
  onSelectLemon: () => void;
}

export function PaymentMethodSelector({
  onSelectStripe,
  onSelectLemon,
}: PaymentMethodSelectorProps) {
  const t = useTranslations("pricing.paymentModal");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("title")}</h2>
      <p className="text-gray-600 mb-6">{t("subtitle")}</p>

      <div className="space-y-3">
        {/* Stripe Option */}
        <button
          onClick={onSelectStripe}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#635BFF] hover:bg-purple-50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 60 25"
                  fill="currentColor"
                >
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-[#635BFF] transition">
                  Stripe
                </p>
                <p className="text-sm text-gray-500">Credit card, debit card</p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-[#635BFF] transition"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>

        {/* Lemon Squeezy Option */}
        <button
          onClick={onSelectLemon}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#FFC233] hover:bg-yellow-50 transition-all group relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FFC233] rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍋</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-[#FFC233] transition">
                  Lemon Squeezy
                </p>
                <p className="text-sm text-gray-500">
                  Multiple payment options
                </p>
              </div>
            </div>
            <span className="absolute top-2 right-2 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {t("comingSoon")}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
