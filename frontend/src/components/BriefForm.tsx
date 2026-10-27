"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  ShieldAlert,
  Link2,
  Globe,
  Plus,
  Trash2,
  FileCheck,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import {
  BriefGenerationRequest,
  SearchIntent,
  ContentType,
  PreferredTone,
} from "@/types/brief";

interface BriefFormProps {
  onSubmit: (data: BriefGenerationRequest) => void;
  isLoading: boolean;
  initialValues?: BriefGenerationRequest | null;
}

const DEFAULT_SAMPLE_VALUES: BriefGenerationRequest = {
  keyword: "Product-Led Growth SEO Strategy",
  target_audience: "B2B SaaS Growth Marketers, Heads of SEO, and Product Leaders",
  search_intent: "informational",
  content_type: "comprehensive_guide",
  tone: "authoritative",
  brand_guidelines:
    "Tone must be pragmatic, authoritative, and data-backed. Focus on sustainable flywheel mechanics rather than hacky growth tricks. Keep language clear and direct.",
  preferred_terminology: [
    "product-led SEO",
    "user intent mapping",
    "self-serve flywheel",
    "product-qualified leads",
  ],
  words_to_avoid: [
    "guaranteed 100%",
    "hack your way",
    "cheap traffic",
    "overnight ranking",
  ],
  competitor_urls: ["https://example.com/competitor/plg-seo-guide"],
  competitor_reference_text:
    "Competitor articles focus heavily on programmatic templates but lack technical teardowns of gated vs open indexable content.",
  verified_internal_urls: [
    "https://scalezix.com/case-studies/saas-organic-growth",
    "https://scalezix.com/blog/saas-keyword-intent-matrix",
    "https://scalezix.com/tools/content-brief-generator",
  ],
};

