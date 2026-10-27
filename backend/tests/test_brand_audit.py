import pytest
from app.models.brief import BriefGenerationRequest, TitleOption, OutlineSection
from app.services.brand_audit import audit_brief_against_brand_rules


def test_brand_audit_detects_forbidden_words():
    req = BriefGenerationRequest(
        keyword="Enterprise Cloud Security",
        target_audience="DevSecOps Leaders",
        words_to_avoid=["cheap solution", "hack your way"],
        preferred_terminology=["zero-trust architecture"],
    )

    titles = [
        TitleOption(
            title="The Cheap Solution for Enterprise Cloud Security",
            angle_rationale="Budget angle",
            character_count=49,
        )
    ]
    outline = [
        OutlineSection(
            heading="Why Cheap Solutions Fail",
            level="H2",
            section_purpose="Analysis of legacy approaches",
            target_word_count=400,
            key_talking_points=["Avoid cheap solutions when configuring firewalls"],
            questions_answered=[],
            evidence_needs=[],
        )
    ]

    result = audit_brief_against_brand_rules(
        request=req,
        suggested_h1="How to Implement Cloud Security",
        title_options=titles,
        outline=outline,
        meta_description="Guide to enterprise security",
        call_to_action="Contact our team",
    )

    assert result.overall_status == "needs_revision"
    assert result.compliance_score < 80
    assert any("cheap solution" in item.rule_name.lower() and item.status == "violation" for item in result.items)


def test_brand_audit_passes_compliant_brief():
    req = BriefGenerationRequest(
        keyword="Zero-Trust Architecture",
        target_audience="Chief Information Security Officers",
        words_to_avoid=["guaranteed 100%"],
        preferred_terminology=["least privilege", "continuous verification"],
    )

    titles = [
        TitleOption(
            title="Zero-Trust Architecture Guide: Practical Implementation",
            angle_rationale="Authoritative engineering guide",
            character_count=55,
        )
    ]
    outline = [
        OutlineSection(
            heading="Understanding Least Privilege and Continuous Verification",
            level="H2",
            section_purpose="Foundational overview of core zero-trust principles",
            target_word_count=500,
            key_talking_points=["Enforcing least privilege", "Implementing continuous verification"],
            questions_answered=["What is least privilege?"],
            evidence_needs=[],
        )
    ]

    result = audit_brief_against_brand_rules(
        request=req,
        suggested_h1="Zero-Trust Architecture Guide for CISOs",
        title_options=titles,
        outline=outline,
        meta_description="Comprehensive guide on implementing zero-trust architectures.",
        call_to_action="Explore our technical reference architecture.",
    )

    assert result.overall_status == "passed"
    assert result.compliance_score >= 85
    assert not any(item.status == "violation" for item in result.items)
