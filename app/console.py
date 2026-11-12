"""ZIMAAM console API: employee portal + security dashboard on top of the existing Gateway / Detector / ACL.

Auth here is DEMO auth (per-sandbox random tokens). It separates the two roles on the server side, but it is
not enterprise SSO: a real deployment would put the portal and the console behind the company's identity provider.
The employee identity comes from the token issued at login, never from a user_id sent with the question."""
import asyncio, json, random, secrets
from collections import defaultdict
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Header, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from .audit import boundary_audit
from .cases import build_case
from .corpus import DOCS, ROLE_DOCS
from .detector import DAY, build_alerts

DOC_AR = {"HR-SAL": "نطاقات الرواتب والترقيات", "HR-HEAD": "أعداد الموظفين والمكاتب", "FIN-REP": "التقرير المالي الربعي",
          "SALES-PIPE": "مسار المبيعات", "HANDBOOK": "دليل الموظف"}
PEOPLE = {  # synthetic people
    "ahmed": ("Ahmed", "أحمد", "HR Business Partner", "شريك أعمال الموارد البشرية"),
    "noura": ("Noura", "نورة", "Compensation Analyst", "محللة التعويضات"),
    "sara": ("Sara", "سارة", "Account Manager", "مديرة حسابات"),
    "mohamed": ("Mohamed", "محمد", "Financial Analyst", "محلل مالي"),
    "khaled": ("Khaled", "خالد", "Senior Accountant", "محاسب أول"),
}
DEPT = {"hr": ("Human Resources", "الموارد البشرية"), "finance": ("Finance", "المالية"), "sales": ("Sales", "المبيعات")}
STATUSES = ("new", "under_review", "reviewed", "resolved")
RANGES = {"24h": (DAY, 3600.0), "7d": (7 * DAY, DAY), "30d": (30 * DAY, DAY)}
BENIGN = {"hr": ["salary bands and promotion list", "headcount by department", "leave policy", "onboarding checklist",
                 "office locations", "expense policy"],
          "finance": ["quarterly revenue forecast", "budget and profit", "expense policy travel reimbursement",
                      "audit findings", "office locations", "leave policy"],
          "sales": ["sales pipeline deals", "renewal targets key accounts", "commission quota", "leave policy working hours",
                    "customer accounts", "department headcount"]}
PROBE = {"noura": ["quarterly revenue forecast", "net profit and budget", "budget cuts expenditure limits",
                   "cashflow treasury liabilities", "audit findings financial statements"],
         "sara": ["executive compensation bonus", "salary range for management"]}


def _iso(ts):
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def person(s, uid):
    en, ar, ten, tar = PEOPLE[uid]
    role = s.acl.role[uid]
    return {"id": uid, "name_en": en, "name_ar": ar, "title_en": ten, "title_ar": tar, "dept": role,
            "dept_en": DEPT[role][0], "dept_ar": DEPT[role][1]}


def doc_info(d):
    return {"id": d, "title_en": DOCS[d]["title"], "title_ar": DOC_AR[d], "sensitive": DOCS[d]["sensitive"]}


# ---------- derived views (single source of truth: the event store + detector) ----------
def sync_cases(s, settings):
    """Open a case the first time a (user, resource) pair crosses the alert threshold; keep its review state."""
    for a in build_alerts(s.store, settings, s.clock):
        key = (a["user_id"], a["resource"])
        c = s.case_meta.get(key)
        if c is None:
            c = s.case_meta[key] = {"id": "CASE-%03d" % (len(s.case_meta) + 1), "user_id": key[0], "resource": key[1],
                                    "status": "new", "opened": s.clock, "history": [], "note": ""}
            s.rev += 1
        c["snap"], c["live"] = a, True
    live = {(a["user_id"], a["resource"]) for a in build_alerts(s.store, settings, s.clock)}
    for k, c in s.case_meta.items():
        c["live"] = k in live


def case_row(s, c):
    a = c["snap"]
    return {"id": c["id"], "user_id": c["user_id"], "person": person(s, c["user_id"]), "resource": c["resource"],
            "resource_info": doc_info(c["resource"]), "attempts": a["events"], "denied": a["denied"], "leaks": a["leaks"],
            "first_seen": a["first_ts"], "last_seen": a["last_ts"], "severity": a["severity"], "score": a["score"],
            "status": c["status"], "in_window": c["live"], "opened": c["opened"]}