export const BriefForm: React.FC<BriefFormProps> = ({
  onSubmit,
  isLoading,
  initialValues,
}) => {
  const [formData, setFormData] = useState<BriefGenerationRequest>(
    initialValues || {
      keyword: "",
      target_audience: "",
      search_intent: "informational",
      content_type: "comprehensive_guide",
      tone: "authoritative",
      brand_guidelines: "",
      preferred_terminology: [],
      words_to_avoid: [],
      competitor_urls: [],
      competitor_reference_text: "",
      verified_internal_urls: [],
    }
  );

  const [termInput, setTermInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");
  const [competitorUrlInput, setCompetitorUrlInput] = useState("");
  const [internalUrlInput, setInternalUrlInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFillSample = () => {
    setFormData(DEFAULT_SAMPLE_VALUES);
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!formData.keyword.trim()) {
      errs.keyword = "Target keyword or topic is required.";
    } else if (formData.keyword.trim().length < 3) {
      errs.keyword = "Keyword must be at least 3 characters.";
    }

    if (!formData.target_audience.trim()) {
      errs.target_audience = "Intended audience persona is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Tag & List Handlers
  const addTerm = () => {
    if (termInput.trim() && !formData.preferred_terminology.includes(termInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        preferred_terminology: [...prev.preferred_terminology, termInput.trim()],
      }));
      setTermInput("");
    }
  };

  const removeTerm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      preferred_terminology: prev.preferred_terminology.filter((_, i) => i !== index),
    }));
  };

  const addAvoidWord = () => {
    if (avoidInput.trim() && !formData.words_to_avoid.includes(avoidInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        words_to_avoid: [...prev.words_to_avoid, avoidInput.trim()],
      }));
      setAvoidInput("");
    }
  };

  const removeAvoidWord = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      words_to_avoid: prev.words_to_avoid.filter((_, i) => i !== index),
    }));
  };

  const addCompetitorUrl = () => {
    const url = competitorUrlInput.trim();
    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        setErrors((prev) => ({ ...prev, competitorUrl: "URL must begin with http:// or https://" }));
        return;
      }
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.competitorUrl;
        return copy;
      });
      if (formData.competitor_urls.length >= 4) {
        setErrors((prev) => ({ ...prev, competitorUrl: "Maximum 4 competitor URLs permitted." }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        competitor_urls: [...prev.competitor_urls, url],
      }));
      setCompetitorUrlInput("");
    }
  };

  const removeCompetitorUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      competitor_urls: prev.competitor_urls.filter((_, i) => i !== index),
    }));
  };

  const addInternalUrl = () => {
    const url = internalUrlInput.trim();
    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        setErrors((prev) => ({ ...prev, internalUrl: "URL must begin with http:// or https://" }));
        return;
      }
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.internalUrl;
        return copy;
      });
      if (formData.verified_internal_urls.length >= 15) {
        setErrors((prev) => ({ ...prev, internalUrl: "Maximum 15 internal URLs allowed." }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        verified_internal_urls: [...prev.verified_internal_urls, url],
      }));
      setInternalUrlInput("");
    }
  };

  const removeInternalUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      verified_internal_urls: prev.verified_internal_urls.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Content Brief Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure target keyword, audience, intent, brand guidelines, and verified links.
          </p>
        </div>
        <button
          type="button"
          onClick={handleFillSample}
          disabled={isLoading}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 transition-colors self-start sm:self-auto cursor-pointer"
        >
          Fill Sample Scenario
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Core Keyword & Audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Keyword or Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Product-Led Growth SEO Strategy"
              value={formData.keyword}
              onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.keyword ? "border-red-400 bg-red-50/20" : "border-slate-300"
              }`}
            />
            {errors.keyword && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.keyword}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Intended Audience Persona <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. B2B SaaS Growth Marketers and Product Leaders"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.target_audience ? "border-red-400 bg-red-50/20" : "border-slate-300"
              }`}
            />
            {errors.target_audience && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.target_audience}</p>
            )}
          </div>
        </div>

        {/* Intent, Content Type, Tone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Search Intent
            </label>
            <select
              value={formData.search_intent}
              onChange={(e) =>
                setFormData({ ...formData, search_intent: e.target.value as SearchIntent })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="informational">Informational (Educational / Guides)</option>
              <option value="commercial">Commercial (Evaluation & Options)</option>
              <option value="transactional">Transactional (Action & Purchase)</option>
              <option value="navigational">Navigational (Brand & Resource)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Content Type
            </label>
            <select
              value={formData.content_type}
              onChange={(e) =>
                setFormData({ ...formData, content_type: e.target.value as ContentType })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="comprehensive_guide">Comprehensive Guide</option>
              <option value="how_to_tutorial">Step-by-Step How-To Tutorial</option>
              <option value="comparison_vs">Comparison / Alternative (VS)</option>
              <option value="thought_leadership">Thought Leadership & Strategy</option>
              <option value="case_study">Case Study & Teardown</option>
              <option value="listicle">Curated List / Frameworks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Tone of Voice
            </label>
            <select
              value={formData.tone}
              onChange={(e) =>
                setFormData({ ...formData, tone: e.target.value as PreferredTone })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="authoritative">Authoritative & Analytical</option>
              <option value="conversational">Conversational & Engaging</option>
              <option value="technical_in_depth">Technical & In-Depth</option>
              <option value="concise_direct">Concise & Direct</option>
              <option value="empathetic_supportive">Empathetic & Supportive</option>
            </select>
          </div>
        </div>

        {/* Brand Guidelines & Editorial Principles */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Brand Guidelines & Style Principles</span>
            <span className="text-[11px] text-slate-400 font-normal lowercase">Optional</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Tone must be pragmatic, authoritative, and data-backed. Focus on sustainable flywheel mechanics rather than hacky growth tricks. Keep language clear and direct."
            value={formData.brand_guidelines}
            onChange={(e) => setFormData({ ...formData, brand_guidelines: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Terminology & Avoid Words */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Preferred Terminology */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Preferred Terminology
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add term (e.g. self-serve flywheel)"
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTerm();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addTerm}
                className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 cursor-pointer font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {formData.preferred_terminology.map((term, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {term}
                  <button
                    type="button"
                    onClick={() => removeTerm(i)}
                    className="hover:text-emerald-950 font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.preferred_terminology.length === 0 && (
                <span className="text-xs text-slate-400 italic">No specific terminology added</span>
              )}
            </div>
          </div>

          {/* Words or Claims to Avoid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Words or Claims to Avoid
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add claim to avoid (e.g. guaranteed 100%)"
                value={avoidInput}
                onChange={(e) => setAvoidInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAvoidWord();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addAvoidWord}
                className="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 cursor-pointer font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[30px]">
              {formData.words_to_avoid.map((word, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-rose-50 text-rose-800 border border-rose-200"
                >
                  {word}
                  <button
                    type="button"
                    onClick={() => removeAvoidWord(i)}
                    className="hover:text-rose-950 font-bold ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.words_to_avoid.length === 0 && (
                <span className="text-xs text-slate-400 italic">No forbidden words specified</span>
              )}
            </div>
          </div>
        </div>

        {/* Competitor URLs & Reference Notes */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              Optional Competitor Pages (Safe SSRF-Protected Extraction)
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {formData.competitor_urls.length}/4 Max
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Real headings and topics will be extracted. Failed or unavailable pages will be explicitly cited; never fabricated.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/competitor/article-slug"
              value={competitorUrlInput}
              onChange={(e) => setCompetitorUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCompetitorUrl();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addCompetitorUrl}
              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium cursor-pointer"
            >
              Add URL
            </button>
          </div>
          {errors.competitorUrl && (
            <p className="text-xs text-red-600 font-medium">{errors.competitorUrl}</p>
          )}

          {formData.competitor_urls.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {formData.competitor_urls.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs px-3 py-1.5 bg-white rounded-md border border-slate-200"
                >
                  <span className="truncate text-slate-700 font-mono">{u}</span>
                  <button
                    type="button"
                    onClick={() => removeCompetitorUrl(i)}
                    className="text-slate-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Manual Competitor Reference Text or Excerpt (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Paste competitor outline notes, content gaps, or angles to analyze..."
              value={formData.competitor_reference_text || ""}
              onChange={(e) => setFormData({ ...formData, competitor_reference_text: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Verified Internal URLs */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              Verified Internal Links Repository (Anti-Hallucination Safe)
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {formData.verified_internal_urls.length}/15 Max
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Strict Rule: The AI will <strong>only</strong> recommend internal links from this verified list. It will never invent nonexistent pages.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://yourcompany.com/case-studies/product-growth"
              value={internalUrlInput}
              onChange={(e) => setInternalUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInternalUrl();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addInternalUrl}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer"
            >
              Add Link
            </button>
          </div>
          {errors.internalUrl && (
            <p className="text-xs text-red-600 font-medium">{errors.internalUrl}</p>
          )}

          {formData.verified_internal_urls.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {formData.verified_internal_urls.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs px-3 py-1.5 bg-white rounded-md border border-slate-200"
                >
                  <span className="truncate text-slate-700 font-mono">{u}</span>
                  <button
                    type="button"
                    onClick={() => removeInternalUrl(i)}
                    className="text-slate-400 hover:text-red-600 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Brand-Consistent Content Brief</span>
          </button>
        </div>
      </form>
    </div>
  );
};
