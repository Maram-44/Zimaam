"""Windowed counting on the 'close to a protected resource' signal.

Per (user, resource) inside a rolling window: count events whose closest forbidden resource is that
resource, regardless of whether the request was denied or answered from another document.
Alert when count >= threshold (per role). Transparent score, no ML."""
from collections import defaultdict
from .corpus import DOCS

DAY = 86400.0


def threshold_for(settings, role):
    return int(settings.role_thresholds.get(role, settings.default_threshold))


def severity_of(score, leak):
    return "high" if (leak or score >= 80) else ("medium" if score >= 40 else "low")


def build_alerts(store, settings, as_of=None, user_id=None):
    as_of = as_of if as_of is not None else (store.last_ts() or 0.0)
    events = store.between(as_of - settings.window_days * DAY, as_of, user_id)
    groups = defaultdict(list)
    for e in events:
        if e["closest_doc"]:
            groups[(e["user_id"], e["closest_doc"])].append(e)
    alerts = []
    for (u, doc), evs in groups.items():
        role = evs[0]["role"]; thr = threshold_for(settings, role)
        count = len(evs)
        if count < thr:
            continue
        leaks = sum(1 for e in evs if e["leak"])
        denied = sum(1 for e in evs if e["decision"] == "denied")
        days = len({int(e["ts"] // DAY) for e in evs})
        ratio = count / thr
        score = min(100, round(40 * min(ratio, 2.0) + (10 if DOCS[doc]["sensitive"] else 0) + (10 if leaks else 0)))
        alerts.append({
            "user_id": u, "role": role, "resource": doc, "resource_title": DOCS[doc]["title"],
            "sensitive": DOCS[doc]["sensitive"], "events": count, "threshold": thr,
            "denied": denied, "answered_elsewhere": count - denied - leaks, "leaks": leaks,
            "distinct_days": days, "first_ts": evs[0]["ts"], "last_ts": evs[-1]["ts"],
            "score": score, "severity": severity_of(score, leaks),
            "window_days": settings.window_days})
    alerts.sort(key=lambda a: (-a["score"], a["user_id"]))
    return alerts


def window_counts(store, settings, as_of):
    """Progress toward the alert threshold for every (user, resource) pair with at least one event."""
    events = store.between(as_of - settings.window_days * DAY, as_of)
    groups = defaultdict(int)
    role = {}
    for e in events:
        if e["closest_doc"]:
            groups[(e["user_id"], e["closest_doc"])] += 1
            role[e["user_id"]] = e["role"]
    return [{"user_id": u, "resource": doc, "events": n, "threshold": threshold_for(settings, role[u])}
            for (u, doc), n in sorted(groups.items())]
