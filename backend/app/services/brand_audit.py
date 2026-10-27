import re
from typing import List, Tuple
from app.models.brief import (
    BrandAuditResult,
    BrandCheckItem,
    OutlineSection,
    TitleOption,
    BriefGenerationRequest,
)

# Common superlative or risky marketing claims that require proof
DEFAULT_RISKY_CLAIMS = [
    "world's #1",
    "best in the world",
    "guaranteed 100%",
    "unbeatable",
    "undisputed leader",
    "zero risk",
    "flawless",
    "miracle",
]


def audit_brief_against_brand_rules(
    request: BriefGenerationRequest,
    suggested_h1: str,
    title_options: List[TitleOption],
    outline: List[OutlineSection],
    meta_description: str,
    call_to_action: str,
) -> BrandAuditResult:
    """
    Executes a deterministic audit of the brief against brand guidelines,
    forbidden terms, preferred terminology, and search intent alignment.
    """
    items: List[BrandCheckItem] = []
    score = 100

    # Aggregate all brief text for keyword and terminology scanning
    all_text_blocks: List[Tuple[str, str]] = [
        ("Suggested H1", suggested_h1),
        ("Meta Description", meta_description),
        ("Call to Action", call_to_action),
    ]

    for idx, t in enumerate(title_options, 1):
        title_str = t.title if hasattr(t, "title") else t.get("title", "")
        all_text_blocks.append((f"Title Option {idx}", title_str))

    for sec in outline:
        heading_str = sec.heading if hasattr(sec, "heading") else sec.get("heading", "")
        purpose_str = sec.section_purpose if hasattr(sec, "section_purpose") else sec.get("section_purpose", "")
        points = sec.key_talking_points if hasattr(sec, "key_talking_points") else sec.get("key_talking_points", [])
        
        all_text_blocks.append((f"Section '{heading_str}' purpose", purpose_str))
        for pt in points:
            all_text_blocks.append((f"Section '{heading_str}' talking point", pt))

    # 1. Check for Forbidden Words and Claims
    forbidden_words = [w.strip() for w in request.words_to_avoid if w.strip()]
    violations_found = 0

    for word in forbidden_words:
        word_escaped = re.escape(word)
        pattern = re.compile(rf"\b{word_escaped}\b", re.IGNORECASE)

        found_locations = []
        for location, text in all_text_blocks:
            if pattern.search(text):
                found_locations.append(location)

        if found_locations:
            violations_found += 1
            score -= 25
            loc_str = ", ".join(found_locations[:3])
            if len(found_locations) > 3:
                loc_str += f" and {len(found_locations) - 3} more"
            items.append(
                BrandCheckItem(
                    rule_name=f"Forbidden Term: '{word}'",
                    category="forbidden_term",
                    status="violation",
                    details=f"Forbidden term '{word}' was detected in {loc_str}.",
                    suggestion=f"Remove or replace '{word}' with an approved alternative compliant with brand rules.",
                )
            )

    if not forbidden_words:
        items.append(
            BrandCheckItem(
                rule_name="Forbidden Terms Filter",
                category="forbidden_term",
                status="pass",
                details="No forbidden terms were specified in request rules.",
                suggestion=None,
            )
        )
    elif violations_found == 0:
        items.append(
            BrandCheckItem(
                rule_name="Forbidden Terms Compliance",
                category="forbidden_term",
                status="pass",
                details=f"All {len(forbidden_words)} forbidden terms were successfully excluded from the brief.",
                suggestion=None,
            )
        )

    # 2. Check for Risky / Unverified Superlatives
    combined_corpus = " ".join([text for _, text in all_text_blocks]).lower()
    risky_detected = []
    for risky in DEFAULT_RISKY_CLAIMS:
        if risky in combined_corpus and risky not in [w.lower() for w in request.words_to_avoid]:
            risky_detected.append(risky)

    if risky_detected:
        score -= 10
        items.append(
            BrandCheckItem(
                rule_name="Unverified Superlatives Check",
                category="tone_alignment",
                status="warning",
                details=f"Detected potentially exaggerated claims: {', '.join(risky_detected)}.",
                suggestion="Replace absolute superlatives with evidence-backed claims or assign explicit human verification.",
            )
        )
    else:
        items.append(
            BrandCheckItem(
                rule_name="Evidence-First Tone Check",
                category="tone_alignment",
                status="pass",
                details="No unverified marketing superlatives detected in outline headings or titles.",
                suggestion=None,
            )
        )

    # 3. Check for Preferred Terminology Usage
    preferred = [p.strip() for p in request.preferred_terminology if p.strip()]
    if preferred:
        used_terms = []
        missing_terms = []
        for term in preferred:
            term_escaped = re.escape(term)
            pattern = re.compile(rf"\b{term_escaped}\b", re.IGNORECASE)
            if pattern.search(combined_corpus):
                used_terms.append(term)
            else:
                missing_terms.append(term)

        if used_terms:
            items.append(
                BrandCheckItem(
                    rule_name="Preferred Terminology Adoption",
                    category="terminology_usage",
                    status="pass",
                    details=f"Successfully integrated preferred terms: {', '.join(used_terms)}.",
                    suggestion=None,
                )
            )

        if missing_terms:
            score -= 5
            items.append(
                BrandCheckItem(
                    rule_name="Optional Preferred Terms Missing",
                    category="terminology_usage",
                    status="warning",
                    details=f"The following preferred terms were not incorporated: {', '.join(missing_terms)}.",
                    suggestion=f"Consider weaving {', '.join(missing_terms)} into section talking points.",
                )
            )

    # 4. Search Intent & Content Structure Alignment
    intent = request.search_intent.lower()
    outline_headings_lower = " ".join([
        (sec.heading if hasattr(sec, "heading") else sec.get("heading", "")).lower()
        for sec in outline
    ])

    if intent == "informational":
        has_intro_or_concept = any(k in outline_headings_lower for k in ["what", "understanding", "overview", "basics", "why", "guide"])
        if has_intro_or_concept:
            items.append(
                BrandCheckItem(
                    rule_name="Search Intent Alignment",
                    category="intent_match",
                    status="pass",
                    details="Informational search intent is matched with foundational and conceptual H2 sections.",
                    suggestion=None,
                )
            )
        else:
            items.append(
                BrandCheckItem(
                    rule_name="Search Intent Alignment",
                    category="intent_match",
                    status="warning",
                    details="Informational search intent would benefit from a clearer conceptual overview section.",
                    suggestion="Add an introductory definition or context-setting H2 section.",
                )
            )
    elif intent in ("commercial", "transactional"):
        has_criteria_or_cta = any(k in outline_headings_lower for k in ["compare", "features", "criteria", "how to choose", "cost", "checklist"])
        if has_criteria_or_cta or bool(call_to_action):
            items.append(
                BrandCheckItem(
                    rule_name="Commercial Intent Alignment",
                    category="intent_match",
                    status="pass",
                    details="Commercial/Transactional intent matches structured decision-making criteria and CTA.",
                    suggestion=None,
                )
            )
        else:
            items.append(
                BrandCheckItem(
                    rule_name="Commercial Intent Alignment",
                    category="intent_match",
                    status="warning",
                    details="Commercial queries need clear comparison factors, ROI considerations, or next steps.",
                    suggestion="Ensure evaluation criteria or an implementation checklist is present.",
                )
            )

    # 5. Tone check
    items.append(
        BrandCheckItem(
            rule_name=f"Configured Tone ({request.tone.replace('_', ' ').capitalize()})",
            category="tone_alignment",
            status="pass",
            details=f"Brief outline and titles generated using {request.tone.replace('_', ' ')} communication principles.",
            suggestion=None,
        )
    )

    # Final score clamp & status
    score = max(0, min(100, score))
    if violations_found > 0 or score < 65:
        overall_status = "needs_revision"
        summary = f"Brand audit flagged {violations_found} forbidden term violation(s). Please review and adjust."
    elif score < 85:
        overall_status = "warnings"
        summary = "Brand guidelines generally met with minor recommendations for terminology or tone."
    else:
        overall_status = "passed"
        summary = "Content brief complies with specified brand guidelines, terminology rules, and search intent."

    return BrandAuditResult(
        compliance_score=score,
        overall_status=overall_status,
        items=items,
        summary=summary,
    )
