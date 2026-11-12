import pytest
from fastapi.testclient import TestClient
from app.config import Settings
from app.main import create_app

ADMIN = {"X-Admin-Token": "dev-admin"}
DAY = 86400.0
T0 = 1_800_000_000.0   # fixed epoch so tests are deterministic


@pytest.fixture
def client():
    return TestClient(create_app(Settings(db_path=":memory:", acl_mode="live"), public=False))   # explicit: never depend on SIAAJ_PUBLIC


def ask(c, user, q, ts):
    r = c.post("/query", json={"user_id": user, "query": q, "ts": ts})
    assert r.status_code == 200
    return r.json()


def test_normal_user_no_alert(client):
    for i, q in enumerate(["leave policy and working hours", "expense policy travel reimbursement",
                           "department headcount", "salary bands for my grade", "onboarding checklist",
                           "office locations"]):
        ask(client, "mohamed", q, T0 + i * 3600)
    assert client.get("/alerts", headers=ADMIN).json()["alerts"] == []


def test_prober_raises_alert_and_case(client):
    # Noura (HR) repeatedly probes the finance report in different words over 2 days
    qs = ["quarterly revenue forecast", "net profit budget", "budget cuts and expenditure limits",
          "cashflow treasury liabilities", "audit findings financial statements", "revenue targets profit margin"]
    for i, q in enumerate(qs):
        r = ask(client, "noura", q, T0 + i * 6 * 3600)
        assert "Based on Quarterly finance report" not in r["answer"]      # enforcement holds
    alerts = client.get("/alerts", headers=ADMIN).json()["alerts"]
    assert any(a["user_id"] == "noura" and a["resource"] == "FIN-REP" for a in alerts)
    case = client.get("/cases/noura", headers=ADMIN).json()
    assert case["status"] == "alert" and case["related_events"] >= 4
    blob = str(case)
    assert "revenue" not in blob and "cashflow" not in blob               # metadata only, no query text


def test_snapshot_leak_detected_by_audit_and_fixed_by_sync(client):
    client.post("/admin/mode", json={"acl_mode": "snapshot"}, headers=ADMIN)
    client.post("/admin/revoke", json={"user_id": "ahmed", "doc_id": "FIN-REP", "ts": T0}, headers=ADMIN)
    r = ask(client, "ahmed", "quarterly revenue forecast budget and profit", T0 + 60)
    assert "Quarterly finance report" in r["answer"] and r["debug"]["leak"] is True   # stale ACL leaks
    a = client.get("/audit/boundary", headers=ADMIN).json()
    assert a["leak_rate"] > 0 and a["authorized_recall"] == 1.0
    lag = client.post("/admin/sync", params={"ts": T0 + 600}, headers=ADMIN).json()["revocation_lags"]
    assert lag and lag[0]["lag_seconds"] == 600
    a2 = client.get("/audit/boundary", headers=ADMIN).json()
    assert a2["leak_rate"] == 0 and a2["authorized_recall"] == 1.0


def test_live_mode_blocks_after_revocation(client):
    client.post("/admin/revoke", json={"user_id": "ahmed", "doc_id": "FIN-REP", "ts": T0}, headers=ADMIN)
    r = ask(client, "ahmed", "quarterly revenue forecast budget and profit", T0 + 60)
    assert "Quarterly finance report" not in r["answer"] and r["debug"]["leak"] is False
    assert client.get("/audit/boundary", headers=ADMIN).json()["leak_rate"] == 0


def test_admin_endpoints_require_token(client):
    assert client.get("/alerts").status_code == 401
    assert client.get("/audit/boundary").status_code == 401
    assert client.get("/admin/health").status_code == 200
    assert client.post("/query", json={"user_id": "nobody", "query": "x"}).status_code == 404
