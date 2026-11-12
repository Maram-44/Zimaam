"""The SIAAJ gateway sits in the retrieval path.

Engine  = shared, read-only (embedder + document vectors), built once at startup.
Gateway = per-session view (that session's ACLs, event log and mode).

For every query the gateway (1) enforces access per the ACL mode, (2) computes which protected
resource the query is closest to, (3) logs METADATA ONLY.
"""
import hashlib, re, time
import numpy as np
from .corpus import DOCS


class Engine:
    def __init__(self, settings, embedder):
        self.emb = embedder
        self.chunks = {d: info["chunks"] for d, info in DOCS.items()}
        allt = [c for cs in self.chunks.values() for c in cs]
        self.emb.fit(allt + [i["probe"] for i in DOCS.values()])
        self.mats = {d: self.emb.encode(cs) for d, cs in self.chunks.items()}


class Gateway:
    def __init__(self, engine, settings, acl, store, mode="live"):
        self.e, self.s, self.acl, self.store, self.mode = engine, settings, acl, store, mode

    # ---- pure evaluation (no logging) ----
    def evaluate(self, user_id, query):
        qv = self.e.emb.encode([query])[0]
        scores, best_chunk = {}, {}
        for d, m in self.e.mats.items():
            sims = m @ qv
            i = int(np.argmax(sims)); scores[d] = float(sims[i]); best_chunk[d] = i
        ranked = sorted(scores.items(), key=lambda kv: -kv[1])
        enforce = self.acl.allowed(user_id, self.mode)
        truth = self.acl.allowed(user_id, "live")

        served, decision = None, "no_match"
        top_doc, top_score = ranked[0]
        if top_score >= self.s.retrieve_threshold:
            if top_doc in enforce:
                served, decision = top_doc, "answered"
            else:
                decision = "denied"          # best match is not readable; fall back to the best readable one
                for d, sc in ranked:
                    if d in enforce and sc >= self.s.retrieve_threshold:
                        served = d; break
        leak = served is not None and served not in truth

        closest, prox = None, None
        for d, sc in ranked:
            if d not in truth and sc >= self.s.proximity_threshold:
                closest, prox = d, sc; break

        answer = ("No accessible document matches your question." if served is None else
                  "Based on %s: %s" % (DOCS[served]["title"], self.e.chunks[served][best_chunk[served]]))
        return {"answer": answer, "served_doc": served, "decision": decision, "leak": leak,
                "closest_doc": closest, "proximity": prox}

    # ---- the real entry point ----
    def handle(self, user_id, query, ts=None):
        r = self.evaluate(user_id, query)
        norm = re.sub(r"\s+", " ", query.strip().lower())
        qh = hashlib.sha256((self.s.query_salt + norm).encode()).hexdigest()[:16]
        self.store.add({"ts": ts if ts is not None else time.time(), "user_id": user_id,
                        "role": self.acl.role[user_id], "decision": r["decision"],
                        "served_doc": r["served_doc"], "leak": r["leak"],
                        "closest_doc": r["closest_doc"], "proximity": r["proximity"], "query_hash": qh})
        return r
