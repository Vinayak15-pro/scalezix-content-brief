import sys
import os

# Add backend directory to sys.path so app modules are resolvable
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "backend"))

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app

# Expose app for Vercel Python runtime
__all__ = ["app"]