def event_risk(e, alert_sev):
    if e["leak"]:
        return "high"
    if e["closest_doc"]:
        return alert_sev.get((e["user_id"], e["closest_doc"]), "low")
    return "none"


def alert_severity(s, settings):
    return {(a["user_id"], a["resource"]): a["severity"] for a in build_alerts(s.store, settings, s.clock)}


def event_row(s, e, sev, case_ids):
    target = e["served_doc"] if e["decision"] == "answered" and e["served_doc"] else e["closest_doc"] or e["served_doc"]
    return {"id": e["id"], "ts": e["ts"], "user_id": e["user_id"], "person": person(s, e["user_id"]), "dept": e["role"],
            "type": "query", "decision": e["decision"], "leak": bool(e["leak"]),
            "target": target, "target_info": doc_info(target) if target else None,
            "closest_doc": e["closest_doc"], "proximity": None if e["proximity"] is None else round(e["proximity"], 3),
            "risk": event_risk(e, sev), "case_id": case_ids.get((e["user_id"], e["closest_doc"])), "ref": e["query_hash"]}


def log(s, actor, action, subject=None, resource=None, result="ok", detail=""):
    s.audit_log.append({"ts": s.clock, "actor": actor, "actor_type": "admin" if actor == "admin" else "system",
                        "action": action, "subject": subject, "resource": resource, "result": result, "detail": detail})
    s.rev += 1


# ---------- request bodies ----------
class LoginIn(BaseModel):
    user_id: str = Field(min_length=1, max_length=20)


class PortalAskIn(BaseModel):
    query: str = Field(min_length=1)


class PermIn(BaseModel):
    revoke: List[str] = Field(default_factory=list, max_length=10)
    restore: List[str] = Field(default_factory=list, max_length=10)


