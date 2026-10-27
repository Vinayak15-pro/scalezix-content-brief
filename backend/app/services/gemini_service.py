import json
import logging
import time
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from google import genai
from google.genai import types
from google.genai.errors import APIError, ServerError, ClientError

from app.config import settings
from app.models.brief import (
    BriefGenerationRequest,
    CompetitorPageResult,
    TitleOption,
    OutlineSection,
    EvidenceItem,
    InternalLinkSuggestion,
)

logger = logging.getLogger(__name__)


def get_genai_client() -> genai.Client:
    api_key = settings.gemini_api_key.strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured on the backend. Please set GEMINI_API_KEY in backend/.env.",
        )
    return genai.Client(api_key=api_key)


def build_system_instruction(request: BriefGenerationRequest) -> str:
    return f"""You are a Principal SEO Content Strategist and Editorial Director.
Your task is to generate a comprehensive, actionable, brand-consistent content brief for a target topic.

STRICT EDITORIAL AND ACCURACY RULES:
1. EVIDENCE-BASED WRITING: NEVER fabricate statistics, percentages, research findings, quotes, or case studies.
   Instead, identify factual claims that the writer must support, state what primary source is required, and flag it for human verification.
2. VERIFIED INTERNAL LINKS ONLY: NEVER invent, guess, or hallucinate internal URLs or domain paths.
   You may ONLY recommend internal links from the user-provided verified URLs list. If no internal URLs are provided, return an empty array [].
3. COMPETITOR ANALYSIS: Base competitor insights strictly on the extracted competitor headings and topics provided in the prompt. If competitor analysis is unavailable or failed, do not pretend or invent competitor data.
4. BRAND GUIDELINES & FORBIDDEN TERMS:
   Strictly obey the provided tone ({request.tone}) and brand guidelines.
   NEVER use any of the forbidden words or claims: {json.dumps(request.words_to_avoid)}.
   Naturally incorporate the preferred terminology: {json.dumps(request.preferred_terminology)}.
5. STRUCTURED JSON OUTPUT: You must respond ONLY with valid JSON conforming precisely to the requested schema.
"""


def build_generation_prompt(
    request: BriefGenerationRequest,
    competitor_results: List[CompetitorPageResult],
) -> str:
    # Summarize competitor data
    competitor_summaries = []
    for comp in competitor_results:
        if comp.status == "success":
            headings_sample = comp.h2_headings[:8]
            competitor_summaries.append({
                "url": comp.url,
                "title": comp.title or "N/A",
                "h2_headings": headings_sample,
                "key_topics": comp.key_topics,
                "approx_word_count": comp.word_count,
            })
        else:
            competitor_summaries.append({
                "url": comp.url,
                "status": comp.status,
                "note": comp.error_message or "Failed to fetch competitor page.",
            })

    # Available verified internal links
    internal_urls_payload = request.verified_internal_urls[:15]

    prompt_dict = {
        "task": "Generate a comprehensive content brief",
        "inputs": {
            "target_keyword": request.keyword,
            "target_audience": request.target_audience,
            "search_intent": request.search_intent,
            "content_type": request.content_type,
            "tone": request.tone,
            "brand_guidelines": request.brand_guidelines or "Maintain an authoritative, helpful, evidence-first approach.",
            "preferred_terminology": request.preferred_terminology,
            "words_to_avoid": request.words_to_avoid,
            "competitor_extracted_data": competitor_summaries,
            "competitor_reference_notes": request.competitor_reference_text,
            "allowed_verified_internal_urls": internal_urls_payload,
        },
        "required_json_format": {
            "recommended_total_word_count": "integer, e.g. 2400",
            "meta_description_option": "string, under 160 characters, with primary keyword",
            "suggested_h1": "string, clear and compelling H1",
            "title_options": [
                {
                    "title": "string, title option under 65 chars",
                    "angle_rationale": "string explaining editorial angle (e.g. data-driven, practical guide, comparison)"
                }
            ],
            "outline": [
                {
                    "heading": "string, e.g. What is X? or 5 Core Steps to Y",
                    "level": "H2 or H3",
                    "section_purpose": "string explaining what this section accomplishes for the reader",
                    "target_word_count": "integer target word count for this specific section",
                    "key_talking_points": ["string point 1", "string point 2"],
                    "questions_answered": ["string question 1"],
                    "evidence_needs": ["string specific fact/benchmark writer must cite"]
                }
            ],
            "questions_to_answer": [
                "string, frequently asked question or search query intent"
            ],
            "related_subtopics": [
                "string, semantic entity or subtopic"
            ],
            "call_to_action": "string, contextual next step for the reader",
            "evidence_checklist": [
                {
                    "claim_or_fact": "string factual assertion, e.g. Industry benchmark for conversion rate",
                    "required_source_type": "string e.g. Peer-reviewed study, official doc, customer analytics",
                    "human_verification_required": True,
                    "verification_guidance": "string actionable guidance for the human researcher"
                }
            ],
            "internal_link_suggestions": [
                {
                    "url": "MUST BE EXACTLY one of the allowed_verified_internal_urls above, or omitted if none match",
                    "recommended_anchor_text": "string natural anchor text",
                    "target_section": "string heading of outline where link belongs",
                    "relevance_reason": "string why this link provides contextual value"
                }
            ]
        }
    }

    return f"Carefully analyze these parameters and generate the complete content brief in the specified JSON structure:\n\n{json.dumps(prompt_dict, indent=2)}"


