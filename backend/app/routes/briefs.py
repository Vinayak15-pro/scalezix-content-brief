import asyncio
import logging
from fastapi import APIRouter, HTTPException, Response
from app.models.brief import (
    BriefGenerationRequest,
    ContentBrief,
    ExportRequest,
    ExportResponse,
    BrandAuditResult,
)
from app.services.scraper import fetch_competitor_page
from app.services.gemini_service import generate_brief_ai
from app.services.brand_audit import audit_brief_against_brand_rules
from app.services.sample_brief import get_sample_brief
from app.services.export_service import brief_to_markdown, brief_to_json_export
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/briefs", tags=["Content Briefs"])


@router.post("/generate", response_model=ContentBrief)
async def generate_brief(request: BriefGenerationRequest):
    """
    Main pipeline:
    1. Validate input parameters and URL limits.
    2. Concurrently fetch and analyze competitor pages safely (with SSRF protection).
    3. Generate structured brief with Gemini SDK.
    4. Deterministically audit against brand guidelines, forbidden terms, and intent.
    5. Return validated ContentBrief.
    """
    logger.info(f"Received brief generation request for keyword: '{request.keyword}'")

    # Step 1: Scrape competitor pages if provided
    competitor_results = []
    if request.competitor_urls:
        urls_to_fetch = [u.strip() for u in request.competitor_urls if u.strip()][: settings.max_competitor_urls]
        if urls_to_fetch:
            tasks = [fetch_competitor_page(u) for u in urls_to_fetch]
            competitor_results = await asyncio.gather(*tasks)

    # Step 2: Generate brief using Gemini with strict schema
    ai_output = await generate_brief_ai(request, competitor_results)

    # Step 3: Run deterministic Brand Guideline Audit
    brand_audit_result = audit_brief_against_brand_rules(
        request=request,
        suggested_h1=ai_output["suggested_h1"],
        title_options=ai_output["title_options"],
        outline=ai_output["outline"],
        meta_description=ai_output["meta_description_option"],
        call_to_action=ai_output["call_to_action"],
    )

    # Step 4: Assemble finalized brief
    brief = ContentBrief(
        keyword=request.keyword,
        target_audience=request.target_audience,
        search_intent=request.search_intent,
        content_type=request.content_type,
        tone=request.tone,
        recommended_total_word_count=ai_output["recommended_total_word_count"],
        meta_description_option=ai_output["meta_description_option"],
        suggested_h1=ai_output["suggested_h1"],
        title_options=ai_output["title_options"],
        outline=ai_output["outline"],
        questions_to_answer=ai_output["questions_to_answer"],
        related_subtopics=ai_output["related_subtopics"],
        call_to_action=ai_output["call_to_action"],
        evidence_checklist=ai_output["evidence_checklist"],
        internal_link_suggestions=ai_output["internal_link_suggestions"],
        competitor_insights=competitor_results,
        brand_audit=brand_audit_result,
        generation_metadata={
            "model_used": ai_output.get("model_used", settings.gemini_model),
            "execution_time_seconds": ai_output.get("execution_time_seconds", 0),
            "is_sample": False,
        },
    )

    return brief


@router.get("/sample", response_model=ContentBrief)
async def get_sample():
    """
    Returns a production-grade verified sample brief clearly marked as an example.
    Allows instant evaluation without API consumption.
    """
    return get_sample_brief()


@router.post("/audit", response_model=BrandAuditResult)
async def reaudit_brief(payload: dict):
    """
    Allows re-running the brand compliance audit on an edited brief.
    """
    try:
        request_data = payload.get("request", {})
        brief_data = payload.get("brief", {})

        req = BriefGenerationRequest(**request_data)
        brief = ContentBrief(**brief_data)

        return audit_brief_against_brand_rules(
            request=req,
            suggested_h1=brief.suggested_h1,
            title_options=brief.title_options,
            outline=brief.outline,
            meta_description=brief.meta_description_option,
            call_to_action=brief.call_to_action,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload for re-audit: {str(e)}")


@router.post("/export", response_model=ExportResponse)
async def export_brief(payload: ExportRequest):
    """
    Formats the brief into Markdown or JSON file string.
    """
    brief = payload.brief
    slug = brief.keyword.lower().replace(" ", "_")[:30]

    if payload.format == "markdown":
        content = brief_to_markdown(brief)
        filename = f"content_brief_{slug}.md"
    else:
        content = brief_to_json_export(brief)
        filename = f"content_brief_{slug}.json"

    return ExportResponse(
        format=payload.format,
        filename=filename,
        content=content,
    )
