export type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";

export type ContentType = 
  | "comprehensive_guide" 
  | "how_to_tutorial" 
  | "comparison_vs" 
  | "thought_leadership" 
  | "case_study" 
  | "listicle";

export type PreferredTone = 
  | "authoritative" 
  | "conversational" 
  | "technical_in_depth" 
  | "concise_direct" 
  | "empathetic_supportive";

export interface BriefGenerationRequest {
  keyword: string;
  target_audience: string;
  search_intent: SearchIntent;
  content_type: ContentType;
  tone: PreferredTone;
  brand_guidelines?: string;
  preferred_terminology: string[];
  words_to_avoid: string[];
  competitor_urls: string[];
  competitor_reference_text?: string;
  verified_internal_urls: string[];
}

export interface CompetitorPageResult {
  url: string;
  status: "success" | "failed" | "blocked_ssrf" | "timeout" | "manual_input";
  title?: string | null;
  meta_description?: string | null;
  h1_headings: string[];
  h2_headings: string[];
  h3_headings: string[];
  key_topics: string[];
  word_count?: number | null;
  error_message?: string | null;
}

export interface InternalLinkSuggestion {
  url: string;
  recommended_anchor_text: string;
  target_section: string;
  relevance_reason: string;
}

export interface EvidenceItem {
  claim_or_fact: string;
  required_source_type: string;
  human_verification_required: boolean;
  verification_guidance: string;
}

export interface OutlineSection {
  heading: string;
  level: "H2" | "H3";
  section_purpose: string;
  target_word_count: number;
  key_talking_points: string[];
  questions_answered: string[];
  evidence_needs: string[];
}

export interface TitleOption {
  title: string;
  angle_rationale: string;
  character_count: number;
}

export interface BrandCheckItem {
  rule_name: string;
  category: "forbidden_term" | "tone_alignment" | "intent_match" | "terminology_usage";
  status: "pass" | "warning" | "violation";
  details: string;
  suggestion?: string | null;
}

export interface BrandAuditResult {
  compliance_score: number;
  overall_status: "passed" | "warnings" | "needs_revision";
  items: BrandCheckItem[];
  summary: string;
}

export interface ContentBrief {
  id: string;
  created_at: string;
  keyword: string;
  target_audience: string;
  search_intent: string;
  content_type: string;
  tone: string;
  recommended_total_word_count: number;
  suggested_h1: string;
  meta_description_option: string;
  title_options: TitleOption[];
  outline: OutlineSection[];
  questions_to_answer: string[];
  related_subtopics: string[];
  call_to_action: string;
  evidence_checklist: EvidenceItem[];
  internal_link_suggestions: InternalLinkSuggestion[];
  competitor_insights: CompetitorPageResult[];
  brand_audit: BrandAuditResult;
  generation_metadata: {
    model_used?: string;
    execution_time_seconds?: number;
    is_sample?: boolean;
    sample_label?: string;
  };
}
