"""ZIMAAM console: portal + dashboard API, end to end on the real gateway/detector/ACL."""
import pytest
from fastapi.testclient import TestClient
from app.config import Settings
from app.main import create_app

SID = "visitor-console-1"


@pytest.fixture()
def client():
    return TestClient(create_app(Settings(db_path=":memory:"), public=True))


def H(sid=SID, **k):
    return {"X-Session-Id": sid, **k}


def admin_key(c, sid=SID):
    return c.post("/api/admin/login", headers=H(sid)).json()["token"]


def emp(c, uid, sid=SID):
    return c.post("/api/portal/login", json={"user_id": uid}, headers=H(sid)).json()["token"]


def ask(c, tok, q, sid=SID):
    return c.post("/api/portal/ask", json={"query": q}, headers=H(sid, **{"X-Portal-Token": tok})).json()


def test_roles_are_separated(client):
    et = emp(client, "sara")
    assert client.get("/api/admin/overview", headers=H()).status_code == 401
    assert client.get("/api/admin/overview", headers=H(**{"X-Admin-Key": et})).status_code == 401   # employee token != admin
    assert client.post("/api/admin/employees/sara/permissions", json={"restore": ["HR-SAL"]},
                       headers=H(**{"X-Admin-Key": et})).status_code == 401
    assert client.post("/api/portal/ask", json={"query": "leave policy"}, headers=H()).status_code == 401
    ak = admin_key(client)
    assert client.post("/api/portal/ask", json={"query": "x"}, headers=H(**{"X-Portal-Token": ak})).status_code == 401  # admin token != employee


def test_identity_comes_from_token_not_body(client):
    tok = emp(client, "sara")
    r = client.post("/api/portal/ask", json={"query": "sales pipeline", "user_id": "ahmed"}, headers=H(**{"X-Portal-Token": tok}))
    assert r.status_code == 200
    ak = admin_key(client)
    ev = client.get("/api/admin/events", headers=H(**{"X-Admin-Key": ak})).json()["items"]
    assert ev[0]["user_id"] == "sara"


def test_inference_scenario_opens_case_and_dashboard_updates(client):
    ak = admin_key(client); h = H(**{"X-Admin-Key": ak})
    assert client.get("/api/admin/overview", headers=h).json()["cards"]["total"] == 0
    rev0 = client.get("/api/admin/overview", headers=h).json()["rev"]
    tok = emp(client, "khaled")
    for q in ["executive salary bands bonus", "promotion list payroll", "executive pay packages",
              "compensation adjustments management", "salary range for management positions"]:
        ask(client, tok, q)
    ov = client.get("/api/admin/overview", headers=h).json()
    assert ov["rev"] > rev0 and ov["cards"]["total"] == 5 and ov["cards"]["suspicious"] >= 4
    cases = client.get("/api/admin/cases", headers=h).json()["items"]
    assert len(cases) == 1 and cases[0]["user_id"] == "khaled" and cases[0]["resource"] == "HR-SAL"
    d = client.get("/api/admin/cases/" + cases[0]["id"], headers=h).json()
    assert len(d["timeline"]) >= 4 and d["reasons"] and "salary" not in str(d).lower().replace("salary bands", "")
    r = client.patch("/api/admin/cases/" + cases[0]["id"], json={"status": "reviewed", "note": "checked with manager"}, headers=h)
    assert r.json()["status"] == "reviewed"
    assert client.patch("/api/admin/cases/" + cases[0]["id"], json={"status": "bogus"}, headers=h).status_code == 422
    audit = client.get("/api/admin/audit?kind=case_status", headers=h).json()
    assert audit["total"] == 1


def test_revoke_takes_effect_on_the_next_request_and_is_audited(client):
    ak = admin_key(client); h = H(**{"X-Admin-Key": ak})
    tok = emp(client, "ahmed")
    r1 = ask(client, tok, "quarterly revenue forecast budget and profit")
    assert r1["status"] == "answered" and "Quarterly finance" in r1["source_title_en"]      # extra grant works
    r = client.post("/api/admin/employees/ahmed/permissions", json={"revoke": ["FIN-REP"]}, headers=h).json()
    assert r["changed"] == 1 and "FIN-REP" in r["employee"]["extra_grants"] + [] or r["employee"]["extra_grants"] == []
    r2 = ask(client, tok, "quarterly revenue forecast budget and profit")
    assert r2["status"] == "denied"
    audit = client.get("/api/admin/audit?kind=permission_revoked", headers=h).json()
    assert audit["total"] == 1 and audit["items"][0]["resource"] == "FIN-REP"
    client.post("/api/admin/employees/ahmed/permissions", json={"restore": ["FIN-REP"]}, headers=h)
    assert ask(client, tok, "quarterly revenue forecast budget and profit")["status"] == "answered"


def test_employee_never_gets_security_details(client):
    tok = emp(client, "sara")
    out = ask(client, tok, "executive salary bands and bonus")
    assert set(out) == {"status", "answer", "source_title_en", "source_title_ar"}
    blob = str(out).lower()
    for w in ("proximity", "closest", "score", "alert", "case", "leak", "hr-sal"):
        assert w not in blob


def test_reveal_denial_setting_hides_denial(client):
    ak = admin_key(client); h = H(**{"X-Admin-Key": ak})
    client.post("/api/admin/settings", json={"reveal_denial": False}, headers=h)
    tok = emp(client, "sara")
    assert ask(client, tok, "executive salary bands and bonus")["status"] in ("answered", "no_result")


def test_seed_reset_isolation_and_filters(client):
    ak = admin_key(client); h = H(**{"X-Admin-Key": ak})
    assert client.post("/api/admin/seed", headers=h).status_code == 200
    assert client.post("/api/admin/seed", headers=h).status_code == 409
    ov = client.get("/api/admin/overview?range=30d", headers=h).json()
    assert ov["seeded"] and ov["cards"]["total"] > 30 and ov["cards"]["active_cases"] >= 1
    ev = client.get("/api/admin/events?user=noura&size=5&sort=risk&order=desc", headers=h).json()
    assert ev["items"] and all(e["user_id"] == "noura" for e in ev["items"])
    other = H("visitor-console-2")
    assert client.get("/api/admin/overview", headers=other).status_code == 401     # tokens are per sandbox
    ak2 = admin_key(client, "visitor-console-2")
    assert client.get("/api/admin/overview", headers=H("visitor-console-2", **{"X-Admin-Key": ak2})).json()["cards"]["total"] == 0
    client.post("/api/admin/reset", headers=h)
    assert client.get("/api/admin/overview", headers=h).json()["cards"]["total"] == 0


def test_stored_events_hold_no_query_text(client):
    tok = emp(client, "sara")
    ask(client, tok, "my secret sentence about zebra payroll")
    ak = admin_key(client)
    dump = str(client.get("/api/admin/events", headers=H(**{"X-Admin-Key": ak})).json()) + \
        str(client.get("/api/admin/audit", headers=H(**{"X-Admin-Key": ak})).json())
    assert "zebra" not in dump


def test_pages_are_served(client):
    for p in ("/", "/portal", "/dashboard", "/dashboard/cases/CASE-001", "/story"):
        assert client.get(p).status_code == 200
