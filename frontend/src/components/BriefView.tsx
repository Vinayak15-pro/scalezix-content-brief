"use client";

import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
  Link as LinkIcon,
  Globe,
  RefreshCw,
  Search,
} from "lucide-react";
import { ContentBrief, OutlineSection, EvidenceItem } from "@/types/brief";
import { exportBriefFile } from "@/lib/api";

interface BriefViewProps {
  brief: ContentBrief;
  onEditParameters: () => void;
  onReaudit?: (updatedBrief: ContentBrief) => void;
}

export const BriefView: React.FC<BriefViewProps> = ({
  brief: initialBrief,
  onEditParameters,
  onReaudit,
}) => {
  const [brief, setBrief] = useState<ContentBrief>(initialBrief);
  const [activeTab, setActiveTab] = useState<
    "overview" | "outline" | "evidence" | "links" | "competitors" | "brand"
  >("overview");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingH1, setIsEditingH1] = useState(false);
  const [editedH1, setEditedH1] = useState(brief.suggested_h1);

  // Synchronize if prop changes
  React.useEffect(() => {
    setBrief(initialBrief);
    setEditedH1(initialBrief.suggested_h1);
  }, [initialBrief]);

  // Copy to clipboard
  const handleCopyMarkdown = async () => {
    try {
      const res = await exportBriefFile(brief, "markdown");
      await navigator.clipboard.writeText(res.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Failed to copy brief to clipboard.");
    }
  };

  // Download File
  const handleDownload = async (format: "markdown" | "json") => {
    try {
      setIsExporting(true);
      const res = await exportBriefFile(brief, format);
      const blob = new Blob([res.content], {
        type: format === "markdown" ? "text/markdown;charset=utf-8;" : "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed: " + String(e));
    } finally {
      setIsExporting(false);
    }
  };

  // Select Title Option to become H1
  const selectTitleAsH1 = (newTitle: string) => {
    setBrief((prev) => ({
      ...prev,
      suggested_h1: newTitle,
    }));
    setEditedH1(newTitle);
  };

  // Save manual H1 edit
  const saveH1Edit = () => {
    setBrief((prev) => ({
      ...prev,
      suggested_h1: editedH1,
    }));
    setIsEditingH1(false);
  };

  // Update section heading or word count inline
  const updateSection = (idx: number, field: keyof OutlineSection, value: any) => {
    setBrief((prev) => {
      const newOutline = [...prev.outline];
      newOutline[idx] = { ...newOutline[idx], [field]: value };
      return { ...prev, outline: newOutline };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Brief
              </span>
              {brief.generation_metadata.is_sample ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  Verified Sample Brief
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live AI Output ({brief.generation_metadata.model_used || "Gemini"})
                </span>
              )}
              <span className="text-xs text-slate-400">
                Created: {new Date(brief.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {brief.keyword}
            </h1>

            {/* Micro stats */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Target: ~{brief.recommended_total_word_count.toLocaleString()} words
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium capitalize">
                Intent: {brief.search_intent}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium capitalize">
                Tone: {brief.tone.replace("_", " ")}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium capitalize">
                Format: {brief.content_type.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Buttons: Copy, Export, Edit */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload("markdown")}
              disabled={isExporting}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export .md</span>
            </button>

            <button
              onClick={() => handleDownload("json")}
              disabled={isExporting}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={onEditParameters}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit Parameters</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1 border-t border-slate-100 mt-5 pt-3">
          {[
            { id: "overview", label: "Overview & Titles", icon: FileText },
            { id: "outline", label: `Outline (${brief.outline.length})`, icon: Layers },
            { id: "evidence", label: `Evidence Checklist (${brief.evidence_checklist.length})`, icon: ShieldCheck },
            { id: "links", label: `Internal Links (${brief.internal_link_suggestions.length})`, icon: LinkIcon },
            { id: "competitors", label: `Competitors (${brief.competitor_insights.length})`, icon: Globe },
            { id: "brand", label: `Brand Audit (${brief.brand_audit.compliance_score}%)`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview & Titles */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Target Audience & Meta description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Target Reader Persona
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {brief.target_audience}
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recommended Meta Description
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {brief.meta_description_option.length}/160 chars
                </span>
              </div>
              <p className="text-sm text-slate-800 italic leading-relaxed">
                &ldquo;{brief.meta_description_option}&rdquo;
              </p>
            </div>
          </div>

          {/* Suggested H1 with inline edit */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Active Suggested H1 Header
              </h3>
              {!isEditingH1 ? (
                <button
                  onClick={() => setIsEditingH1(true)}
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit H1
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={saveH1Edit}
                    className="text-xs text-emerald-600 font-medium hover:underline cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedH1(brief.suggested_h1);
                      setIsEditingH1(false);
                    }}
                    className="text-xs text-slate-400 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditingH1 ? (
              <input
                type="text"
                value={editedH1}
                onChange={(e) => setEditedH1(e.target.value)}
                className="w-full px-3.5 py-2 text-base font-semibold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-lg font-bold text-slate-900">
                {brief.suggested_h1}
              </p>
            )}
          </div>

          {/* Title Options */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Alternative Title Options & Editorial Angles
            </h3>
            <div className="space-y-3">
              {brief.title_options.map((opt, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">
                        {opt.title}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          opt.character_count <= 65
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {opt.character_count} chars
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      <strong>Angle Rationale:</strong> {opt.angle_rationale}
                    </p>
                  </div>
                  <button
                    onClick={() => selectTitleAsH1(opt.title)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1 rounded border border-indigo-200 hover:bg-indigo-50 self-start sm:self-auto cursor-pointer"
                  >
                    Use as H1
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Questions Content Should Answer */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              Questions the Article Must Answer (Search Queries & FAQs)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {brief.questions_to_answer.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-700 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80"
                >
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          {brief.call_to_action && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                  Suggested Call to Action (CTA)
                </span>
                <p className="text-sm text-slate-800 font-medium mt-0.5">
                  {brief.call_to_action}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Outline */}
      {activeTab === "outline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-500">
              Structured H2/H3 outline with dedicated purpose, word count allocation, and key talking points.
            </p>
            <span className="text-xs font-mono text-slate-500">
              Total Sections: {brief.outline.length}
            </span>
          </div>

          {brief.outline.map((sec, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      sec.level === "H2"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 border border-slate-300"
                    }`}
                  >
                    {sec.level}
                  </span>
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => updateSection(idx, "heading", e.target.value)}
                    className="font-bold text-slate-900 text-base bg-transparent hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1.5 py-0.5 w-full sm:w-[480px]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Target:</span>
                  <input
                    type="number"
                    value={sec.target_word_count}
                    onChange={(e) => updateSection(idx, "target_word_count", parseInt(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 text-xs border border-slate-300 rounded text-center font-mono"
                  />
                  <span>words</span>
                </div>
              </div>

              {/* Section Purpose */}
              <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                <span className="font-semibold text-slate-800">Section Purpose: </span>
                {sec.section_purpose}
              </div>

              {/* Talking Points & Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Talking Points */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Key Talking Points
                  </h4>
                  <ul className="space-y-1.5">
                    {sec.key_talking_points.map((pt, pIdx) => (
                      <li
                        key={pIdx}
                        className="text-xs text-slate-700 flex items-start gap-1.5"
                      >
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence / Questions */}
                <div className="space-y-3">
                  {sec.evidence_needs && sec.evidence_needs.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Evidence Requirement
                      </h4>
                      {sec.evidence_needs.map((ev, eIdx) => (
                        <p
                          key={eIdx}
                          className="text-xs text-amber-900 bg-amber-50/70 p-2 rounded border border-amber-200"
                        >
                          {ev}
                        </p>
                      ))}
                    </div>
                  )}

                  {sec.questions_answered && sec.questions_answered.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Answers Question:
                      </h4>
                      {sec.questions_answered.map((q, qIdx) => (
                        <p key={qIdx} className="text-xs text-slate-600 italic">
                          &ldquo;{q}&rdquo;
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Evidence Checklist */}
      {activeTab === "evidence" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Evidence & Fact Verification Checklist
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Strict Rule: Do not invent statistics, quotes, or benchmark findings. Every item below is explicitly flagged for primary human verification.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Claim / Fact Needed</th>
                  <th className="py-3 px-4">Required Source Type</th>
                  <th className="py-3 px-4">Verification Guidance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brief.evidence_checklist.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                      {item.claim_or_fact}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                        {item.required_source_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                      {item.verification_guidance}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Human Check Required
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Verified Internal Links */}
      {activeTab === "links" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-600" />
              Verified Internal Link Suggestions
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Links are strictly drawn from user-supplied verified URLs. Non-existent pages or hallucinated paths are completely disallowed.
            </p>
          </div>

          {brief.internal_link_suggestions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {brief.internal_link_suggestions.map((link, idx) => (
                <div key={idx} className="py-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        Recommended Anchor:
                      </span>
                      <code className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                        &ldquo;{link.recommended_anchor_text}&rdquo;
                      </code>
                    </div>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Target: {link.target_section}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-blue-600">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-mono truncate"
                    >
                      {link.url}
                    </a>
                  </div>

                  <p className="text-xs text-slate-600 pt-0.5">
                    <strong>Relevance Rationale:</strong> {link.relevance_reason}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No verified internal URLs were supplied during brief generation.
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Competitor Insights */}
      {activeTab === "competitors" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Competitor Research & Extraction Status
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Data extracted from real HTTP fetches or user manual reference text. Failed or blocked crawls are truthfully documented without fabricated findings.
            </p>
          </div>

          {brief.competitor_insights.length > 0 ? (
            <div className="space-y-4">
              {brief.competitor_insights.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={comp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-semibold text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-md"
                    >
                      {comp.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        comp.status === "success" || comp.status === "manual_input"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      Status: {comp.status}
                    </span>
                  </div>

                  {comp.title && (
                    <p className="text-xs font-medium text-slate-800">
                      <strong>Title:</strong> {comp.title}
                    </p>
                  )}

                  {comp.word_count && (
                    <p className="text-xs text-slate-600 font-mono">
                      Estimated Word Count: ~{comp.word_count.toLocaleString()} words
                    </p>
                  )}

                  {comp.h2_headings && comp.h2_headings.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Extracted Competitor Headings:
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {comp.h2_headings.map((h, hIdx) => (
                          <span
                            key={hIdx}
                            className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-mono"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {comp.error_message && (
                    <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <strong>Crawl / Security Status:</strong> {comp.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No competitor URLs were submitted for analysis.
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Brand Audit */}
      {activeTab === "brand" && (
        <div className="space-y-5">
          {/* Audit Score Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Brand Adherence Score
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {brief.brand_audit.compliance_score}
                  <span className="text-base font-normal text-slate-400">/100</span>
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                    brief.brand_audit.overall_status === "passed"
                      ? "bg-emerald-100 text-emerald-800"
                      : brief.brand_audit.overall_status === "warnings"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {brief.brand_audit.overall_status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {brief.brand_audit.summary}
              </p>
            </div>
          </div>

          {/* Audit Rule Items */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Itemized Rule Verification
            </h3>
            <div className="space-y-2.5">
              {brief.brand_audit.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                    item.status === "pass"
                      ? "bg-emerald-50/40 border-emerald-200 text-emerald-950"
                      : item.status === "warning"
                      ? "bg-amber-50/40 border-amber-200 text-amber-950"
                      : "bg-rose-50/40 border-rose-200 text-rose-950"
                  }`}
                >
                  {item.status === "pass" ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : item.status === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">
                        {item.rule_name}
                      </span>
                      <span className="text-[10px] px-1.5 rounded bg-white text-slate-600 border border-slate-200">
                        {item.category.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {item.details}
                    </p>
                    {item.suggestion && (
                      <p className="text-xs text-slate-600 italic">
                        <strong>Action:</strong> {item.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
