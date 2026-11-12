"""Boundary audit: for every (user, document) pair, ask a canonical question as that user and compare
what the system serves with the SOURCE ACL. Reports leaks and the authorized-user recall."""
from .corpus import DOCS


def boundary_audit(gateway):
    acl, leaks, forbidden, allowed_total, allowed_ok = gateway.acl, [], 0, 0, 0
    for u in acl.users():
        truth = acl.allowed(u, "live")
        for doc, info in DOCS.items():
            r = gateway.evaluate(u, info["probe"])
            if doc in truth:
                allowed_total += 1
                allowed_ok += int(r["served_doc"] == doc)
            else:
                forbidden += 1
                if r["served_doc"] is not None and r["served_doc"] not in truth:
                    leaks.append({"user_id": u, "asked_about": doc, "served_doc": r["served_doc"]})
    return {"mode": gateway.mode, "forbidden_pairs": forbidden, "leaks": leaks,
            "leak_rate": round(len(leaks) / max(1, forbidden), 4),
            "authorized_recall": round(allowed_ok / max(1, allowed_total), 4),
            "authorized_pairs": allowed_total}
