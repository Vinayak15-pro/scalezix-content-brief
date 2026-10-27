"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Globe, CheckCircle2 } from "lucide-react";

interface LoadingOverlayProps {
  keyword: string;
}

const STEPS = [
  { text: "Validating inputs & SSRF protection rules...", icon: ShieldCheck },
  { text: "Fetching & parsing competitor headings safely...", icon: Globe },
  { text: "Synthesizing evidence-backed outline with Gemini...", icon: Sparkles },
  { text: "Running deterministic brand guideline & tone audit...", icon: CheckCircle2 },
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ keyword }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 2200);
    const timer2 = setTimeout(() => setCurrentStep(2), 5500);
    const timer3 = setTimeout(() => setCurrentStep(3), 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-xl mx-auto my-12 text-center space-y-6">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Generating Brand-Consistent Brief
        </h3>
        <p className="text-xs text-slate-500 font-mono">
          Target: &ldquo;{keyword}&rdquo;
        </p>
      </div>

      <div className="space-y-3 text-left pt-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;

          return (
            <div
              key={idx}
              className={`flex items-center space-x-3 text-xs p-3 rounded-lg border transition-all ${
                isDone
                  ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                  : isCurrent
                  ? "bg-indigo-50/50 border-indigo-300 text-indigo-950 font-semibold"
                  : "bg-slate-50/50 border-slate-200 text-slate-400"
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Icon className="w-4 h-4 text-indigo-600 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>
              <span className="flex-1">{step.text}</span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400">
        Strict Rule: Never inventing fake statistics or unverified competitor claims.
      </p>
    </div>
  );
};
