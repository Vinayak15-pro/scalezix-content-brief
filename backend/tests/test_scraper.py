import pytest
from app.services.scraper import is_safe_url


def test_safe_url_validation():
    # Valid external public URLs
    assert is_safe_url("https://example.com/blog/test-article")[0] is True
    assert is_safe_url("http://google.com")[0] is True

    # Blocked schemes
    assert is_safe_url("file:///etc/passwd")[0] is False
    assert is_safe_url("ftp://ftp.example.com")[0] is False
    assert is_safe_url("javascript:alert(1)")[0] is False

    # Blocked local and private hosts
    assert is_safe_url("http://localhost:8000")[0] is False
    assert is_safe_url("http://127.0.0.1:3000")[0] is False
    assert is_safe_url("http://127.0.0.1/admin")[0] is False
    assert is_safe_url("http://10.0.0.1")[0] is False
    assert is_safe_url("http://192.168.1.1")[0] is False
    assert is_safe_url("http://172.16.0.1")[0] is False

    # Blocked cloud metadata
    assert is_safe_url("http://169.254.169.254/latest/meta-data")[0] is False
    assert is_safe_url("http://metadata.google.internal")[0] is False
