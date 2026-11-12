"""ZIMAAM (زِمام) backend, formerly SIAAJ. Run:  uvicorn app.main:app --reload   (docs at /docs)"""
from typing import Optional
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from .config import Settings
from .embedder import make_embedder
from .acl import AclStore
from .store import EventStore
from .gateway import Gateway, Engine
from .detector import build_alerts
from .cases import build_case
from .audit import boundary_audit
import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .demo import make_router
from .console import make_console_router
from fastapi.middleware.cors import CORSMiddleware


class QueryIn(BaseModel):
    user_id: str
    query: str
    ts: Optional[float] = None       # epoch seconds; lets demos/simulations set the time


class RevokeIn(BaseModel):
    user_id: str
    doc_id: str
    ts: Optional[float] = None


class ModeIn(BaseModel):
    acl_mode: str


WEB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")
CSP = ("default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self'; "
       "img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")


def create_app(settings: Optional[Settings] = None, public: Optional[bool] = None) -> FastAPI:
    """public=True (or SIAAJ_PUBLIC=1): only the isolated demo API + static page; no admin endpoints, no Swagger."""
    s = settings or Settings()
    public = (os.getenv("SIAAJ_PUBLIC", "0") == "1") if public is None else public
    engine = Engine(s, make_embedder(s))                 # shared, read-only: embedder + document vectors
    acl, store = AclStore(), EventStore(s.db_path)
    gw = Gateway(engine, s, acl, store, mode=s.acl_mode)   # legacy single-tenant gateway (dev only)
    app = FastAPI(title="SIAAJ backend", version="0.2",
                  docs_url=None if public else "/docs", redoc_url=None, openapi_url=None if public else "/openapi.json")

    @app.middleware("http")
    async def security_headers(request, call_next):
        resp = await call_next(request)
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["Referrer-Policy"] = "no-referrer"
        resp.headers["Content-Security-Policy"] = CSP
        if request.url.path.startswith("/api"):
            resp.headers["Cache-Control"] = "no-store"
        return resp

    app.add_middleware(CORSMiddleware, allow_origins=list(s.cors_origins), allow_methods=["GET", "POST", "PATCH"],
                       allow_headers=["Content-Type", "X-Session-Id", "X-Admin-Key", "X-Portal-Token"])
    demo = make_router(s, engine)
    app.include_router(demo)
    app.include_router(make_console_router(s, demo.session))

    if not public:
        def admin(token):
            if s.admin_token and token != s.admin_token:
                raise HTTPException(401, "missing or wrong X-Admin-Token")

        @app.get("/admin/health")
        def health():
            return {"ok": True, "acl_mode": s.acl_mode, "events": store.count(), "users": acl.users()}

        @app.post("/query")
        def query(q: QueryIn):
            if not acl.has_user(q.user_id):
                raise HTTPException(404, "unknown user")
            r = gw.handle(q.user_id, q.query, q.ts)
            out = {"answer": r["answer"]}
            if s.debug_responses:   # lab only: a real deployment must never reveal the decision to the asker
                out["debug"] = {k: r[k] for k in ("decision", "served_doc", "leak", "closest_doc", "proximity")}
            return out

        @app.get("/alerts")
        def alerts(as_of: Optional[float] = None, x_admin_token: str = Header(default="")):
            admin(x_admin_token)
            return {"alerts": build_alerts(store, s, as_of)}

        @app.get("/cases/{user_id}")
        def case(user_id: str, as_of: Optional[float] = None, x_admin_token: str = Header(default="")):
            admin(x_admin_token)
            if not acl.has_user(user_id):
                raise HTTPException(404, "unknown user")
            return build_case(store, s, user_id, as_of)

        @app.get("/audit/boundary")
        def audit(x_admin_token: str = Header(default="")):
            admin(x_admin_token)
            return boundary_audit(gw)

        @app.post("/admin/revoke")
        def revoke(r: RevokeIn, x_admin_token: str = Header(default="")):
            admin(x_admin_token)
            acl.revoke(r.user_id, r.doc_id, r.ts)
            return {"revoked": [r.user_id, r.doc_id], "pending_sync": len(acl.pending)}

        @app.post("/admin/sync")
        def sync(ts: Optional[float] = None, x_admin_token: str = Header(default="")):
            admin(x_admin_token)
            return {"synced": True, "revocation_lags": acl.sync(ts)}

        @app.post("/admin/mode")
        def mode(m: ModeIn, x_admin_token: str = Header(default="")):
            admin(x_admin_token)
            if m.acl_mode not in ("live", "snapshot"):
                raise HTTPException(422, "acl_mode must be live or snapshot")
            s.acl_mode = gw.mode = m.acl_mode
            return {"acl_mode": gw.mode}


    @app.get("/health")
    def health_public():
        return {"ok": True, "public": public}

    if os.path.isdir(WEB_DIR):
        def page(name):
            return FileResponse(os.path.join(WEB_DIR, name), headers={"Cache-Control": "no-cache"})

        @app.get("/", include_in_schema=False)
        def home():
            return page("index.html")

        @app.get("/portal", include_in_schema=False)
        def portal():
            return page("portal.html")

        @app.get("/story", include_in_schema=False)
        def story():
            return page("story.html")

        @app.get("/dashboard", include_in_schema=False)
        @app.get("/dashboard/{path:path}", include_in_schema=False)
        def dashboard(path: str = ""):
            return page("dashboard.html")
        app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")

    return app


app = create_app()