async def generate_brief_ai(
    request: BriefGenerationRequest,
    competitor_results: List[CompetitorPageResult],
) -> Dict[str, Any]:
    """
    Calls Google Gemini using the official google-genai SDK,
    validates the JSON response, handles API errors gracefully,
    and returns parsed brief data.
    """
    client = get_genai_client()
    system_instruction = build_system_instruction(request)
    prompt = build_generation_prompt(request, competitor_results)
    model_name = settings.gemini_model.strip() or "gemini-3.5-flash"

    logger.info(f"Invoking Gemini model: {model_name} for keyword: {request.keyword}")
    start_time = time.time()

    try:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            temperature=0.25,
            top_p=0.95,
        )

        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config,
        )

        elapsed = time.time() - start_time
        logger.info(f"Gemini responded in {elapsed:.2f} seconds")

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="Gemini API returned an empty response. Please try again.",
            )

        try:
            raw_data = json.loads(response.text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON: {response.text}")
            raise HTTPException(
                status_code=502,
                detail=f"Gemini API returned malformed JSON: {str(e)}",
            )

        # Post-process and sanitize title options
        titles = []
        for t in raw_data.get("title_options", []):
            if isinstance(t, dict) and "title" in t:
                title_text = t.get("title", "").strip()
                titles.append(
                    TitleOption(
                        title=title_text,
                        angle_rationale=t.get("angle_rationale", "Standard angle"),
                        character_count=len(title_text),
                    )
                )

        # Post-process outline sections
        outline = []
        for sec in raw_data.get("outline", []):
            if isinstance(sec, dict) and "heading" in sec:
                outline.append(
                    OutlineSection(
                        heading=sec.get("heading", "Section"),
                        level=sec.get("level", "H2") if sec.get("level") in ("H2", "H3") else "H2",
                        section_purpose=sec.get("section_purpose", "Provides detailed insights."),
                        target_word_count=int(sec.get("target_word_count", 300)),
                        key_talking_points=sec.get("key_talking_points", []),
                        questions_answered=sec.get("questions_answered", []),
                        evidence_needs=sec.get("evidence_needs", []),
                    )
                )

        # Post-process evidence checklist
        evidence = []
        for ev in raw_data.get("evidence_checklist", []):
            if isinstance(ev, dict) and "claim_or_fact" in ev:
                evidence.append(
                    EvidenceItem(
                        claim_or_fact=ev.get("claim_or_fact", ""),
                        required_source_type=ev.get("required_source_type", "Primary Source"),
                        human_verification_required=True,
                        verification_guidance=ev.get("verification_guidance", "Verify against primary data."),
                    )
                )

        # Strict validation of internal links: must match user-provided verified URLs
        valid_urls_set = set(request.verified_internal_urls)
        internal_links = []
        for link in raw_data.get("internal_link_suggestions", []):
            if isinstance(link, dict) and link.get("url") in valid_urls_set:
                internal_links.append(
                    InternalLinkSuggestion(
                        url=link["url"],
                        recommended_anchor_text=link.get("recommended_anchor_text", "learn more"),
                        target_section=link.get("target_section", "Relevant section"),
                        relevance_reason=link.get("relevance_reason", "Contextually related topic"),
                    )
                )

        return {
            "recommended_total_word_count": int(raw_data.get("recommended_total_word_count", 2000)),
            "meta_description_option": raw_data.get("meta_description_option", ""),
            "suggested_h1": raw_data.get("suggested_h1", titles[0].title if titles else request.keyword),
            "title_options": titles,
            "outline": outline,
            "questions_to_answer": raw_data.get("questions_to_answer", []),
            "related_subtopics": raw_data.get("related_subtopics", []),
            "call_to_action": raw_data.get("call_to_action", "Read our full implementation guide."),
            "evidence_checklist": evidence,
            "internal_link_suggestions": internal_links,
            "model_used": model_name,
            "execution_time_seconds": round(elapsed, 2),
        }

    except ServerError as e:
        logger.error(f"Gemini ServerError: {e}")
        status_code = getattr(e, "code", 503)
        if "503" in str(e) or "high demand" in str(e).lower():
            raise HTTPException(
                status_code=503,
                detail=f"The configured Gemini model '{model_name}' is currently experiencing temporary high demand at Google. Please try again shortly or configure another model (e.g. gemini-3.5-flash) in backend/.env.",
            )
        raise HTTPException(
            status_code=502,
            detail=f"Gemini server error: {str(e)}",
        )
    except ClientError as e:
        logger.error(f"Gemini ClientError: {e}")
        err_msg = str(e)
        if "RESOURCE_EXHAUSTED" in err_msg or "429" in err_msg:
            raise HTTPException(
                status_code=429,
                detail="Gemini API rate limit or quota exceeded. Please wait a moment before regenerating.",
            )
        if "NOT_FOUND" in err_msg or "404" in err_msg:
            raise HTTPException(
                status_code=404,
                detail=f"The configured model '{model_name}' was not found or is deprecated. Please check GEMINI_MODEL in backend/.env.",
            )
        raise HTTPException(
            status_code=400,
            detail=f"Gemini API client error: {err_msg}",
        )
    except APIError as e:
        logger.error(f"Gemini APIError: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error ({getattr(e, 'code', 'unknown')}): {str(e)}",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error calling Gemini: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate brief with AI: {str(e)}",
        )
