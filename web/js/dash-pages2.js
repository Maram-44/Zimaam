/* Dashboard pages 2/2: employees & access, access audit, settings. */
(function () {
  const { h, icon, t } = Z, D = Z.D;
  const card = (kids, cls) => h("section", { class: "card " + (cls || "") }, kids);
  const docName = (id) => (id ? t("doc." + id) : "—");

  /* ================= employees list ================= */
  D.pages.employees = {
    title: "d.employees",
    mount(view) {
      const S = (D.state.emp = D.state.emp || { q: "", dept: "", title: "" }); let seq = 0, data = null;
      const body = h("div"), bar = h("div", { class: "toolbar" }); body.append(D.skel(5, 22));
      view.append(D.pagehead(t("em.h"), t("em.sub")), card([bar, body], ""));
      const draw = () => {
        if (!data) return; const items = data.items, titles = [...new Set(items.map((e) => Z.title(e)))];
        const ql = S.q.trim().toLowerCase();
        const rows = items.filter((e) => (!S.dept || e.dept === S.dept) && (!S.title || Z.title(e) === S.title) && (!ql || [e.id, e.name_en, e.name_ar, e.title_en, e.title_ar].join(" ").toLowerCase().includes(ql)));
        if (!bar.firstChild) bar.append(D.search(S.q, (v) => { S.q = v; draw(); }), D.select([["", t("f.dept") + ": " + t("f.all")], ...["hr", "finance", "sales"].map((d) => [d, t("dept." + d)])], S.dept, (v) => { S.dept = v; draw(); }, t("f.dept")), D.select([["", t("f.role") + ": " + t("f.all")], ...titles.map((x) => [x, x])], S.title, (v) => { S.title = v; draw(); }, t("f.role")));
        if (!rows.length) { body.replaceChildren(D.empty("users", t("em.none"), t("ev.nomatch.d"))); return; }
        const go = (e) => D.go("/dashboard/employees/" + e.id), tot = items[0] ? items[0].docs.length : 0;
        body.replaceChildren(h("div", { class: "tblwrap" }, h("table", { class: "tbl stack" }, h("thead", null, h("tr", null, [t("col.emp"), t("col.dept"), t("col.role"), t("col.status"), t("col.access"), t("col.flags")].map((x) => h("th", null, x)))),
          h("tbody", null, rows.map((e) => { const g = e.docs.filter((d) => d.granted).length;
            return h("tr", { class: "row", tabindex: "0", onclick: () => go(e), onkeydown: (k) => k.key === "Enter" && go(e) },
              h("td", { "data-label": t("col.emp") }, D.person(e)), h("td", { "data-label": t("col.dept") }, Z.dept(e)), h("td", { "data-label": t("col.role") }, Z.title(e)),
              h("td", { "data-label": t("col.status") }, Z.badge("ok", t("em.active"))),
              h("td", { "data-label": t("col.access") }, t("em.docs", { n: g, m: tot }), e.extra_grants.length ? h("span", { class: "chip", style: "margin-inline-start:6px" }, t("em.extra")) : null, e.revoked.length ? h("span", { class: "chip", style: "margin-inline-start:6px;background:var(--bad-bg);color:var(--bad)" }, t("em.revoke") + " " + e.revoked.length) : null),
              h("td", { "data-label": t("col.flags") }, e.suspicious_count ? Z.badge("warn", t("em.susp", { n: e.suspicious_count })) : h("span", { class: "muted" }, "—"), e.cases.length ? h("span", { style: "margin-inline-start:6px" }, Z.badge("bad", t("em.cases", { n: e.cases.length }))) : null)); })))));
      };
      const inst = {
        refresh: async () => { const my = ++seq; try { const r = await D.A("/admin/employees"); if (my !== seq) return; data = r; draw(); } catch (e) { if (e.status !== 401) body.replaceChildren(D.err(e.message, inst.refresh)); } },
        destroy() { seq++; },
      };
      return inst;
    },
  };

  /* ================= employee detail ================= */
  const empDetail = {
    title: "d.employees",
    mount(view, uid) {
      let seq = 0, busy = false; const host = h("div", { style: "display:grid;gap:20px" }); host.append(D.skel(6, 24)); view.append(host);
      const apply = async (revoke, restore, okKey) => {
        if (busy) return; busy = true;
        try { const r = await D.A("/admin/employees/" + encodeURIComponent(uid) + "/permissions", { body: { revoke, restore } }); Z.toast(okKey ? t(okKey) : t("em.mod.ok", { n: r.changed }), "ok"); }
        catch (e) { Z.toast(e.message, "bad"); }
        busy = false; await inst.refresh(); D.chrome();
      };
      const one = async (e, d, grant) => {
        const ok = await Z.confirm({ title: t(grant ? "em.rs.t" : "em.rv.t"), body: t(grant ? "em.rs.b" : "em.rv.b", { n: Z.nm(e), d: Z.doc(d) }), ok: t(grant ? "em.restore" : "em.revoke"), danger: !grant });
        if (ok) apply(grant ? [] : [d.id], grant ? [d.id] : [], grant ? "em.rs.ok" : "em.rv.ok");
      };
      const modify = async (e) => {
        const rows = e.docs.map((d) => ({ d, cb: h("input", { type: "checkbox", id: "cb-" + d.id, checked: d.granted }) })), sum = h("p", { class: "sm muted", style: "margin-top:10px" }, " ");
        const diff = () => ({ rv: rows.filter((r) => r.d.granted && !r.cb.checked).map((r) => r.d.id), rs: rows.filter((r) => !r.d.granted && r.cb.checked).map((r) => r.d.id) });
        const upd = () => { const { rv, rs } = diff(); sum.textContent = rv.length || rs.length ? t("em.mod.sum", { r: rv.length, s: rs.length }) : t("em.mod.none"); }; rows.forEach((r) => (r.cb.onchange = upd)); upd();
        const ok = await Z.dialog({ title: t("em.mod.t", { n: Z.nm(e) }), cancelValue: false, body: h("div", null, h("p", { class: "muted sm" }, t("em.mod.p")), ...rows.map((r) => h("label", { class: "perm", for: "cb-" + r.d.id, style: "cursor:pointer" }, r.cb, h("div", { class: "nm" }, h("b", null, Z.doc(r.d)), h("span", { class: "sm muted" }, r.d.via_role ? t("em.via") : t("em.extra"))))), sum),
          buttons: [{ label: t("c.cancel"), value: false }, { label: t("em.mod.apply"), value: true, cls: "primary" }] });
        if (!ok) return; const { rv, rs } = diff(); if (!rv.length && !rs.length) return Z.toast(t("em.mod.none"), "warn");
        const sure = await Z.confirm({ title: t("em.mod.apply"), body: t("em.mod.sum", { r: rv.map(docName).join("، ") || "0", s: rs.map(docName).join("، ") || "0" }), ok: t("c.confirm"), danger: rv.length > 0 }); if (sure) apply(rv, rs, null);
      };
      const inst = {
        refresh: async () => {
          const my = ++seq; let e;
          try { e = await D.A("/admin/employees/" + encodeURIComponent(uid)); }
          catch (er) { if (er.status === 401) return; if (my === seq) host.replaceChildren(er.status === 404 ? card([D.empty("users", t("em.none"), "", [D.link("/dashboard/employees", t("em.back"), "btn primary sm")])]) : D.err(er.message, inst.refresh)); return; }
          if (my !== seq) return;
          const stale = e.stale_exposed.length ? h("div", { class: "banner warn" }, icon("alert"), h("div", { style: "display:grid;gap:8px" }, h("span", null, t("em.stale", { d: Z.nm(e), x: e.stale_exposed.map(docName).join("، ") })),
            h("div", null, h("button", { class: "btn sm", type: "button", onclick: async () => { try { await D.A("/admin/sync", { body: {} }); Z.toast(t("em.synced"), "ok"); await inst.refresh(); D.chrome(); } catch (er2) { Z.toast(er2.message, "bad"); } } }, icon("refresh"), t("em.syncnow"))))) : null;
          const kp = (k, v, c) => h("div", { class: "card kpi " + (c || "") }, h("div", { class: "k" }, t(k)), h("div", { class: "v num" }, v));
          const perms = e.docs.map((d) => h("div", { class: "perm" }, h("div", { class: "nm" }, h("b", null, Z.doc(d), d.sensitive ? h("span", { class: "chip", style: "margin-inline-start:8px" }, t("cs.sensitive")) : null), h("span", { class: "sm muted" }, d.granted ? (d.via_role ? t("em.via") : t("em.extra")) : "")),
            Z.badge(d.granted ? "ok" : "mute", d.granted ? t("em.granted") : t("em.nogr")),
            d.granted ? h("button", { class: "btn sm", type: "button", onclick: () => one(e, d, false) }, icon("lock"), t("em.revoke")) : h("button", { class: "btn sm", type: "button", onclick: () => one(e, d, true) }, icon("undo"), t("em.restore"))));
          const recent = e.recent.length ? h("div", { class: "tblwrap" }, h("table", { class: "tbl" }, h("tbody", null, e.recent.map((x) => h("tr", null, h("td", null, Z.ltr(Z.fmtDT(x.ts))), h("td", null, Z.doc(x.target_info)), h("td", null, Z.decisionBadge(x)), h("td", null, Z.riskBadge(x.risk))))))) : h("p", { class: "muted sm" }, t("em.noact"));
          host.replaceChildren(D.link("/dashboard/employees", [icon("chevl", "rtl-flip"), t("em.back")], "btn sm ghost"),
            h("div", { class: "pagehead" }, h("div", { class: "who" }, (() => { const a = Z.avatar(e); a.style.cssText = "width:56px;height:56px;font-size:22px;margin:0"; return a; })(), h("div", null, h("h2", { style: "font-size:22px" }, Z.nm(e)), h("p", { style: "margin-top:2px" }, Z.title(e) + " · " + Z.dept(e)))), h("div", { style: "display:flex;gap:8px;flex-wrap:wrap" }, Z.badge("ok", t("em.active")), h("button", { class: "btn sm primary", type: "button", onclick: () => modify(e) }, icon("key"), t("em.modify")), h("a", { class: "btn sm", href: "/portal", target: "_blank", rel: "noopener" }, icon("user"), t("em.test")))),
            stale || h("span", { hidden: "" }), h("div", { class: "kpis", style: "grid-template-columns:repeat(4,minmax(0,1fr))" }, kp("em.k.ev", e.event_count), kp("em.k.susp", e.suspicious_count, e.suspicious_count ? "warn" : ""), kp("em.k.den", e.denied_count), kp("em.k.cs", e.cases.length, e.cases.length ? "bad" : "")),
            h("div", { class: "g2e" }, card([h("h3", null, t("em.perms")), h("div", null, perms)], "ch"),
              h("div", { style: "display:grid;gap:20px;align-content:start;min-width:0" }, card([h("h3", null, t("em.cases")), e.cases.length ? e.cases.map((c) => h("a", { class: "perm", href: "/dashboard/cases/" + c.id, "data-link": "", style: "text-decoration:none" }, h("div", { class: "nm" }, h("b", { class: "ltr" }, c.id), h("span", { class: "sm muted" }, Z.doc(c.resource_info) + " · " + c.attempts)), Z.riskBadge(c.severity), Z.statusBadge(c.status))) : h("p", { class: "muted sm" }, t("em.nocases"))], "ch"),
                card([h("h3", null, t("em.recent") + " (UTC)"), recent], "ch"))));
        }, destroy() { seq++; },
      };
      return inst;
    },
  };
  D.pages.employees_detail = empDetail;

  /* ================= audit ================= */
  const KINDS = ["query", "permission_revoked", "permission_restored", "case_status", "mode_change", "setting_change", "acl_sync", "admin_login", "seed"];
  function detailText(r) {
    const d = r.detail || "", a = r.action; let m;
    if (a === "query") return (m = d.match(/^closest protected: (.+)$/)) ? t("dt.closest", { d: docName(m[1]) }) : "";
    if (a === "permission_revoked" || a === "permission_restored") return t("dt.srcacl");
    if (a === "case_status" && (m = d.match(/^(CASE-\d+): (\w+) -> (\w+)$/))) return m[1] + ": " + t("status." + m[2]) + " → " + t("status." + m[3]);
    if (a === "mode_change" && (m = d.match(/: (\w+)$/))) return t("dt.mode", { m: t(m[1] === "live" ? "se.live" : "se.snap") });
    if (a === "acl_sync" && (m = d.match(/^(\d+)/))) return t("dt.sync", { n: m[1] });
    if (a === "seed" && (m = d.match(/^(\d+)/))) return t("dt.seed", { n: m[1] });
    if (a === "setting_change") return t("dt.reveal", { v: t(/True/i.test(d) ? "dt.on" : "dt.off") });
    if (a === "admin_login") return t("dt.demo");
    return "";
  }
  D.pages.audit = {
    title: "d.audit",
    mount(view) {
      const S = (D.state.aud = D.state.aud || { q: "", kind: "", page: 1, size: 12 }); let seq = 0, people = {};
      const bt = h("div"), body = h("div"), toolbar = h("div", { class: "toolbar" }); body.append(D.skel(6, 20));
      const nameOf = (id) => (people[id] ? Z.nm(people[id]) : id || "—");
      const runBt = async (btn) => {
        btn.disabled = true;
        try { const r = await D.A("/admin/boundary"); bt.replaceChildren(h("div", { style: "display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px", class: "btgrid" },
          [[t("au.bt.mode"), t(r.mode === "live" ? "se.live" : "se.snap")], [t("au.bt.leak"), Math.round(r.leak_rate * 100) + "%"], [t("au.bt.recall"), Math.round(r.authorized_recall * 100) + "%"], [t("au.bt.pairs"), t("au.bt.leaks", { n: r.leaks, m: r.forbidden_pairs })]].map(([k, v], i) => h("div", { class: "card kpi " + (i === 1 ? (r.leaks ? "bad" : "ok") : "") }, h("div", { class: "k" }, k), h("div", { class: "v num", style: "font-size:" + (i === 0 || i === 3 ? "17px" : "28px") }, v))))); }
        catch (e) { if (e.status !== 401) Z.toast(e.message, "bad"); }
        btn.disabled = false;
      };
      const runBtn = h("button", { class: "btn sm", type: "button", onclick: (e) => runBt(e.currentTarget) }, icon("play"), t("au.bt.run"));
      toolbar.append(D.search(S.q, (v) => { S.q = v; S.page = 1; inst.refresh(); }), D.select([["", t("f.kind") + ": " + t("f.all")], ...KINDS.map((k) => [k, t("act." + k)])], S.kind, (v) => { S.kind = v; S.page = 1; inst.refresh(); }, t("f.kind")));
      view.append(D.pagehead(t("au.h"), t("au.sub")), card([h("div", { class: "top" }, h("div", null, h("h3", null, t("au.bt")), h("p", { class: "sm muted", style: "margin-top:4px" }, t("au.bt.p"))), runBtn), bt], "ch"), card([toolbar, body], ""));
      const inst = {
        refresh: async () => {
          const my = ++seq;
          try {
            if (!Object.keys(people).length) { const ee = await D.A("/admin/employees"); ee.items.forEach((p) => (people[p.id] = p)); }
            const r = await D.A("/admin/audit?" + new URLSearchParams({ q: S.q, kind: S.kind, page: S.page, size: S.size })); if (my !== seq) return;
            if (!r.items.length) { body.replaceChildren(D.empty("audit", t("au.none"), t("au.none.d"))); return; }
            const who = (x) => (x.actor_type === "employee" ? nameOf(x.actor) : t("who." + x.actor_type));
            const res = (x) => (x.result === "answered" ? Z.badge("ok", t("dec.answered")) : x.result === "denied" ? Z.badge("bad", t("dec.denied")) : Z.badge("ok", t("res.ok")));
            body.replaceChildren(h("div", { class: "tblwrap" }, h("table", { class: "tbl stack" }, h("thead", null, h("tr", null, [t("col.time") + " (UTC)", t("col.actor"), t("col.action"), t("col.affected"), t("col.target"), t("col.result"), t("col.detail")].map((x) => h("th", null, x)))),
              h("tbody", null, r.items.map((x) => h("tr", null, h("td", { "data-label": t("col.time") }, Z.ltr(Z.fmtDT(x.ts))), h("td", { "data-label": t("col.actor") }, h("b", { style: "font-weight:600" }, who(x))), h("td", { "data-label": t("col.action") }, t("act." + x.action)),
                h("td", { "data-label": t("col.affected") }, x.action === "query" || !x.subject ? "—" : nameOf(x.subject)), h("td", { "data-label": t("col.target") }, docName(x.resource)), h("td", { "data-label": t("col.result") }, res(x)), h("td", { "data-label": t("col.detail"), class: "sm muted" }, detailText(x))))))), D.pager(r.total, S.page, S.size, (p) => { S.page = p; inst.refresh(); }));
          } catch (e) { if (e.status !== 401 && my === seq) body.replaceChildren(D.err(e.message, inst.refresh)); }
        }, destroy() { seq++; },
      };
      return inst;
    },
  };

  /* ================= settings ================= */
  D.pages.settings = {
    title: "d.settings",
    mount(view) {
      let seq = 0, busy = false; const host = h("div", { style: "display:grid;gap:20px" }); host.append(D.skel(6, 24)); view.append(D.pagehead(t("se.h"), t("se.sub")), host);
      const post = async (body, msg) => { if (busy) return; busy = true; try { await D.A("/admin/settings", { body }); if (msg) Z.toast(t(msg), "ok"); } catch (e) { Z.toast(e.message, "bad"); } busy = false; await inst.refresh(); D.chrome(); };
      const copy = async (path) => Z.toast(t((await Z.copy(Z.shareUrl(path))) ? "se.copied" : "se.copyfail"), "ok");
      const inst = {
        refresh: async () => {
          const my = ++seq; let s;
          try { s = await D.A("/admin/settings"); } catch (e) { if (e.status !== 401 && my === seq) host.replaceChildren(D.err(e.message, inst.refresh)); return; }
          if (my !== seq) return;
          const rv = h("input", { type: "checkbox", id: "rv", checked: s.reveal_denial }); rv.onchange = () => post({ reveal_denial: rv.checked }, "se.saved");
          const li = (k) => h("li", null, t(k));
          host.replaceChildren(
            h("div", { class: "g2e" },
              card([h("h3", null, t("se.mode")), h("p", { class: "sm muted" }, t("se.mode.p")), D.seg([["live", t("se.live")], ["snapshot", t("se.snap")]], s.acl_mode, (v) => v !== s.acl_mode && post({ acl_mode: v }, "se.saved")),
                h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" }, Z.badge(s.pending_sync ? "warn" : "mute", t("se.pending", { n: s.pending_sync })), h("button", { class: "btn sm", type: "button", disabled: !s.pending_sync, onclick: async () => { try { await D.A("/admin/sync", { body: {} }); Z.toast(t("em.synced"), "ok"); inst.refresh(); D.chrome(); } catch (e) { Z.toast(e.message, "bad"); } } }, icon("refresh"), t("se.sync")))], "ch"),
              card([h("h3", null, t("se.reveal")), h("p", { class: "sm muted" }, t("se.reveal.p")), h("label", { class: "switch", for: "rv" }, rv, h("span", null, t("se.reveal")))], "ch")),
            h("div", { class: "g2e" },
              card([h("h3", null, t("se.det")), h("dl", { class: "kv" }, [[t("se.thr"), t("se.thr.v", { n: s.threshold })], [t("se.win"), t("se.win.v", { n: s.window_days })], [t("se.prox"), Z.ltr(String(s.proximity_threshold))], [t("se.emb"), t("se.emb.v")]].flatMap(([k, v]) => [h("dt", null, k), h("dd", null, v)]))], "ch"),
              card([h("h3", null, t("se.priv")), h("div", { class: "g2e", style: "gap:14px" }, h("div", null, h("b", { class: "sm", style: "color:var(--ok)" }, t("se.stored")), h("ul", { class: "sm", style: "margin:6px 0 0;padding-inline-start:18px;display:grid;gap:3px" }, ["st.user", "st.role", "st.time", "st.decision", "st.served", "st.leak", "st.closest", "st.sim", "st.hash"].map(li))),
                h("div", null, h("b", { class: "sm", style: "color:var(--bad)" }, t("se.nstored")), h("ul", { class: "sm", style: "margin:6px 0 0;padding-inline-start:18px;display:grid;gap:3px" }, ["st.qt", "st.dc"].map(li))))], "ch")),
            h("div", { class: "g2e" },
              card([h("h3", null, t("se.demo")), h("div", { style: "display:flex;gap:10px;flex-wrap:wrap" },
                h("button", { class: "btn", type: "button", disabled: s.seeded, onclick: async () => { try { await D.A("/admin/seed", { body: {} }); Z.toast(t("ov.seeded"), "ok"); inst.refresh(); } catch (e) { Z.toast(e.message, "bad"); } } }, icon("db"), s.seeded ? t("se.seeded") : t("se.seed")),
                h("button", { class: "btn danger", type: "button", onclick: async () => { if (await Z.confirm({ title: t("se.reset.t"), body: t("se.reset.b"), ok: t("se.reset"), danger: true })) { try { await D.A("/admin/reset", { body: {} }); Z.toast(t("se.reset.ok"), "ok"); inst.refresh(); D.chrome(); } catch (e) { Z.toast(e.message, "bad"); } } } }, icon("trash"), t("se.reset")))], "ch"),
              card([h("h3", null, t("se.share")), h("p", { class: "sm muted" }, t("se.share.p")), h("div", { style: "display:flex;gap:10px;flex-wrap:wrap" }, h("button", { class: "btn sm", type: "button", onclick: () => copy("/portal") }, icon("globe"), t("se.share.portal")), h("button", { class: "btn sm", type: "button", onclick: () => copy("/dashboard") }, icon("globe"), t("se.share.dash")))], "ch")),
            card([h("h3", null, t("se.real")), h("ul", { style: "margin:0;padding-inline-start:18px;display:grid;gap:8px;color:var(--ink-2)" }, ["se.r1", "se.r2", "se.r3"].map(li))], "ch"));
        }, destroy() { seq++; },
      };
      return inst;
    },
  };

  D.start();
})();
