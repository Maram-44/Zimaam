"""Public demo API: one isolated sandbox per visitor (header X-Session-Id), a simulated clock, and one call
that returns both views (what the employee sees / what the security team sees). Synthetic data only."""
import threading, time
from collections import defaultdict, deque
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field
from .audit import boundary_audit
from .cases import build_case
from .corpus import DOCS, ROLE_DOCS
from .detector import build_alerts, window_counts
from .sessions import SessionManager


class Limiter:
    def __init__(self, limit, window=60.0):
        self.limit, self.window, self.hits, self.lock = limit, window, defaultdict(deque), threading.Lock()

    def check(self, key):
        now = time.time()
        with self.lock:
            q = self.hits[key]
            while q and now - q[0] > self.window:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(now)
            return True


class AskIn(BaseModel):
    user_id: str = Field(min_length=1, max_length=20)
    query: str = Field(min_length=1)
    advance_minutes: int = Field(default=25, ge=0, le=4320)


class ModeIn(BaseModel):
    acl_mode: str = Field(pattern="^(live|snapshot)$")


class RevokeIn(BaseModel):
    user_id: str = Field(min_length=1, max_length=20)
    doc_id: str = Field(min_length=1, max_length=20)


class SyncIn(BaseModel):
    advance_minutes: int = Field(default=15, ge=0, le=1440)


def state_of(s, settings):
    return {
        "users": [{"id": u, "role": s.acl.role[u]} for u in s.acl.users()],
        "docs": [{"id": d, "title": i["title"], "sensitive": i["sensitive"]} for d, i in DOCS.items()],
        "acl_truth": {u: sorted(s.acl.allowed(u, "live")) for u in s.acl.users()},
        "acl_enforced": {u: sorted(s.acl.allowed(u, s.gw.mode)) for u in s.acl.users()},
        "mode": s.gw.mode, "window_days": settings.window_days,
        "counters": window_counts(s.store, settings, s.clock),
        "alerts": build_alerts(s.store, settings, s.clock),
        "events_total": s.store.count(), "clock": s.clock,
        "pending_revocations": len(s.acl.pending),
    }


def make_router(settings, engine):
    mgr, r = SessionManager(settings, engine), APIRouter(prefix="/api")
    by_ip, by_sid = Limiter(settings.rate_per_minute), Limiter(settings.rate_per_minute)

    def session(request: Request, sid: str):
        ip = (request.headers.get("x-forwarded-for", "").split(",")[0].strip()
              or (request.client.host if request.client else "?"))
        if not by_ip.check(ip) or not by_sid.check(sid or ip):
            raise HTTPException(429, "Too many requests. Wait a minute and try again.")
        try:
            return mgr.get(sid)
        except ValueError as e:
            raise HTTPException(400, str(e))

    @r.get("/state")
    def state(request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            return state_of(s, settings)

    @r.post("/reset")
    def reset(request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        s.reset()
        with s.lock:
            return state_of(s, settings)

    @r.post("/ask")
    def ask(a: AskIn, request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        if len(a.query) > settings.max_query_chars:
            raise HTTPException(422, "Question is too long (max %d characters)." % settings.max_query_chars)
        with s.lock:
            if not s.acl.has_user(a.user_id):
                raise HTTPException(404, "unknown user")
            res = s.gw.handle(a.user_id, a.query, s.clock)
            at = s.clock
            s.clock += a.advance_minutes * 60
            cnt = next((c for c in window_counts(s.store, settings, at)
                        if c["user_id"] == a.user_id and c["resource"] == res["closest_doc"]), None)
            return {
                "employee": {"answer": res["answer"],
                             "source_title": DOCS[res["served_doc"]]["title"] if res["served_doc"] else None},
                "security": {"decision": res["decision"], "leak": res["leak"], "closest_doc": res["closest_doc"],
                             "proximity": res["proximity"], "counter": cnt, "time": at},
                "state": state_of(s, settings)}

    @r.post("/mode")
    def mode(m: ModeIn, request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            s.gw.mode = m.acl_mode
            return state_of(s, settings)

    @r.post("/revoke")
    def revoke(rv: RevokeIn, request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            if not s.acl.has_user(rv.user_id) or rv.doc_id not in DOCS:
                raise HTTPException(404, "unknown user or document")
            if rv.doc_id in ROLE_DOCS[s.acl.role[rv.user_id]]:
                raise HTTPException(422, "Only extra grants can be revoked in this demo.")
            s.acl.revoke(rv.user_id, rv.doc_id, s.clock)
            return state_of(s, settings)

    @r.post("/sync")
    def sync(b: SyncIn, request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            s.clock += b.advance_minutes * 60
            lags = s.acl.sync(s.clock)
            return {"revocation_lags": lags, "state": state_of(s, settings)}

    @r.get("/audit")
    def audit(request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            return boundary_audit(s.gw)

    @r.get("/case/{user_id}")
    def case(user_id: str, request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            if not s.acl.has_user(user_id):
                raise HTTPException(404, "unknown user")
            return build_case(s.store, settings, user_id, s.clock)

    r.mgr = mgr
    r.session = session
    return r
