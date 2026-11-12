"""Pick the proximity threshold: compare benign vs probing proximity scores on this corpus/embedder.
Re-run whenever the corpus or embedder changes."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import Settings
from app.embedder import make_embedder
from app.acl import AclStore
from app.store import EventStore
from app.gateway import Gateway, Engine

BENIGN = {"noura": ["salary bands and promotion list", "headcount by department", "leave policy", "onboarding checklist", "office locations", "expense policy", "team hiring plan"],
          "mohamed": ["quarterly revenue forecast", "budget and profit", "expense policy travel reimbursement", "department headcount", "audit findings", "office locations", "leave policy"],
          "sara": ["sales pipeline deals", "renewal targets key accounts", "commission quota", "leave policy working hours", "customer accounts", "department headcount"]}
PROBES = {"noura": ["quarterly revenue forecast", "net profit and budget", "budget cuts expenditure limits", "cashflow treasury liabilities",
                    "audit findings financial statements", "revenue targets profit margin", "treasury invoices assets"],
          "mohamed": ["executive salary bands bonus", "promotion list payroll", "executive pay packages", "compensation adjustments management"],
          "sara": ["quarterly revenue forecast budget", "net profit expenditure", "executive compensation bonus", "salary range for management"]}
s = Settings(proximity_threshold=0.0)
g = Gateway(Engine(s, make_embedder(s)), s, AclStore(), EventStore())
def prox(group):
    out = []
    for u, qs in group.items():
        for q in qs:
            r = g.evaluate(u, q); out.append(r["proximity"] or 0.0)
    return sorted(out)
b, p = prox(BENIGN), prox(PROBES)
print("benign max proximity: %.3f   probe min: %.3f   probe median: %.3f" % (b[-1], p[0], p[len(p)//2]))
for t in (0.20, 0.25, 0.30, 0.35, 0.40):
    print("threshold %.2f: benign flagged %d/%d | probes flagged %d/%d" % (t, sum(x >= t for x in b), len(b), sum(x >= t for x in p), len(p)))
