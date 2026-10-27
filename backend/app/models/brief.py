from typing import List, Optional, Literal
from pydantic import BaseModel, Field, HttpUrl
import uuid
from datetime import datetime, timezone


class BriefGenerationRequest(BaseModel):
    keyword: str = Field(..., min_length=2, max_length=150, description="Target keyword or primary topic")
    target_audience: str = Field(..., min_length=2, max_length=300, description="Target reader persona/audience")
    search_intent: Literal["informational", "commercial", "transactional", "navigational"] = Field(
        default="informational", description="Primary search intent"
    )
    content_type: Literal[
        "comprehensive_guide", "how_to_tutorial", "comparison_vs", "thought_leadership", "case_study", "listicle"
    ] = Field(default="comprehensive_guide", description="Desired content format")
    tone: Literal[
        "authoritative", "conversational", "technical_in_depth", "concise_direct", "empathetic_supportive"
    ] = Field(default="authoritative", description="Voice and tone of voice")
    brand_guidelines: Optional[str] = Field(
        default="", max_length=2000, description="Brand mission, positioning, and stylistic rules"
    )
    preferred_terminology: List[str] = Field(
        default_factory=list, description="Approved terminology or phrases to use"
    )
    words_to_avoid: List[str] = Field(
        default_factory=list, description="Prohibited claims, competitor names, or buzzwords"
    )
    competitor_urls: List[str] = Field(
        default_factory=list, max_length=4, description="Optional competitor URLs to analyze"
    )
    competitor_reference_text: Optional[str] = Field(
        default="", max_length=4000, description="Manual competitor excerpt or reference notes"
    )
    verified_internal_urls: List[str] = Field(
        default_factory=list, max_length=15, description="Verified internal company URLs available for linking"
    )


class CompetitorPageResult(BaseModel):
    url: str
    status: Literal["success", "failed", "blocked_ssrf", "timeout", "manual_input"]
    title: Optional[str] = None
    meta_description: Optional[str] = None
    h1_headings: List[str] = Field(default_factory=list)
    h2_headings: List[str] = Field(default_factory=list)
    h3_headings: List[str] = Field(default_factory=list)
    key_topics: List[str] = Field(default_factory=list)
    word_count: Optional[int] = None
    error_message: Optional[str] = None


class InternalLinkSuggestion(BaseModel):
    url: str
    recommended_anchor_text: str
    target_section: str
    relevance_reason: str


class EvidenceItem(BaseModel):
    claim_or_fact: str = Field(..., description="Fact, claim, or stat that must be backed by evidence")
    required_source_type: str = Field(..., description="e.g. Primary benchmark, official doc, customer case study")
    human_verification_required: bool = Field(default=True, description="Always true; requires human checking")
    verification_guidance: str = Field(..., description="Actionable instruction on how writer should verify")


class OutlineSection(BaseModel):
    heading: str
    level: Literal["H2", "H3"] = "H2"
    section_purpose: str
    target_word_count: int
    key_talking_points: List[str] = Field(default_factory=list)
    questions_answered: List[str] = Field(default_factory=list)
    evidence_needs: List[str] = Field(default_factory=list)


class TitleOption(BaseModel):
    title: str
    angle_rationale: str
    character_count: int


class BrandCheckItem(BaseModel):
    rule_name: str
    category: Literal["forbidden_term", "tone_alignment", "intent_match", "terminology_usage"]
    status: Literal["pass", "warning", "violation"]
    details: str
    suggestion: Optional[str] = None


class BrandAuditResult(BaseModel):
    compliance_score: int = Field(ge=0, le=100)
    overall_status: Literal["passed", "warnings", "needs_revision"]
    items: List[BrandCheckItem] = Field(default_factory=list)
    summary: str


class ContentBrief(BaseModel):
    id: str = Field(default_factory=lambda: f"brief_{uuid.uuid4().hex[:10]}")
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    keyword: str
    target_audience: str
    search_intent: str
    content_type: str
    tone: str
    recommended_total_word_count: int
    meta_description_option: str
    suggested_h1: str
    title_options: List[TitleOption] = Field(default_factory=list)
    outline: List[OutlineSection] = Field(default_factory=list)
    questions_to_answer: List[str] = Field(default_factory=list)
    related_subtopics: List[str] = Field(default_factory=list)
    call_to_action: str
    evidence_checklist: List[EvidenceItem] = Field(default_factory=list)
    internal_link_suggestions: List[InternalLinkSuggestion] = Field(default_factory=list)
    competitor_insights: List[CompetitorPageResult] = Field(default_factory=list)
    brand_audit: BrandAuditResult
    generation_metadata: dict = Field(default_factory=dict)


class ExportRequest(BaseModel):
    brief: ContentBrief
    format: Literal["markdown", "json"] = "markdown"


class ExportResponse(BaseModel):
    format: str
    filename: str
    content: str
