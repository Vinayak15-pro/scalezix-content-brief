import json
from app.models.brief import ContentBrief


def brief_to_markdown(brief: ContentBrief) -> str:
    """
    Renders a ContentBrief object into clean, readable GitHub-flavored Markdown.
    """
    lines = []

    # Header & Meta
    lines.append(f"# Content Brief: {brief.keyword}")
    lines.append("")
    lines.append(f"> **Target Audience:** {brief.target_audience}  ")
    lines.append(f"> **Search Intent:** {brief.search_intent.capitalize()} | **Content Type:** {brief.content_type.replace('_', ' ').capitalize()} | **Tone:** {brief.tone.replace('_', ' ').capitalize()}  ")
    lines.append(f"> **Target Word Count:** ~{brief.recommended_total_word_count:,} words | **Generated:** {brief.created_at}")
    lines.append("")

    # Meta Description
    lines.append("## Suggested Meta Description")
    lines.append(f"_{brief.meta_description_option}_")
    lines.append("")

    # Suggested H1 & Title Options
    lines.append("## Title & H1 Options")
    lines.append(f"**Recommended H1:** `{brief.suggested_h1}`")
    lines.append("")
    lines.append("### Alternative Title Angles")
    for idx, opt in enumerate(brief.title_options, 1):
        lines.append(f"{idx}. **{opt.title}** ({opt.character_count} chars)")
        lines.append(f"   - *Angle Rationale:* {opt.angle_rationale}")
    lines.append("")

    # Structured Outline
    lines.append("## Structured Content Outline")
    for sec in brief.outline:
        prefix = "###" if sec.level == "H2" else "####"
        lines.append(f"{prefix} {sec.heading} (~{sec.target_word_count} words)")
        lines.append(f"**Section Purpose:** {sec.section_purpose}")
        lines.append("")
        if sec.key_talking_points:
            lines.append("**Key Talking Points:**")
            for pt in sec.key_talking_points:
                lines.append(f"- {pt}")
            lines.append("")
        if sec.questions_answered:
            lines.append("**Questions Addressed:**")
            for q in sec.questions_answered:
                lines.append(f"- *{q}*")
            lines.append("")
        if sec.evidence_needs:
            lines.append("**Evidence / Benchmark Needs:**")
            for ev in sec.evidence_needs:
                lines.append(f"- ⚠️ {ev}")
            lines.append("")

    # Questions Content Must Answer
    if brief.questions_to_answer:
        lines.append("## Key Search Questions to Answer (FAQ)")
        for q in brief.questions_to_answer:
            lines.append(f"- [ ] {q}")
        lines.append("")

    # Related Subtopics
    if brief.related_subtopics:
        lines.append("## Semantic Subtopics & Entities")
        lines.append(", ".join([f"`{t}`" for t in brief.related_subtopics]))
        lines.append("")

    # Evidence Requirements & Fact Verification Checklist
    lines.append("## Evidence & Fact Verification Checklist")
    lines.append("_Strict Rule: Do not invent claims or statistics. Every item below requires human verification._")
    lines.append("")
    lines.append("| Claim / Assertion | Required Source Type | Verification Guidance | Human Check |")
    lines.append("| :--- | :--- | :--- | :---: |")
    for ev in brief.evidence_checklist:
        claim_clean = ev.claim_or_fact.replace("|", "/")
        source_clean = ev.required_source_type.replace("|", "/")
        guide_clean = ev.verification_guidance.replace("|", "/")
        lines.append(f"| {claim_clean} | {source_clean} | {guide_clean} | [ ] Required |")
    lines.append("")

    # Verified Internal Links
    lines.append("## Verified Internal Link Recommendations")
    if brief.internal_link_suggestions:
        lines.append("| Recommended Anchor Text | Destination URL | Section Target | Relevance Rationale |")
        lines.append("| :--- | :--- | :--- | :--- |")
        for link in brief.internal_link_suggestions:
            lines.append(f"| `{link.recommended_anchor_text}` | [{link.url}]({link.url}) | {link.target_section} | {link.relevance_reason} |")
    else:
        lines.append("_No internal URLs were provided for linking or no contextual matches were found._")
    lines.append("")

    # Competitor Insights
    lines.append("## Competitor Headings & Real Insights")
    if brief.competitor_insights:
        for comp in brief.competitor_insights:
            lines.append(f"### Competitor Source: [{comp.url}]({comp.url})")
            lines.append(f"- **Extraction Status:** `{comp.status.upper()}`")
            if comp.title:
                lines.append(f"- **Page Title:** {comp.title}")
            if comp.word_count:
                lines.append(f"- **Estimated Word Count:** ~{comp.word_count:,} words")
            if comp.h2_headings:
                lines.append(f"- **Extracted H2s:** {'; '.join(comp.h2_headings[:6])}")
            if comp.error_message:
                lines.append(f"- **Extraction Note:** {comp.error_message}")
            lines.append("")
    else:
        lines.append("_No competitor URLs were provided or analyzed for this brief._")
        lines.append("")

    # Call to Action
    if brief.call_to_action:
        lines.append("## Call to Action (CTA)")
        lines.append(f"> {brief.call_to_action}")
        lines.append("")

    # Brand Audit
    lines.append("## Brand Consistency & Guideline Audit")
    lines.append(f"**Compliance Score:** {brief.brand_audit.compliance_score}/100 (`{brief.brand_audit.overall_status.upper()}`)")
    lines.append(f"**Summary:** {brief.brand_audit.summary}")
    lines.append("")
    for item in brief.brand_audit.items:
        icon = "✅" if item.status == "pass" else ("⚠️" if item.status == "warning" else "❌")
        lines.append(f"- {icon} **{item.rule_name}** ({item.category}): {item.details}")
        if item.suggestion:
            lines.append(f"  - *Recommendation:* {item.suggestion}")
    lines.append("")

    return "\n".join(lines)


def brief_to_json_export(brief: ContentBrief) -> str:
    """
    Serializes a ContentBrief object into a clean indented JSON string.
    """
    return json.dumps(brief.model_dump(), indent=2)
