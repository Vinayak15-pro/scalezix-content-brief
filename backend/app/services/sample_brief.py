from app.models.brief import (
    ContentBrief,
    TitleOption,
    OutlineSection,
    EvidenceItem,
    InternalLinkSuggestion,
    CompetitorPageResult,
    BrandAuditResult,
    BrandCheckItem,
    BriefGenerationRequest,
)

SAMPLE_REQUEST = BriefGenerationRequest(
    keyword="Product-Led Growth SEO Strategy",
    target_audience="B2B SaaS Growth Marketers, Heads of SEO, and Product Leaders",
    search_intent="informational",
    content_type="comprehensive_guide",
    tone="authoritative",
    brand_guidelines="Tone should be pragmatic, authoritative, and data-backed. Focus on sustainable flywheel mechanics rather than hacky growth tricks. Keep language clear and direct.",
    preferred_terminology=["product-led SEO", "user intent mapping", "self-serve flywheel", "product-qualified leads"],
    words_to_avoid=["guaranteed 100%", "hack your way", "cheap traffic", "overnight ranking"],
    competitor_urls=["https://example.com/competitor/plg-seo-guide"],
    competitor_reference_text="Competitors focus heavily on programmatic templates but lack technical teardowns of gated vs open indexable content.",
    verified_internal_urls=[
        "https://scalezix.com/case-studies/saas-organic-growth",
        "https://scalezix.com/blog/saas-keyword-intent-matrix",
        "https://scalezix.com/tools/content-brief-generator",
    ],
)