class CaseIn(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = Field(default=None, max_length=300)


class SettingsIn(BaseModel):
    acl_mode: Optional[str] = Field(default=None, pattern="^(live|snapshot)$")
    reveal_denial: Optional[bool] = None


def make_console_router(settings, session):
    r = APIRouter(prefix="/api")

    def admin(request: Request, sid: str, key: str):
        s = session(request, sid)
        t = s.tokens.get(key or "")
        if not t or t["kind"] != "admin":
            raise HTTPException(401, "Administrator sign-in required.")
        return s

    def employee(request: Request, sid: str, key: str):
        s = session(request, sid)
        t = s.tokens.get(key or "")
        if not t or t["kind"] != "employee":
            raise HTTPException(401, "Employee sign-in required.")
        return s, t["user_id"]

    # ================= employee portal =================
    @r.get("/portal/users")
    def portal_users(request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            return {"users": [person(s, u) for u in s.acl.users()]}

    @r.post("/portal/login")
    def portal_login(b: LoginIn, request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            if not s.acl.has_user(b.user_id):
                raise HTTPException(404, "unknown user")
            for k in [k for k, v in s.tokens.items() if v["kind"] == "employee" and v["user_id"] == b.user_id]:
                s.tokens.pop(k)
            tok = "e_" + secrets.token_urlsafe(18)
            s.tokens[tok] = {"kind": "employee", "user_id": b.user_id}
            return {"token": tok, "user": person(s, b.user_id)}

    @r.post("/portal/ask")
    def portal_ask(b: PortalAskIn, request: Request, x_session_id: str = Header(default=""),
                   x_portal_token: str = Header(default="")):
        s, uid = employee(request, x_session_id, x_portal_token)
        if len(b.query) > settings.max_query_chars:
            raise HTTPException(422, "Question is too long (max %d characters)." % settings.max_query_chars)
        with s.lock:
            res = s.gw.handle(uid, b.query, s.clock)
            s.clock += 10 * 60
            s.rev += 1
            served = res["served_doc"]
            if res["decision"] == "denied" and s.reveal_denial:
                status = "denied"
            elif served:
                status = "answered"
            else:
                status = "no_result"
            return {"status": status, "answer": res["answer"] if served else None,
                    "source_title_en": DOCS[served]["title"] if served else None,
                    "source_title_ar": DOC_AR[served] if served else None}

    # ================= admin session =================
    @r.post("/admin/login")
    def admin_login(request: Request, x_session_id: str = Header(default="")):
        s = session(request, x_session_id)
        with s.lock:
            tok = "a_" + secrets.token_urlsafe(18)
            s.tokens[tok] = {"kind": "admin"}
            log(s, "admin", "admin_login", detail="demo sign-in")
            return {"token": tok, "demo_auth": True}

    @r.post("/admin/logout")
    def admin_logout(request: Request, x_session_id: str = Header(default=""), x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            s.tokens.pop(x_admin_key, None)
        return {"ok": True}

    # ================= overview =================
    @r.get("/admin/overview")
    def overview(request: Request, range: str = "24h", x_session_id: str = Header(default=""),
                 x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        if range not in RANGES:
            raise HTTPException(422, "range must be 24h, 7d or 30d")
        span, bucket = RANGES[range]
        with s.lock:
            sync_cases(s, settings)
            sev = alert_severity(s, settings)
            t0 = s.clock - span
            evs = s.store.between(t0, s.clock)
            n = int(span // bucket)
            series = {"allowed": [0] * n, "denied": [0] * n, "suspicious": [0] * n}
            risk = {"none": 0, "low": 0, "medium": 0, "high": 0}
            dept = {d: 0 for d in DEPT}
            for e in evs:
                i = min(n - 1, int((e["ts"] - t0) // bucket))
                if e["decision"] == "answered":
                    series["allowed"][i] += 1
                elif e["decision"] == "denied":
                    series["denied"][i] += 1
                if e["closest_doc"]:
                    series["suspicious"][i] += 1
                    dept[e["role"]] += 1
                risk[event_risk(e, sev)] += 1
            half = n // 2
            sus = series["suspicious"]
            cur, prev = sum(sus[half:]), sum(sus[:half])
            answered = sum(1 for e in evs if e["decision"] == "answered")
            denied = sum(1 for e in evs if e["decision"] == "denied")
            return {
                "range": range, "bucket_seconds": bucket, "t0": t0, "t1": s.clock, "seeded": s.seeded, "rev": s.rev,
                "mode": s.gw.mode,
                "cards": {"total": len(evs), "allowed": answered, "denied": denied,
                          "suspicious": sum(1 for e in evs if e["closest_doc"]),
                          "active_cases": sum(1 for c in s.case_meta.values() if c["status"] != "resolved"),
                          "new_cases": sum(1 for c in s.case_meta.values() if c["status"] == "new"),
                          "monitored": len(s.acl.users())},
                "series": series, "risk": risk,
                "by_dept": [{"dept": d, "en": DEPT[d][0], "ar": DEPT[d][1], "suspicious": v} for d, v in dept.items()],
                "trend": {"current": cur, "previous": prev},
                "total_events": s.store.count()}

    # ================= events =================
    @r.get("/admin/events")
    def events(request: Request, q: str = "", decision: str = "", risk: str = "", user: str = "", range: str = "30d",
               sort: str = "ts", order: str = "desc", page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=50),
               after_id: int = Query(0, ge=0), x_session_id: str = Header(default=""), x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        if range not in RANGES:
            raise HTTPException(422, "bad range")
        with s.lock:
            sync_cases(s, settings)
            sev = alert_severity(s, settings)
            ids = {k: c["id"] for k, c in s.case_meta.items()}
            rows = [event_row(s, e, sev, ids) for e in s.store.between(s.clock - RANGES[range][0], s.clock)]
        ql = q.strip().lower()

        def hit(r_):
            blob = " ".join([r_["user_id"], r_["person"]["name_en"], r_["person"]["name_ar"], r_["person"]["dept_en"],
                             r_["person"]["dept_ar"], r_["decision"], r_["risk"], r_["case_id"] or "",
                             r_["target_info"]["id"] + " " + r_["target_info"]["title_en"] + " " + r_["target_info"]["title_ar"]
                             if r_["target_info"] else ""]).lower()
            return ql in blob
        if ql:
            rows = [x for x in rows if hit(x)]
        if decision:
            rows = [x for x in rows if x["decision"] == decision]
        if risk:
            rows = [x for x in rows if x["risk"] == risk]
        if user:
            rows = [x for x in rows if x["user_id"] == user]
        rk = {"none": 0, "low": 1, "medium": 2, "high": 3}
        keyf = {"ts": lambda x: (x["ts"], x["id"]), "user": lambda x: x["user_id"], "decision": lambda x: x["decision"],
                "risk": lambda x: rk[x["risk"]], "dept": lambda x: x["dept"],
                "target": lambda x: x["target"] or ""}.get(sort, lambda x: (x["ts"], x["id"]))
        rows.sort(key=keyf, reverse=(order != "asc"))
        total = len(rows)
        if after_id:   # incremental polling helper: only events newer than a known id
            rows = [x for x in rows if x["id"] > after_id]
            return {"total": total, "items": rows[:size]}
        return {"total": total, "page": page, "size": size, "items": rows[(page - 1) * size: page * size]}

    # ================= cases =================
    @r.get("/admin/cases")
    def cases(request: Request, status: str = "", x_session_id: str = Header(default=""),
              x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            sync_cases(s, settings)
            rows = [case_row(s, c) for c in s.case_meta.values() if not status or c["status"] == status]
            rows.sort(key=lambda c: (-c["score"], -c["last_seen"]))
            return {"items": rows, "counts": {st: sum(1 for c in s.case_meta.values() if c["status"] == st) for st in STATUSES}}

    def find_case(s, cid):
        for c in s.case_meta.values():
            if c["id"] == cid:
                return c
        raise HTTPException(404, "case not found")

    @r.get("/admin/cases/{cid}")
    def case_detail(cid: str, request: Request, x_session_id: str = Header(default=""),
                    x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            sync_cases(s, settings)
            c = find_case(s, cid)
            row = case_row(s, c)
            a = c["snap"]
            rep = build_case(s.store, settings, c["user_id"], s.clock)
            tl = [e for e in s.store.between(s.clock - settings.window_days * DAY, s.clock, c["user_id"])
                  if e["closest_doc"] == c["resource"]]
            timeline = [{"ts": e["ts"], "decision": e["decision"], "leak": bool(e["leak"]),
                         "proximity": round(e["proximity"], 3), "ref": e["query_hash"]} for e in tl]
            per_day = defaultdict(int)
            for e in tl:
                per_day[_iso(e["ts"])[:10]] += 1
            reasons = [
                {"k": "count", "n": a["events"], "threshold": a["threshold"], "days": settings.window_days},
                {"k": "mix", "denied": a["denied"], "elsewhere": a["answered_elsewhere"]},
                {"k": "days", "n": a["distinct_days"]},
            ]
            if a["sensitive"]:
                reasons.append({"k": "sensitive"})
            if a["leaks"]:
                reasons.append({"k": "leak", "n": a["leaks"]})
            recent = s.store.between(s.clock - 7 * DAY, s.clock, c["user_id"])
            return {**row, "reasons": reasons, "timeline": timeline, "per_day": dict(per_day),
                    "score_parts": {"proximity": round(40 * min(a["events"] / a["threshold"], 2)),
                                    "sensitive": 10 if a["sensitive"] else 0, "leak": 10 if a["leaks"] else 0},
                    "threshold": a["threshold"], "window_days": settings.window_days,
                    "history": c["history"], "note": c["note"], "steps": rep["recommended_steps"], "limits": rep["limits"],
                    "user_events_7d": len(recent)}

    @r.patch("/admin/cases/{cid}")
    def case_update(cid: str, b: CaseIn, request: Request, x_session_id: str = Header(default=""),
                    x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        if b.status is not None and b.status not in STATUSES:
            raise HTTPException(422, "status must be one of: " + ", ".join(STATUSES))
        with s.lock:
            c = find_case(s, cid)
            old = c["status"]
            if b.status is not None and b.status != old:
                c["status"] = b.status
                c["history"].append({"ts": s.clock, "from": old, "to": b.status, "note": b.note or ""})
                log(s, "admin", "case_status", c["user_id"], c["resource"], detail="%s: %s -> %s" % (cid, old, b.status))
            elif b.note:
                c["history"].append({"ts": s.clock, "from": old, "to": old, "note": b.note})
                s.rev += 1
            if b.note:
                c["note"] = b.note
            return case_row(s, c)

    # ================= employees & permissions =================
    def employee_view(s, uid, detail=False):
        allowed = s.acl.allowed(uid, "live")
        role_docs = ROLE_DOCS[s.acl.role[uid]]
        out = {**person(s, uid), "status": "active",
               "docs": [{**doc_info(d), "granted": d in allowed, "via_role": d in role_docs} for d in DOCS],
               "extra_grants": sorted(d for d in allowed if d not in role_docs),
               "revoked": sorted(d for d in role_docs if d not in allowed),
               "cases": [case_row(s, c) for c in s.case_meta.values() if c["user_id"] == uid]}
        evs = s.store.between(s.clock - 30 * DAY, s.clock, uid)
        out["event_count"] = len(evs)
        out["suspicious_count"] = sum(1 for e in evs if e["closest_doc"])
        out["denied_count"] = sum(1 for e in evs if e["decision"] == "denied")
        out["pending_sync"] = any(p[0] == uid for p in s.acl.pending)
        out["stale_exposed"] = sorted(s.acl.allowed(uid, "snapshot") - allowed)
        if detail:
            sev = alert_severity(s, settings)
            ids = {k: c["id"] for k, c in s.case_meta.items()}
            out["recent"] = [event_row(s, e, sev, ids) for e in evs[-8:]][::-1]
        return out

    @r.get("/admin/employees")
    def employees(request: Request, x_session_id: str = Header(default=""), x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            sync_cases(s, settings)
            return {"items": [employee_view(s, u) for u in s.acl.users()],
                    "docs": [doc_info(d) for d in DOCS], "mode": s.gw.mode}

    @r.get("/admin/employees/{uid}")
    def employee_detail(uid: str, request: Request, x_session_id: str = Header(default=""),
                        x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            if not s.acl.has_user(uid):
                raise HTTPException(404, "unknown employee")
            sync_cases(s, settings)
            return employee_view(s, uid, detail=True)

    @r.post("/admin/employees/{uid}/permissions")
    def permissions(uid: str, b: PermIn, request: Request, x_session_id: str = Header(default=""),
                    x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            if not s.acl.has_user(uid):
                raise HTTPException(404, "unknown employee")
            if set(b.revoke) & set(b.restore):
                raise HTTPException(422, "A resource cannot be revoked and restored in the same change.")
            for d in b.revoke + b.restore:
                if d not in DOCS:
                    raise HTTPException(422, "unknown resource: %s" % d)
            changed = 0
            for d in b.revoke:
                if d in s.acl.source[uid]:
                    s.acl.revoke(uid, d, s.clock)
                    log(s, "admin", "permission_revoked", uid, d, detail="source ACL updated")
                    changed += 1
            for d in b.restore:
                if d not in s.acl.source[uid]:
                    s.acl.grant(uid, d)
                    log(s, "admin", "permission_restored", uid, d, detail="source ACL updated")
                    changed += 1
            sync_cases(s, settings)
            return {"changed": changed, "employee": employee_view(s, uid, detail=True)}

    # ================= audit =================
    @r.get("/admin/audit")
    def access_audit(request: Request, q: str = "", kind: str = "", page: int = Query(1, ge=1),
                     size: int = Query(12, ge=1, le=50), x_session_id: str = Header(default=""),
                     x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            rows = []
            for e in s.store.between(0, s.clock + 1):
                tgt = e["served_doc"] if e["decision"] == "answered" and e["served_doc"] else e["closest_doc"] or e["served_doc"]
                rows.append({"id": "q%d" % e["id"], "ts": e["ts"], "actor": e["user_id"], "actor_type": "employee",
                             "action": "query", "subject": e["user_id"], "resource": tgt, "result": e["decision"],
                             "detail": "closest protected: %s" % e["closest_doc"] if e["closest_doc"] else ""})
            for i, a in enumerate(s.audit_log):
                rows.append({"id": "a%d" % i, **a})
        ql = q.strip().lower()
        if kind:
            rows = [x for x in rows if x["action"] == kind]
        if ql:
            rows = [x for x in rows if ql in " ".join(str(x.get(k) or "") for k in
                                                     ("actor", "action", "subject", "resource", "result", "detail")).lower()]
        rows.sort(key=lambda x: (x["ts"], x["id"]), reverse=True)
        return {"total": len(rows), "page": page, "size": size, "items": rows[(page - 1) * size: page * size]}

    @r.get("/admin/boundary")
    def boundary(request: Request, x_session_id: str = Header(default=""), x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            return boundary_audit(s.gw)

    # ================= settings / demo controls =================
    def settings_view(s):
        return {"acl_mode": s.gw.mode, "reveal_denial": s.reveal_denial, "pending_sync": len(s.acl.pending),
                "threshold": settings.default_threshold, "window_days": settings.window_days,
                "proximity_threshold": settings.proximity_threshold, "embedder": settings.embedder,
                "session_ttl_minutes": settings.session_ttl_minutes, "seeded": s.seeded,
                "stored_fields": ["user", "role", "time", "decision", "served document", "leak flag",
                                  "closest protected document", "similarity", "salted query hash"],
                "not_stored": ["query text", "document content"]}

    @r.get("/admin/settings")
    def get_settings(request: Request, x_session_id: str = Header(default=""), x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            return settings_view(s)

    @r.post("/admin/settings")
    def set_settings(b: SettingsIn, request: Request, x_session_id: str = Header(default=""),
                     x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            if b.acl_mode and b.acl_mode != s.gw.mode:
                s.gw.mode = b.acl_mode
                log(s, "admin", "mode_change", detail="enforcement ACL source: " + b.acl_mode)
            if b.reveal_denial is not None and b.reveal_denial != s.reveal_denial:
                s.reveal_denial = b.reveal_denial
                log(s, "admin", "setting_change", detail="employee-facing denial message: %s" % b.reveal_denial)
            return settings_view(s)

    @r.post("/admin/sync")
    def sync_acl(request: Request, x_session_id: str = Header(default=""), x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            s.clock += 15 * 60
            lags = s.acl.sync(s.clock)
            log(s, "admin", "acl_sync", detail="%d revocation(s) pushed to the index" % len(lags))
            return {"revocation_lags": lags, "settings": settings_view(s)}

    @r.post("/admin/seed")
    def seed(request: Request, x_session_id: str = Header(default=""), x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        with s.lock:
            if s.seeded:
                raise HTTPException(409, "Sample history is already loaded.")
            rnd, now, plan = random.Random(7), s.clock, []
            for day in range(14, 0, -1):
                for u in s.acl.users():
                    for _ in range(rnd.randint(1, 3)):
                        plan.append((now - day * DAY + rnd.uniform(8, 17) * 3600 - 12 * 3600, u,
                                     rnd.choice(BENIGN[s.acl.role[u]])))
            for i, q in enumerate(PROBE["noura"]):   # a slow, multi-day probing pattern on the finance report
                plan.append((now - 2 * DAY + i * 7 * 3600, "noura", q))
            for i, q in enumerate(PROBE["sara"]):    # a weaker signal that stays below the threshold
                plan.append((now - 5 * DAY + i * 9 * 3600, "sara", q))
            for ts, u, q in sorted(plan):
                s.gw.handle(u, q, ts)
            s.seeded = True
            sync_cases(s, settings)
            log(s, "system", "seed", detail="%d synthetic events loaded" % len(plan))
            return settings_view(s)

    @r.post("/admin/reset")
    def reset(request: Request, x_session_id: str = Header(default=""), x_admin_key: str = Header(default="")):
        s = admin(request, x_session_id, x_admin_key)
        keep = {k: v for k, v in s.tokens.items() if v["kind"] == "admin"}
        s.reset()
        s.tokens = keep
        return settings_view(s)

    # ================= live stream (SSE): tells the dashboard that something changed =================
    @r.get("/admin/stream")
    async def stream(request: Request, sid: str = "", key: str = ""):
        s = admin(request, sid, key)

        async def gen():
            last, idle = -1, 0
            while not await request.is_disconnected():
                if s.rev != last:
                    last, idle = s.rev, 0
                    yield "data: %s\n\n" % json.dumps({"rev": last})
                else:
                    idle += 1
                    if idle >= 30:
                        idle = 0
                        yield ": keep-alive\n\n"
                await asyncio.sleep(0.5)
        return StreamingResponse(gen(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    return r
