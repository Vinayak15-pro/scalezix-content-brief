"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { BriefForm } from "@/components/BriefForm";
import { BriefView } from "@/components/BriefView";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { generateBrief, fetchSampleBrief, reauditBrief, ApiError } from "@/lib/api";
import { ContentBrief, BriefGenerationRequest } from "@/types/brief";
import { AlertCircle, RefreshCw, Sparkles, BookOpen, CheckCircle } from "lucide-react";

export default function Home() {
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [lastFormInput, setLastFormInput] = useState<BriefGenerationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingKeyword, setLoadingKeyword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Generate
  const handleGenerate = async (request: BriefGenerationRequest) => {
    setIsLoading(true);
    setLoadingKeyword(request.keyword);
    setErrorMessage(null);
    setLastFormInput(request);

    try {
      const generatedBrief = await generateBrief(request);
      setBrief(generatedBrief);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Generation error:", err);
      const detail = err instanceof ApiError ? err.message : String(err);
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Load Sample
  const handleLoadSample = async () => {
    setIsLoading(true);
    setLoadingKeyword("Sample: Product-Led Growth SEO");
    setErrorMessage(null);

    try {
      const sample = await fetchSampleBrief();
      setBrief(sample);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Sample fetch error:", err);
      setErrorMessage("Could not load sample brief. Ensure the FastAPI backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to empty form
  const handleReset = () => {
    setBrief(null);
    setErrorMessage(null);
  };

  // Return to editing parameters without losing previous input
  const handleEditParameters = () => {
    setBrief(null);
  };

  // Re-audit edited brief
  const handleReaudit = async (updatedBrief: ContentBrief) => {
    if (!lastFormInput) return;
    try {
      const newAudit = await reauditBrief(lastFormInput, updatedBrief);
      setBrief((prev) => (prev ? { ...prev, brand_audit: newAudit } : null));
    } catch (e) {
      console.error("Re-audit failed:", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasBrief={!!brief}
        isLoading={isLoading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <strong className="font-semibold block text-sm text-red-800 mb-0.5">
                Generation Request Notice
              </strong>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-700 hover:text-red-950 font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay keyword={loadingKeyword} />}

        {/* Active Content Brief Workspace */}
        {!isLoading && brief && (
          <BriefView
            brief={brief}
            onEditParameters={handleEditParameters}
            onReaudit={handleReaudit}
          />
        )}

        {/* Main Brief Generation Form */}
        {!isLoading && !brief && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evidence-Backed Editorial Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Plan High-Ranking Content Without Hallucinating Facts
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Generate practical, brand-consistent content briefs with strict evidence verification checklists, real competitor heading extraction, and verified internal links.
              </p>
            </div>

            {/* Input Form */}
            <div className="max-w-4xl mx-auto">
              <BriefForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
                initialValues={lastFormInput}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Scalezix Assessment — Project 4: Brand-Consistent Content Brief Generator</p>
          <p className="text-slate-400">Powered by Next.js, FastAPI & Google GenAI SDK (gemini-3.5-flash)</p>
        </div>
      </footer>
    </div>
  );
}
