"""Source-of-truth ACL plus a stale snapshot copy (to model indexing-time permissions)."""
import time
from .corpus import ROLE_DOCS, USERS


class AclStore:
    def __init__(self):
        self.role = {u: r for u, (r, _) in USERS.items()}
        self.source = {u: set(ROLE_DOCS[r]) | set(extra) for u, (r, extra) in USERS.items()}
        self.snapshot = {u: set(v) for u, v in self.source.items()}
        self.pending = []   # revocations not yet reflected in the snapshot: (user, doc, ts)

    def users(self):
        return list(self.role)

    def has_user(self, user_id):
        return user_id in self.role

    def allowed(self, user_id, mode):
        return (self.source if mode == "live" else self.snapshot)[user_id]

    def revoke(self, user_id, doc_id, ts=None):
        self.source[user_id].discard(doc_id)
        self.pending.append((user_id, doc_id, ts if ts is not None else time.time()))

    def grant(self, user_id, doc_id):
        self.source[user_id].add(doc_id)
        self.snapshot[user_id].add(doc_id)

    def sync(self, ts=None):
        now = ts if ts is not None else time.time()
        lags = [{"user_id": u, "doc_id": d, "lag_seconds": round(now - t, 3)} for u, d, t in self.pending]
        self.snapshot = {u: set(v) for u, v in self.source.items()}
        self.pending = []
        return lags
