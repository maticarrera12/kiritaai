"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreditsPage() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setShowSuccess(true);
      // Remove query param after showing message
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">
                Payment Successful!
              </h3>
              <p className="text-sm text-green-700">
                Your credits have been added to your account.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Credits</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Credit Balance</h2>
          <p className="text-gray-600">
            Your credit balance and transaction history will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
