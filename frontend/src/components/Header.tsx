"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasBrief: boolean;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  hasBrief,
  isLoading,
}) => {
  const [healthStatus, setHealthStatus] = useState<{
    connected: boolean;
    model?: string;
    loading: boolean;
  }>({
    connected: false,
    loading: true,
  });

  const checkHealth = async () => {
    try {
      setHealthStatus((prev) => ({ ...prev, loading: true }));
      const res = await checkBackendHealth();
      setHealthStatus({
        connected: res.status === "healthy",
        model: res.gemini_model,
        loading: false,
      });
    } catch {
      setHealthStatus({
        connected: false,
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900 tracking-tight text-lg">
                Scalezix
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                BriefStudio
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Brand-Consistent Content Brief Generator
            </p>
          </div>
        </div>

        {/* Backend status & Action buttons */}
        <div className="flex items-center space-x-3">
          {/* Health indicator badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs bg-slate-50 border-slate-200">
            {healthStatus.loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
            ) : healthStatus.connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700 font-medium">
                  Gemini API Active ({healthStatus.model || "Connected"})
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-700 font-medium">Backend Offline</span>
              </>
            )}
          </div>

          {/* Load Sample Brief Button */}
          <button
            onClick={onLoadSample}
            disabled={isLoading}
            type="button"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Load a verified production example brief without API calls"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Load Example Brief</span>
            <span className="ml-1 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono">
              Sample
            </span>
          </button>

          {/* New / Reset button if brief is active */}
          {hasBrief && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              <span>+ New Brief</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
