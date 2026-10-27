import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.sample_brief import get_sample_brief
from app.services.export_service import brief_to_markdown, brief_to_json_export

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "gemini_model" in data
    assert "api_key_configured" in data


def test_sample_brief_endpoint():
    response = client.get("/api/briefs/sample")
    assert response.status_code == 200
    brief = response.json()
    assert brief["keyword"] == "Product-Led Growth SEO Strategy"
    assert len(brief["title_options"]) > 0
    assert len(brief["outline"]) > 0
    assert len(brief["evidence_checklist"]) > 0
    assert brief["generation_metadata"]["is_sample"] is True


def test_export_endpoint_markdown_and_json():
    sample = get_sample_brief()
    payload = {"brief": sample.model_dump(), "format": "markdown"}

    res_md = client.post("/api/briefs/export", json=payload)
    assert res_md.status_code == 200
    data_md = res_md.json()
    assert data_md["format"] == "markdown"
    assert "# Content Brief:" in data_md["content"]
    assert "Evidence & Fact Verification Checklist" in data_md["content"]

    payload["format"] = "json"
    res_json = client.post("/api/briefs/export", json=payload)
    assert res_json.status_code == 200
    data_json = res_json.json()
    assert data_json["format"] == "json"
    assert "sample_brief_plg_seo_2026" in data_json["content"]


def test_validation_rejects_empty_keyword():
    response = client.post(
        "/api/briefs/generate",
        json={"keyword": "", "target_audience": "B2B SaaS Marketers"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_generate_brief_with_mocked_ai():
    mock_ai_output = {
        "recommended_total_word_count": 2200,
        "meta_description_option": "An in-depth guide on modern content marketing strategies.",
        "suggested_h1": "The Ultimate 2026 Content Marketing Playbook",
        "title_options": [
            {
                "title": "The Ultimate 2026 Content Marketing Playbook",
                "angle_rationale": "Comprehensive guide angle",
                "character_count": 42,
            }
        ],
        "outline": [
            {
                "heading": "1. Foundations of Modern Content Strategy",
                "level": "H2",
                "section_purpose": "Explain core shifts in organic audience behavior.",
                "target_word_count": 500,
                "key_talking_points": ["Understanding user journey", "Mapping search intent"],
                "questions_answered": ["How to structure content for search intent?"],
                "evidence_needs": ["Industry adoption percentage"],
            }
        ],
        "questions_to_answer": ["What is modern content marketing?"],
        "related_subtopics": ["Editorial Workflow", "Content Quality"],
        "call_to_action": "Download the complete content template.",
        "evidence_checklist": [
            {
                "claim_or_fact": "Adoption rate of structured content workflows.",
                "required_source_type": "State of Marketing Survey.",
                "human_verification_required": True,
                "verification_guidance": "Check latest annual survey data.",
            }
        ],
        "internal_link_suggestions": [
            {
                "url": "https://company.com/blog/editorial-standards",
                "recommended_anchor_text": "editorial quality standards",
                "target_section": "1. Foundations of Modern Content Strategy",
                "relevance_reason": "Direct reference for internal content standards.",
            }
        ],
        "model_used": "gemini-3.5-flash",
        "execution_time_seconds": 1.1,
    }

    with patch("app.routes.briefs.generate_brief_ai", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_ai_output

        req_payload = {
            "keyword": "Content Marketing Strategy",
            "target_audience": "VP of Marketing and Content Directors",
            "search_intent": "informational",
            "content_type": "comprehensive_guide",
            "tone": "authoritative",
            "words_to_avoid": ["magic trick"],
            "verified_internal_urls": ["https://company.com/blog/editorial-standards"],
        }

        response = client.post("/api/briefs/generate", json=req_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["keyword"] == "Content Marketing Strategy"
        assert data["suggested_h1"] == "The Ultimate 2026 Content Marketing Playbook"
        assert len(data["internal_link_suggestions"]) == 1
        assert data["internal_link_suggestions"][0]["url"] == "https://company.com/blog/editorial-standards"
        assert data["brand_audit"]["compliance_score"] >= 85
