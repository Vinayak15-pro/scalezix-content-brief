import ipaddress
import socket
import logging
from typing import Tuple, List, Optional
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
import trafilatura

from app.models.brief import CompetitorPageResult
from app.config import settings

logger = logging.getLogger(__name__)

# Cloud metadata addresses to explicitly block
BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "169.254.169.254",
    "instance-data",
}


def is_safe_url(url_str: str) -> Tuple[bool, str]:
    """
    Validates URL safety against SSRF attacks:
    - Only HTTP and HTTPS
    - Resolves DNS and blocks private/loopback/link-local/cloud metadata IPs
    """
    try:
        parsed = urlparse(url_str.strip())
        if parsed.scheme.lower() not in ("http", "https"):
            return False, f"Unsupported protocol '{parsed.scheme}'. Only HTTP and HTTPS are allowed."

        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid URL: missing hostname."

        hostname_lower = hostname.lower()
        if hostname_lower in BLOCKED_HOSTNAMES or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal"):
            return False, f"Access to '{hostname}' is restricted for security."

        # Resolve IP addresses to prevent DNS rebinding / private network access
        try:
            addr_info = socket.getaddrinfo(hostname, None)
        except socket.gaierror as e:
            return False, f"Could not resolve hostname '{hostname}': {str(e)}"

        for family, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            try:
                ip_obj = ipaddress.ip_address(ip_str)
                if ip_obj.is_private:
                    return False, f"URL resolves to private network IP ({ip_str}), which is blocked for security."
                if ip_obj.is_loopback:
                    return False, f"URL resolves to loopback IP ({ip_str}), which is blocked for security."
                if ip_obj.is_link_local:
                    return False, f"URL resolves to link-local IP ({ip_str}), which is blocked for security."
                if ip_obj.is_reserved:
                    return False, f"URL resolves to reserved IP ({ip_str}), which is blocked for security."
                if ip_obj.is_multicast:
                    return False, f"URL resolves to multicast IP ({ip_str}), which is blocked for security."
                # AWS / GCP / Azure metadata endpoint check
                if str(ip_obj) == "169.254.169.254":
                    return False, "Access to cloud metadata IP is blocked."
            except ValueError:
                return False, f"Invalid resolved IP address: {ip_str}"

        return True, ""
    except Exception as e:
        return False, f"URL validation error: {str(e)}"


async def fetch_competitor_page(url: str) -> CompetitorPageResult:
    """
    Safely fetches a competitor webpage, re-validating redirects,
    enforcing response size limits, and parsing headings and topics without fabricating.
    """
    url_cleaned = url.strip()
    safe, reason = is_safe_url(url_cleaned)
    if not safe:
        return CompetitorPageResult(
            url=url_cleaned,
            status="blocked_ssrf",
            error_message=f"SSRF Protection: {reason}",
        )

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ContentBriefBot/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    current_url = url_cleaned
    max_redirects = 4
    redirect_count = 0

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds, follow_redirects=False) as client:
            while redirect_count <= max_redirects:
                # Re-validate every step of redirect
                safe, reason = is_safe_url(current_url)
                if not safe:
                    return CompetitorPageResult(
                        url=url_cleaned,
                        status="blocked_ssrf",
                        error_message=f"Redirect destination blocked: {reason}",
                    )

                response = await client.get(current_url, headers=headers)

                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location:
                        return CompetitorPageResult(
                            url=url_cleaned,
                            status="failed",
                            error_message="Redirect received without Location header.",
                        )
                    # Resolve relative redirect
                    from urllib.parse import urljoin
                    current_url = urljoin(current_url, location)
                    redirect_count += 1
                    continue

                if response.status_code >= 400:
                    return CompetitorPageResult(
                        url=url_cleaned,
                        status="failed",
                        error_message=f"HTTP {response.status_code}: Unable to access competitor page.",
                    )

                content_type = response.headers.get("content-type", "").lower()
                if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
                    return CompetitorPageResult(
                        url=url_cleaned,
                        status="failed",
                        error_message=f"Unsupported content type '{content_type}'. Only HTML pages can be analyzed.",
                    )

                html_content = response.text
                if len(html_content) > settings.max_page_download_bytes:
                    html_content = html_content[: settings.max_page_download_bytes]

                return parse_html_content(url_cleaned, html_content)

            return CompetitorPageResult(
                url=url_cleaned,
                status="failed",
                error_message="Too many redirects encountered.",
            )

    except httpx.TimeoutException:
        return CompetitorPageResult(
            url=url_cleaned,
            status="timeout",
            error_message="Request timed out while connecting to competitor page.",
        )
    except httpx.RequestError as e:
        return CompetitorPageResult(
            url=url_cleaned,
            status="failed",
            error_message=f"Network error: {str(e)}",
        )
    except Exception as e:
        return CompetitorPageResult(
            url=url_cleaned,
            status="failed",
            error_message=f"Extraction error: {str(e)}",
        )


def parse_html_content(url: str, html_content: str) -> CompetitorPageResult:
    """
    Extracts deterministic page title, meta description, H1, H2, H3 headings,
    and calculates body word count using BeautifulSoup and Trafilatura.
    """
    soup = BeautifulSoup(html_content, "html.parser")

    # Title
    title = None
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    # Meta description
    meta_desc = None
    meta_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    if meta_tag and meta_tag.get("content"):
        meta_desc = meta_tag.get("content").strip()

    # Headings extraction
    h1_list = [h.get_text(strip=True) for h in soup.find_all("h1") if h.get_text(strip=True)][:5]
    h2_list = [h.get_text(strip=True) for h in soup.find_all("h2") if h.get_text(strip=True)][:15]
    h3_list = [h.get_text(strip=True) for h in soup.find_all("h3") if h.get_text(strip=True)][:20]

    # Body text and word count via trafilatura
    main_text = trafilatura.extract(html_content, include_comments=False, include_tables=False)
    word_count = None
    key_topics: List[str] = []

    if main_text:
        words = main_text.split()
        word_count = len(words)

    # Derive key topics from headings
    for h in h2_list[:6]:
        cleaned = h.split("?")[0].split(":")[0].strip()
        if len(cleaned) > 4 and cleaned not in key_topics:
            key_topics.append(cleaned)

    return CompetitorPageResult(
        url=url,
        status="success",
        title=title,
        meta_description=meta_desc,
        h1_headings=h1_list,
        h2_headings=h2_list,
        h3_headings=h3_list,
        key_topics=key_topics,
        word_count=word_count,
    )
