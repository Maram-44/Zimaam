"""Runtime settings (override with environment variables)."""
import os
from dataclasses import dataclass, field


def _f(name, default):
    return float(os.getenv(name, default))


@dataclass
class Settings:
    db_path: str = os.getenv("SIAAJ_DB", ":memory:")
    # "live"     = enforcement checks the source-of-truth ACL at query time (strong)
    # "snapshot" = enforcement uses an ACL copy taken at indexing time (the weak design)
    acl_mode: str = os.getenv("SIAAJ_ACL_MODE", "live")
    embedder: str = os.getenv("SIAAJ_EMBEDDER", "tfidf")        # tfidf | st
    st_model: str = os.getenv("SIAAJ_ST_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")
    retrieve_threshold: float = _f("SIAAJ_RETRIEVE_T", 0.15)     # min similarity to answer from a doc
    proximity_threshold: float = _f("SIAAJ_PROX_T", 0.30)        # min similarity to log "close to a protected doc" (calibrated: scripts/calibrate.py)
    window_days: float = _f("SIAAJ_WINDOW_DAYS", 3)
    default_threshold: int = int(os.getenv("SIAAJ_THRESHOLD", "4"))   # close-to-protected events per window
    role_thresholds: dict = field(default_factory=dict)         # e.g. {"finance": 6}
    query_salt: str = os.getenv("SIAAJ_SALT", "change-me")
    admin_token: str = os.getenv("SIAAJ_ADMIN_TOKEN", "dev-admin")   # legacy /admin endpoints (not mounted in public mode)
    debug_responses: bool = os.getenv("SIAAJ_DEBUG", "1") == "1"     # legacy /query only; never in public mode
    # --- public demo (each visitor gets an isolated sandbox) ---
    session_ttl_minutes: float = _f("SIAAJ_SESSION_TTL_MIN", 90)
    max_sessions: int = int(os.getenv("SIAAJ_MAX_SESSIONS", "300"))
    rate_per_minute: int = int(os.getenv("SIAAJ_RATE_PER_MIN", "240"))   # requests per session/IP per minute
    cors_origins: tuple = tuple(x for x in os.getenv("SIAAJ_CORS", "*").split(",") if x)
    max_query_chars: int = 500
