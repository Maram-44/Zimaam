"""Investigation report for one user. Evidence for human review, never a verdict on intent."""
from datetime import datetime, timezone
from .detector import build_alerts, DAY
from .corpus import DOCS


def _iso(ts):
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def build_case(store, settings, user_id, as_of=None):
    as_of = as_of if as_of is not None else (store.last_ts() or 0.0)
    evs = store.between(as_of - settings.window_days * DAY, as_of, user_id)
    related = [e for e in evs if e["closest_doc"]]
    alerts = build_alerts(store, settings, as_of, user_id)
    timeline = [{"time": _iso(e["ts"]), "decision": e["decision"], "leak": bool(e["leak"]),
                 "resource": e["closest_doc"], "proximity": round(e["proximity"], 3),
                 "query_ref": e["query_hash"]} for e in related]
    per_day = {}
    for e in related:
        d = _iso(e["ts"])[:10]; per_day[d] = per_day.get(d, 0) + 1
    steps = []
    if alerts:
        steps.append("Review the timeline with the user's manager and the data owner of the targeted resource(s).")
        steps.append("Check whether the user's role legitimately needs this information; consider a documented access request.")
        if any(a["leaks"] for a in alerts):
            steps.append("PRIORITY: content was served that the source ACL does not allow. Refresh the index ACLs and review what was returned.")
        steps.append("Retrieve the original queries through the approved process only if policy allows; reports store hashes, not text.")
    return {
        "user_id": user_id, "role": evs[0]["role"] if evs else None,
        "window": {"from": _iso(as_of - settings.window_days * DAY), "to": _iso(as_of)},
        "status": "alert" if alerts else "no_alert",
        "alerts": alerts, "events_in_window": len(evs), "related_events": len(related),
        "per_day": per_day, "timeline": timeline,
        "targeted_resources": sorted({a["resource"] for a in alerts}),
        "recommended_steps": steps,
        "limits": ["This is evidence of query patterns, not proof of intent.",
                   "Counts depend on the thresholds and the embedding model in use.",
                   "Reports contain metadata only: no query text and no document content."],
    }
