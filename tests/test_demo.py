import pytest
from fastapi.testclient import TestClient
from app.config import Settings
from app.main import create_app


@pytest.fixture(scope="module")
def client():
    return TestClient(create_app(Settings(db_path=":memory:", rate_per_minute=1000), public=True))


def H(sid): return {"X-Session-Id": sid}


def ask(c, sid, user, q, adv=25):
    r = c.post("/api/ask", json={"user_id": user, "query": q, "advance_minutes": adv}, headers=H(sid))
    assert r.status_code == 200, r.text
    return r.json()


PROBES = ["quarterly revenue forecast", "net profit and budget", "budget cuts expenditure limits", "cashflow treasury liabilities"]


def test_public_mode_hides_admin_and_docs(client):
    assert client.get("/docs").status_code == 404
    assert client.post("/query", json={"user_id": "noura", "query": "x"}).status_code in (404, 405)
    assert client.get("/alerts").status_code == 404
    assert client.get("/health").json()["public"] is True
    h = client.get("/health").headers
    assert "frame-ancestors 'none'" in h["content-security-policy"] and h["x-content-type-options"] == "nosniff"


def test_sessions_are_isolated_and_reset(client):
    a, b = "visitor-aaaaaaaa", "visitor-bbbbbbbb"
    for q in PROBES:
        out = ask(client, a, "noura", q)
    assert out["security"]["counter"]["events"] == 4 and out["security"]["counter"]["threshold"] == 4
    assert [x["user_id"] for x in out["state"]["alerts"]] == ["noura"]
    sb = client.get("/api/state", headers=H(b)).json()               # another visitor sees nothing
    assert sb["events_total"] == 0 and sb["alerts"] == [] and sb["counters"] == []
    assert client.post("/api/reset", headers=H(a)).json()["events_total"] == 0


def test_employee_view_never_reveals_denial_or_content(client):
    sid = "visitor-cccccccc"
    out = ask(client, sid, "noura", "quarterly revenue forecast")
    assert out["security"]["decision"] == "denied"
    emp = out["employee"]
    assert "denied" not in emp["answer"].lower() and "Quarterly finance report" not in emp["answer"]
    assert emp["source_title"] != "Quarterly finance report"


def test_stale_acl_story(client):
    sid = "visitor-dddddddd"
    client.post("/api/mode", json={"acl_mode": "snapshot"}, headers=H(sid))
    st = client.post("/api/revoke", json={"user_id": "ahmed", "doc_id": "FIN-REP"}, headers=H(sid)).json()
    assert st["pending_revocations"] == 1 and "FIN-REP" in st["acl_enforced"]["ahmed"] and "FIN-REP" not in st["acl_truth"]["ahmed"]
    out = ask(client, sid, "ahmed", "quarterly revenue forecast budget and profit")
    assert out["security"]["leak"] is True and "Quarterly finance report" in out["employee"]["answer"]
    assert client.get("/api/audit", headers=H(sid)).json()["leak_rate"] > 0
    sync = client.post("/api/sync", json={"advance_minutes": 15}, headers=H(sid)).json()
    assert sync["revocation_lags"][0]["lag_seconds"] >= 15 * 60
    assert client.get("/api/audit", headers=H(sid)).json()["leak_rate"] == 0
    # another session still runs in live mode with Ahmed's grant intact
    assert client.get("/api/state", headers=H("visitor-eeeeeeee")).json()["mode"] == "live"


def test_case_report_has_no_query_text(client):
    sid = "visitor-ffffffff"
    for q in PROBES: ask(client, sid, "noura", q)
    case = client.get("/api/case/noura", headers=H(sid)).json()
    assert case["status"] == "alert" and "cashflow" not in str(case) and "revenue" not in str(case)


def test_validation_and_limits():
    c = TestClient(create_app(Settings(db_path=":memory:", rate_per_minute=5), public=True))
    assert c.get("/api/state", headers=H("short")).status_code == 400
    assert c.post("/api/ask", json={"user_id": "noura", "query": "x" * 600}, headers=H("visitor-gggggggg")).status_code == 422
    assert c.post("/api/revoke", json={"user_id": "noura", "doc_id": "HR-SAL"}, headers=H("visitor-gggggggg")).status_code == 422
    codes = [c.get("/api/state", headers=H("visitor-gggggggg")).status_code for _ in range(8)]
    assert 429 in codes
