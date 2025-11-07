"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthProps {
  password: string;
  show: boolean;
}

export function PasswordStrength({ password, show }: PasswordStrengthProps) {
  const requirements: PasswordRequirement[] = [
    {
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      met: /[0-9]/.test(password),
    },
    {
      label: "At least one special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  // Calculate password strength
  const calculateStrength = (): {
    percentage: number;
    label: string;
    color: string;
    bgColor: string;
  } => {
    let points = 0;
    const maxPoints = 6;

    if (password.length >= 8) points++;
    if (password.length >= 12) points++;
    if (/[A-Z]/.test(password)) points++;
    if (/[a-z]/.test(password)) points++;
    if (/[0-9]/.test(password)) points++;
    if (/[^A-Za-z0-9]/.test(password)) points++;

    const percentage = (points / maxPoints) * 100;

    if (points <= 2) {
      return {
        percentage,
        label: "Weak",
        color: "bg-red-500",
        bgColor: "bg-red-100",
      };
    }
    if (points <= 4) {
      return {
        percentage,
        label: "Medium",
        color: "bg-yellow-500",
        bgColor: "bg-yellow-100",
      };
    }
    if (points <= 5) {
      return {
        percentage,
        label: "Good",
        color: "bg-blue-500",
        bgColor: "bg-blue-100",
      };
    }
    return {
      percentage,
      label: "Strong",
      color: "bg-green-500",
      bgColor: "bg-green-100",
    };
  };

  const { percentage, label, color, bgColor } =
    password.length > 0
      ? calculateStrength()
      : { percentage: 0, label: "", color: "", bgColor: "bg-slate-100" };

  if (!show) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Password Strength Meter */}
      {password.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Password Strength</span>
            <span
              className={cn(
                "text-xs font-semibold transition-colors duration-300",
                percentage <= 33 && "text-red-600",
                percentage > 33 && percentage <= 66 && "text-yellow-600",
                percentage > 66 && percentage <= 83 && "text-blue-600",
                percentage > 83 && "text-green-600"
              )}
            >
              {label}
            </span>
          </div>
          <div
            className={cn(
              "h-2 w-full rounded-full overflow-hidden transition-colors duration-300",
              bgColor
            )}
          >
            <div
              className={cn("h-full rounded-full transition-all duration-500 ease-out", color)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements List */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-slate-700">Password must contain:</p>
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-200",
              req.met ? "text-green-600" : "text-slate-400"
            )}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
        <div
          className={cn(
            "flex items-center gap-2 text-xs transition-colors duration-200",
            password.length >= 8 ? "text-green-600" : "text-slate-400"
          )}
        >
          {password.length >= 8 ? (
            <Check className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span>At least 8 characters</span>
        </div>
      </div>
    </div>
  );
}