def get_sample_brief() -> ContentBrief:
    """
    Returns an authentic, curated example content brief clearly labeled as sample data.
    """
    return ContentBrief(
        id="sample_brief_plg_seo_2026",
        created_at="2026-10-27T12:00:00Z",
        keyword="Product-Led Growth SEO Strategy",
        target_audience="B2B SaaS Growth Marketers, Heads of SEO, and Product Leaders",
        search_intent="informational",
        content_type="comprehensive_guide",
        tone="authoritative",
        recommended_total_word_count=2800,
        suggested_h1="The Product-Led SEO Playbook: Turning Product Surfaces Into Organic Search Engines",
        meta_description_option="Discover how leading B2B SaaS companies use product-led SEO to build sustainable organic growth flywheels without sacrificing user experience.",
        title_options=[
            TitleOption(
                title="The Product-Led SEO Playbook: Scaling SaaS Organic Growth",
                angle_rationale="Authoritative comprehensive playbook targeting senior marketing leaders.",
                character_count=61,
            ),
            TitleOption(
                title="How to Build a Product-Led Growth SEO Engine (Teardowns & Frameworks)",
                angle_rationale="Practical, framework-driven approach emphasizing actionable teardowns.",
                character_count=71,
            ),
            TitleOption(
                title="Product-Led vs Traditional SEO: Why Product Surfaces Win in 2026",
                angle_rationale="Comparative thought leadership angle contrasting modern PLG with legacy content mills.",
                character_count=69,
            ),
            TitleOption(
                title="Programmatic Product-Led SEO: 5 Steps to Indexable Value",
                angle_rationale="Execution-oriented step-by-step angle for growth engineers and SEO practitioners.",
                character_count=60,
            ),
        ],
        outline=[
            OutlineSection(
                heading="1. What is Product-Led SEO (and Why Content-Only Models Stall)?",
                level="H2",
                section_purpose="Define product-led SEO, contrast it with traditional top-of-funnel blog posts, and demonstrate how product usage data fuels organic discovery.",
                target_word_count=500,
                key_talking_points=[
                    "Traditional content marketing vs product-driven organic indexing.",
                    "The mechanics of indexable product artifacts (templates, calculators, public boards).",
                    "How self-serve flywheels reduce customer acquisition cost (CAC).",
                ],
                questions_answered=[
                    "How does product-led SEO differ from traditional content marketing?",
                    "What makes a product feature indexable for search engines?",
                ],
                evidence_needs=[
                    "Cite comparative CAC data between sales-led and product-led SaaS motions (human verification needed).",
                ],
            ),
            OutlineSection(
                heading="2. The Three Archetypes of Product-Led Search Surfaces",
                level="H2",
                section_purpose="Deconstruct the primary architectural patterns successful SaaS brands use to capture organic intent.",
                target_word_count=750,
                key_talking_points=[
                    "Template Libraries: How Miro, Notion, and Canva dominate high-intent keywords.",
                    "Public Data Directories & Teardowns: G2, Zapier app directories, and Figma community pages.",
                    "Interactive Calculators & Tools: High-intent problem-solving utilities.",
                ],
                questions_answered=[
                    "Which product features generate the most search-driven signups?",
                    "How can engineering and marketing collaborate on programmatic landing pages?",
                ],
                evidence_needs=[
                    "Reference verified public page count statistics for leading template directories.",
                ],
            ),
            OutlineSection(
                heading="3. Designing Indexable Product Experiences Without Cannibalizing UX",
                level="H2",
                section_purpose="Provide actionable technical and UX safeguards to keep product-led pages user-friendly and crawlable.",
                target_word_count=600,
                key_talking_points=[
                    "Server-side rendering (SSR) requirements for product catalog pages.",
                    "Balancing gated content vs search bot discoverability.",
                    "Canonicalization and handling faceted navigation parameter bloat.",
                ],
                questions_answered=[
                    "Should product templates be ungated for Googlebot?",
                    "How do you prevent crawl budget waste on dynamic product paths?",
                ],
                evidence_needs=[
                    "Verify Google Search Central documentation on rendering JavaScript-heavy web applications.",
                ],
            ),
            OutlineSection(
                heading="4. Attribution & Measuring Product-Qualified Leads (PQLs) From Search",
                level="H2",
                section_purpose="Explain how growth teams track organic traffic downstream to product adoption and activation.",
                target_word_count=550,
                key_talking_points=[
                    "Moving beyond vanity traffic to product activation rate.",
                    "Tracking signups directly from interactive widgets vs editorial articles.",
                    "Attribution models suitable for hybrid self-serve and sales-assist cycles.",
                ],
                questions_answered=[
                    "How do you tie organic search rankings to SaaS revenue?",
                    "What metrics define a successful product-led SEO initiative?",
                ],
                evidence_needs=[
                    "Verify standard PQL conversion benchmarks from reputable SaaS survey data.",
                ],
            ),
            OutlineSection(
                heading="5. Step-by-Step Implementation Checklist for Growth Teams",
                level="H2",
                section_purpose="Summarize tactical next steps for launching a pilot product-led SEO experiment.",
                target_word_count=400,
                key_talking_points=[
                    "Audit existing product artifacts for indexability.",
                    "Map user intent keywords to existing customer workflows.",
                    "Ship an MVP template directory with 20 core use cases.",
                ],
                questions_answered=[
                    "Where should a team start with zero programmatic infrastructure?",
                ],
                evidence_needs=[
                    "Verify team bandwidth requirements for initial MVP rollout.",
                ],
            ),
        ],
        questions_to_answer=[
            "What is the difference between product-led SEO and traditional SEO?",
            "How do SaaS companies get organic traffic directly to product features?",
            "Can B2B enterprise software benefit from product-led search strategies?",
            "What are the best examples of programmatic template libraries?",
            "How do you track PQLs originating from organic search engine visits?",
        ],
        related_subtopics=[
            "Programmatic SEO",
            "Template Directory Architecture",
            "Product-Qualified Leads (PQLs)",
            "Self-Serve User Onboarding",
            "Faceted Navigation Indexing",
            "SaaS Organic CAC Reduction",
        ],
        call_to_action="Explore Scalezix's SaaS Intent Matrix to map your product surfaces against high-intent search queries.",
        evidence_checklist=[
            EvidenceItem(
                claim_or_fact="Customer Acquisition Cost (CAC) difference between product-led and sales-led companies.",
                required_source_type="Industry Benchmark Study (e.g. OpenView, Bessemer, or KeyBanc SaaS Survey).",
                human_verification_required=True,
                verification_guidance="Locate the exact published percentage difference from the latest annual SaaS benchmark report. Do not approximate.",
            ),
            EvidenceItem(
                claim_or_fact="Googlebot rendering limitations for client-side rendered Single Page Applications (SPAs).",
                required_source_type="Official Google Search Central Technical Documentation.",
                human_verification_required=True,
                verification_guidance="Link directly to Google Search Central's guide on JavaScript SEO and hydration best practices.",
            ),
            EvidenceItem(
                claim_or_fact="Conversion benchmarks for template-based landing pages vs standard blog posts.",
                required_source_type="Verified Case Study or Primary Analytics Telemetry.",
                human_verification_required=True,
                verification_guidance="Ensure any quoted conversion percentage cites a named SaaS company case study with published dates.",
            ),
        ],
        internal_link_suggestions=[
            InternalLinkSuggestion(
                url="https://scalezix.com/blog/saas-keyword-intent-matrix",
                recommended_anchor_text="SaaS keyword intent matrix",
                target_section="1. What is Product-Led SEO (and Why Content-Only Models Stall)?",
                relevance_reason="Helps readers categorize search intent before selecting which product artifacts to index.",
            ),
            InternalLinkSuggestion(
                url="https://scalezix.com/case-studies/saas-organic-growth",
                recommended_anchor_text="proven organic SaaS growth case study",
                target_section="2. The Three Archetypes of Product-Led Search Surfaces",
                relevance_reason="Provides real-world evidence of traffic and revenue gains from product-driven indexing.",
            ),
            InternalLinkSuggestion(
                url="https://scalezix.com/tools/content-brief-generator",
                recommended_anchor_text="AI content brief generator",
                target_section="5. Step-by-Step Implementation Checklist for Growth Teams",
                relevance_reason="Equips editorial writers with a direct tool to execute briefs for programmatic topics.",
            ),
        ],
        competitor_insights=[
            CompetitorPageResult(
                url="https://example.com/competitor/plg-seo-guide",
                status="manual_input",
                title="The PLG SEO Guide: How to Scale SaaS Content",
                meta_description="A standard guide on writing blogs for product-led SaaS companies.",
                h1_headings=["The PLG SEO Guide: How to Scale SaaS Content"],
                h2_headings=[
                    "What is PLG?",
                    "Why Writing Blogs Still Matters",
                    "Choosing Keywords for SaaS",
                    "Summary and Next Steps",
                ],
                key_topics=["Content Calendars", "Blog Optimization", "Keyword Research"],
                word_count=1650,
                error_message=None,
            )
        ],
        brand_audit=BrandAuditResult(
            compliance_score=95,
            overall_status="passed",
            items=[
                BrandCheckItem(
                    rule_name="Forbidden Terms Compliance",
                    category="forbidden_term",
                    status="pass",
                    details="All 4 prohibited terms ('guaranteed 100%', 'hack your way', 'cheap traffic', 'overnight ranking') were completely avoided.",
                    suggestion=None,
                ),
                BrandCheckItem(
                    rule_name="Preferred Terminology Adoption",
                    category="terminology_usage",
                    status="pass",
                    details="Successfully integrated preferred terms: product-led SEO, user intent mapping, self-serve flywheel, product-qualified leads.",
                    suggestion=None,
                ),
                BrandCheckItem(
                    rule_name="Evidence-First Tone Check",
                    category="tone_alignment",
                    status="pass",
                    details="No unverified marketing superlatives detected. All quantitative statements assigned to Evidence Checklist.",
                    suggestion=None,
                ),
                BrandCheckItem(
                    rule_name="Search Intent Alignment",
                    category="intent_match",
                    status="pass",
                    details="Informational search intent is matched with foundational concepts, architectural patterns, and actionable teardowns.",
                    suggestion=None,
                ),
            ],
            summary="Content brief demonstrates high brand adherence, avoids forbidden superlatives, and structures rigorous evidence verification.",
        ),
        generation_metadata={
            "is_sample": True,
            "sample_label": "Verified Example Brief (Product-Led SEO)",
            "model_used": "curated-production-baseline",
            "execution_time_seconds": 0.05,
        },
    )
