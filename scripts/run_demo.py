"""End-to-end demo on synthetic data. Run from the project root:  python scripts/run_demo.py
Shows: normal traffic (no alerts) -> a probing user (alert + case) -> stale-ACL leak found by the audit."""
import json, random, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from app.config import Settings
from app.main import create_app

ADMIN, DAY, T0 = {"X-Admin-Token": "dev-admin"}, 86400.0, 1_800_000_000.0
c = TestClient(create_app(Settings(db_path=":memory:", acl_mode="live"), public=False))
rng = random.Random(7)

OWN = {  # benign work questions per role
 "hr": ["salary bands and promotion list", "headcount by department", "leave policy", "onboarding checklist", "office locations"],
 "finance": ["quarterly revenue forecast", "budget and profit", "expense policy travel reimbursement", "department headcount", "audit findings"],
 "sales": ["sales pipeline deals", "renewal targets key accounts", "commission quota", "leave policy working hours", "customer accounts"],
}
ROLE = {"ahmed": "hr", "noura": "hr", "sara": "sales", "mohamed": "finance", "khaled": "finance"}
PROBE_WORDS = ["quarterly revenue forecast", "net profit and budget", "budget cuts expenditure limits", "cashflow treasury liabilities",
               "audit findings financial statements", "revenue targets profit margin", "treasury invoices assets"]

for day in range(5):
    for u, role in ROLE.items():
        for _ in range(rng.randint(6, 10)):
            c.post("/query", json={"user_id": u, "query": rng.choice(OWN[role]), "ts": T0 + day * DAY + rng.random() * DAY})
    if 1 <= day <= 3:      # Noura (HR) keeps probing the finance report, in different words
        for q in rng.sample(PROBE_WORDS, 3):
            c.post("/query", json={"user_id": "noura", "query": q, "ts": T0 + day * DAY + rng.random() * DAY})

print("== ALERTS ==")
for a in c.get("/alerts", headers=ADMIN).json()["alerts"]:
    print(f"  {a['severity'].upper():6} score={a['score']:3} {a['user_id']} ({a['role']}) -> {a['resource']} "
          f"events={a['events']}/{a['threshold']} denied={a['denied']} days={a['distinct_days']}")
case = c.get("/cases/noura", headers=ADMIN).json()
print("\n== CASE: noura ==")
print(json.dumps({k: case[k] for k in ("status", "window", "related_events", "per_day", "targeted_resources", "recommended_steps")}, indent=2))
print("first timeline rows:", json.dumps(case["timeline"][:3], indent=2))

print("\n== STALE-ACL LEAK (snapshot mode) ==")
c.post("/admin/mode", json={"acl_mode": "snapshot"}, headers=ADMIN)
c.post("/admin/revoke", json={"user_id": "ahmed", "doc_id": "FIN-REP", "ts": T0 + 6 * DAY}, headers=ADMIN)
r = c.post("/query", json={"user_id": "ahmed", "query": "quarterly revenue forecast budget and profit", "ts": T0 + 6 * DAY + 60}).json()
print("ahmed asks after revocation ->", r["answer"][:70], "| leak =", r["debug"]["leak"])
print("audit (before sync):", json.dumps({k: v for k, v in c.get("/audit/boundary", headers=ADMIN).json().items() if k != "leaks"}))
print("sync lag:", c.post("/admin/sync", params={"ts": T0 + 6 * DAY + 900}, headers=ADMIN).json()["revocation_lags"])
print("audit (after sync): ", json.dumps({k: v for k, v in c.get("/audit/boundary", headers=ADMIN).json().items() if k != "leaks"}))
