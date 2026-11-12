"""Event log. Metadata only: no query text, no document content."""
import sqlite3, threading

SCHEMA = """
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts REAL NOT NULL, user_id TEXT NOT NULL, role TEXT NOT NULL,
  decision TEXT NOT NULL,            -- answered | denied | no_match
  served_doc TEXT, leak INTEGER NOT NULL,
  closest_doc TEXT, proximity REAL,  -- closest resource the user may NOT read
  query_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_user_ts ON events(user_id, ts);
"""


class EventStore:
    def __init__(self, path=":memory:"):
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.lock = threading.Lock()
        with self.lock:
            self.db.executescript(SCHEMA)

    def add(self, e):
        with self.lock:
            cur = self.db.execute(
                "INSERT INTO events(ts,user_id,role,decision,served_doc,leak,closest_doc,proximity,query_hash)"
                " VALUES(?,?,?,?,?,?,?,?,?)",
                (e["ts"], e["user_id"], e["role"], e["decision"], e["served_doc"], int(e["leak"]),
                 e["closest_doc"], e["proximity"], e["query_hash"]))
            self.db.commit()
            return cur.lastrowid

    def between(self, t0, t1, user_id=None):
        q, a = "SELECT * FROM events WHERE ts>=? AND ts<=?", [t0, t1]
        if user_id:
            q += " AND user_id=?"; a.append(user_id)
        with self.lock:
            return [dict(r) for r in self.db.execute(q + " ORDER BY ts", a)]

    def recent(self, limit=50, after_id=0):
        with self.lock:
            rows = self.db.execute("SELECT * FROM events WHERE id>? ORDER BY id DESC LIMIT ?", (after_id, limit)).fetchall()
        return [dict(r) for r in rows]

    def max_id(self):
        with self.lock:
            return self.db.execute("SELECT COALESCE(MAX(id),0) m FROM events").fetchone()["m"]

    def close(self):
        with self.lock:
            self.db.close()

    def last_ts(self):
        with self.lock:
            r = self.db.execute("SELECT MAX(ts) m FROM events").fetchone()
        return r["m"]

    def count(self):
        with self.lock:
            return self.db.execute("SELECT COUNT(*) c FROM events").fetchone()["c"]
