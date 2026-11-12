"""One isolated sandbox per visitor (X-Session-Id). Shared: the Engine. Private: ACLs, event log, mode."""
import re, threading, time
from .acl import AclStore
from .store import EventStore
from .gateway import Gateway

SID_RE = re.compile(r"^[A-Za-z0-9_-]{8,64}$")


class Session:
    def __init__(self, sid, engine, settings):
        self.id, self.engine, self.settings = sid, engine, settings
        self.lock = threading.RLock()
        self.touched = time.time()
        self.scenario = None          # (scenario_id, last_step_done)
        self.clock = time.time()      # simulated clock: advances as the story moves
        self.rev = 0                  # bumps on every change; the live stream watches it
        self.tokens = {}              # token -> {"kind": "admin"|"employee", "user_id": ...}  (demo auth, per sandbox)
        self._build()

    def _build(self):
        self.acl = AclStore()
        self.store = EventStore(":memory:")
        self.gw = Gateway(self.engine, self.settings, self.acl, self.store, mode="live")
        self.case_meta = {}           # (user, resource) -> case record (id, status, history, last snapshot)
        self.audit_log = []           # administrative actions
        self.seeded = False
        self.reveal_denial = True     # demo clarity; production should keep this off (see Settings page)

    def reset(self):
        with self.lock:
            self.store.close()
            self.scenario = None
            self.clock = time.time()
            self._build()
            self.rev += 1


class SessionManager:
    def __init__(self, settings, engine):
        self.s, self.engine, self.lock, self.items = settings, engine, threading.Lock(), {}

    def get(self, sid):
        if not SID_RE.match(sid or ""):
            raise ValueError("X-Session-Id must be 8-64 chars: letters, digits, _ or -")
        now = time.time()
        with self.lock:
            ttl = self.s.session_ttl_minutes * 60
            for k in [k for k, v in self.items.items() if now - v.touched > ttl]:
                self.items.pop(k).store.close()
            if sid not in self.items:
                if len(self.items) >= self.s.max_sessions:          # evict the least recently used
                    k = min(self.items, key=lambda k: self.items[k].touched)
                    self.items.pop(k).store.close()
                self.items[sid] = Session(sid, self.engine, self.s)
            sess = self.items[sid]; sess.touched = now
            return sess

    def count(self):
        with self.lock:
            return len(self.items)
