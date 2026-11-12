/* Dashboard pages 1/2: overview, live activity, cases, case detail. */
(function () {
  const { h, icon, t } = Z, D = Z.D, C = Z.COLORS;
  const card = (kids, cls) => h("section", { class: "card " + (cls || "") }, kids);
  const legend = (items) => h("div", { class: "legend" }, items.map(([c, l]) => h("span", null, h("i", { style: "background:" + c }), l)));
  const demoTag = () => h("span", { class: "demo-tag" }, t("demo"));
  const deptLabel = (d) => t("dept." + d);

  /* ================= overview ================= */
  D.pages.overview = {
    title: "d.overview",
    mount(view) {
      const S = (D.state.ov = D.state.ov || { range: "24h", ev: { q: "", decision: "", risk: "", sort: "ts", order: "desc", page: 1, size: 8, range: "24h" } });
      S.ev.range = S.range; let seq = 0, last = {};
      const segHost = h("div"), seeded = h("span"), banner = h("div"), kpis = h("div", { class: "kpis" });
      const KP = [["total", "activity", ""], ["allowed", "check", "ok"], ["denied", "lock", "bad"], ["suspicious", "alert", "warn"], ["active_cases", "cases", ""], ["monitored", "users", ""]];
      const kEls = {}; KP.forEach(([k, ic, c]) => { const v = h("div", { class: "v num" }, h("span", { class: "skel", style: "display:inline-block;width:46px;height:26px" })); kEls[k] = v; const kk = { total: "k.total", allowed: "k.allowed", denied: "k.denied", suspicious: "k.susp", active_cases: "k.cases", monitored: "k.mon" }[k];
        kpis.append(h("div", { class: "card kpi " + c }, h("div", { class: "k" }, icon(ic), t(kk)), v, k === "active_cases" ? h("div", { class: "sm muted", id: "kNew" }, " ") : h("div", { class: "sm muted" }, " "))); });
      const hAct = h("div"), hRisk = h("div"), hDept = h("div"), hDec = h("div"), hTrend = h("div");
      const evt = D.eventsTable({ state: S.ev, toolbar: true, sortable: true, rebuild: () => { build(); } });
      const evHost = h("div");
      function build() { const nt = D.eventsTable({ state: S.ev, toolbar: true, sortable: true, rebuild: build }); evHost.replaceChildren(nt.el); inst.table = nt; nt.load(); }
      const inst = { table: evt };
      const draw = () => {
        segHost.replaceChildren(D.seg([["24h", t("r.24h")], ["7d", t("r.7d")], ["30d", t("r.30d")]], S.range, (v) => { S.range = S.ev.range = v; S.ev.page = 1; inst.refresh(); }));
      };
      draw();
      view.append(D.pagehead(t("d.overview"), t("ov.sub"), [seeded, segHost]), banner, kpis,
        h("div", { class: "g2" }, card([h("div", { class: "top" }, h("h3", null, t("c.act")), legend([[C.allowed, t("c.allowed")], [C.denied, t("c.denied")], [C.suspicious, t("c.susp")]])), hAct, h("p", { class: "sm muted" }, t("c.suspdef") + " · " + t("tz"))], "ch"),
          card([h("h3", null, t("c.risk")), hRisk], "ch")),
        h("div", { class: "g3" }, card([h("h3", null, t("c.dept")), hDept], "ch"), card([h("h3", null, t("c.dec")), hDec], "ch"), card([h("h3", null, t("c.trend")), hTrend], "ch")),
        card([h("div", { class: "top", style: "padding:18px 18px 0" }, h("h3", null, t("ov.recent"))), evHost], ""));
      evHost.append(evt.el);

      inst.refresh = async () => {
        const my = ++seq; let ov;
        try { ov = await D.A("/admin/overview?range=" + S.range); } catch (e) { if (e.status !== 401) banner.replaceChildren(D.err(e.message, inst.refresh)); return; }
        if (my !== seq) return; banner.replaceChildren(); draw();
        seeded.replaceChildren(ov.seeded ? demoTag() : "");
        KP.forEach(([k]) => { const v = ov.cards[k]; if (last[k] !== v) { kEls[k].textContent = v; if (last[k] != null) { kEls[k].classList.remove("bump"); void kEls[k].offsetWidth; kEls[k].classList.add("bump"); } last[k] = v; } });
        const kn = document.getElementById("kNew"); if (kn) kn.textContent = ov.cards.new_cases ? t("k.new", { n: ov.cards.new_cases }) : " ";
        if (!ov.cards.total) banner.replaceChildren(card([D.empty("shield", t("ov.empty.h"), t("ov.empty.p"), [
          h("a", { class: "btn primary", href: "/portal", target: "_blank", rel: "noopener" }, icon("user"), t("ov.portal")),
          h("button", { class: "btn", type: "button", disabled: ov.seeded, onclick: async (e) => { e.currentTarget.disabled = true; try { await D.A("/admin/seed", { body: {} }); Z.toast(t("ov.seeded"), "ok"); } catch (er) { Z.toast(er.message, "bad"); } } }, icon("db"), t("ov.seed"))])]));
        const labels = ov.series.allowed.map((_, i) => { const ts = ov.t0 + i * ov.bucket_seconds; return ov.bucket_seconds < 86400 ? Z.fmtT(ts) : Z.fmtD(ts); });
        Z.lineChart(hAct, { labels, aria: t("c.act"), series: [{ name: t("c.allowed"), values: ov.series.allowed, color: C.allowed, area: true }, { name: t("c.denied"), values: ov.series.denied, color: C.denied }, { name: t("c.susp"), values: ov.series.suspicious, color: C.suspicious, dash: true }] });
        const rk = ["none", "low", "medium", "high"], parts = rk.map((k) => ({ label: t("risk." + k), value: ov.risk[k], color: C[k] }));
        hRisk.replaceChildren(h("div", { class: "donutwrap" }, h("div", { id: "dRisk" }), legend(parts.map((p) => [p.color, p.label + " · " + p.value]))));
        Z.donut(hRisk.querySelector("#dRisk"), parts, t("events"));
        Z.hbars(hDept, ov.by_dept.map((d) => ({ label: t("dept." + d.dept), value: d.suspicious, color: C.suspicious })));
        const al = ov.cards.allowed, dn = ov.cards.denied, tot = al + dn;
        hDec.replaceChildren(h("div", { class: "donutwrap" }, h("div", { id: "dDec" }), h("div", null, legend([[C.allowed, t("dec.answered") + " · " + al], [C.denied, t("dec.denied") + " · " + dn]]), h("p", { class: "sm muted", style: "margin-top:10px" }, tot ? t("pct.allowed", { p: Math.round((al / tot) * 100) }) : "—"))));
        Z.donut(hDec.querySelector("#dDec"), [{ label: t("dec.answered"), value: al, color: C.allowed }, { label: t("dec.denied"), value: dn, color: C.denied }], t("events"));
        const { current: a, previous: b } = ov.trend, k = a === 0 && b === 0 ? "none" : a > b ? "up" : a < b ? "down" : "flat";
        hTrend.replaceChildren(h("div", { style: "display:flex;gap:12px;align-items:center" }, h("div", { class: "avatar", style: "margin:0;background:" + ({ up: "var(--bad)", down: "var(--ok)", flat: "var(--ink-3)", none: "var(--ink-3)" })[k] }, icon("trend", k === "down" ? "" : "")),
          h("div", null, h("b", { style: "font-size:17px" }, t("tr." + k)), h("div", { class: "sm muted" }, t("tr.cmp", { a, b })))));
        inst.table.load();
      };
      inst.destroy = () => { seq++; };
      return inst;
    },
  };

  /* ================= live ================= */
  D.pages.live = {
    title: "d.live",
    mount(view) {
      const S = { q: "", decision: "", risk: "", sort: "ts", order: "desc", page: 1, size: 20, range: "30d" }; let paused = false, seq = 0;
      const total = h("span", { class: "muted sm" }), banner = h("div"), open = h("div");
      const tbl = D.eventsTable({ state: S, toolbar: false, sortable: false, pager: false, onData: (r) => total.replaceChildren(t("lv.total", { n: r.total })) });
      const btn = h("button", { class: "btn sm", type: "button" });
      const pb = () => btn.replaceChildren(icon(paused ? "play" : "refresh"), paused ? t("lv.resume") : t("lv.pause"));
      btn.onclick = () => { paused = !paused; tbl.setPaused(paused); pb(); banner.replaceChildren(paused ? h("div", { class: "banner warn" }, icon("info"), h("span", null, t("lv.paused"))) : ""); if (!paused) inst.refresh(); };
      pb();
      view.append(D.pagehead(t("lv.h"), t("lv.sub"), [total, btn, h("a", { class: "btn sm", href: "/portal", target: "_blank", rel: "noopener" }, icon("user"), t("ov.portal"))]), banner,
        h("div", { class: "g2" }, card([tbl.el], ""), card([h("h3", null, t("lv.open")), open], "ch")));
      const inst = {
        refresh: async () => {
          const my = ++seq; await tbl.load();
          try { const r = await D.A("/admin/cases"); if (my !== seq) return; const f = r.items.filter((c) => c.status !== "resolved").slice(0, 6);
            open.replaceChildren(...(f.length ? f : [null]).map((c) => !c ? h("p", { class: "muted sm" }, t("lv.noopen")) : h("a", { class: "perm", href: "/dashboard/cases/" + c.id, "data-link": "", style: "text-decoration:none" }, Z.avatar(c.person), h("div", { class: "nm" }, h("b", null, c.id + " · " + Z.nm(c.person)), h("span", { class: "sm muted" }, Z.doc(c.resource_info) + " · " + c.attempts)), Z.riskBadge(c.severity), Z.statusBadge(c.status)))); } catch (e) {}
        }, destroy() { seq++; },
      };
      return inst;
    },
  };

  /* ================= cases list ================= */
  D.pages.cases = {
    title: "d.cases",
    mount(view) {
      const S = (D.state.cases = D.state.cases || { status: "" }); let seq = 0;
      const chips = h("div"), body = h("div"); body.append(D.skel(4, 22));
      view.append(D.pagehead(t("cs.h"), t("cs.sub"), [chips]), card([body], ""));
      const inst = {
        refresh: async () => {
          const my = ++seq; let r;
          try { r = await D.A("/admin/cases?status=" + S.status); } catch (e) { if (e.status !== 401) body.replaceChildren(D.err(e.message, inst.refresh)); return; }
          if (my !== seq) return; const c = r.counts, all = Object.values(c).reduce((a, b) => a + b, 0);
          chips.replaceChildren(D.seg([["", t("f.all") + " " + all], ...["new", "under_review", "reviewed", "resolved"].map((s) => [s, t("status." + s) + " " + c[s]])], S.status, (v) => { S.status = v; inst.refresh(); }));
          if (!r.items.length) { body.replaceChildren(D.empty("cases", t("cs.none"), t("cs.none.d", { n: 4, d: 3 }), [h("a", { class: "btn primary sm", href: "/portal", target: "_blank", rel: "noopener" }, t("ov.portal"))])); return; }
          const go = (c) => D.go("/dashboard/cases/" + c.id);
          const rows = r.items.map((c) => h("tr", { class: "row", tabindex: "0", onclick: () => go(c), onkeydown: (e) => e.key === "Enter" && go(c) },
            h("td", { "data-label": t("cs.id") }, h("b", { class: "ltr" }, c.id)), h("td", { "data-label": t("col.emp") }, D.person(c.person)), h("td", { "data-label": t("col.dept") }, Z.dept(c.person)),
            h("td", { "data-label": t("col.target") }, Z.doc(c.resource_info)), h("td", { "data-label": t("cs.attempts") }, h("span", { class: "num" }, c.attempts)),
            h("td", { "data-label": t("cs.first") }, Z.ltr(Z.fmtDT(c.first_seen))), h("td", { "data-label": t("cs.last") }, Z.ltr(Z.fmtDT(c.last_seen))),
            h("td", { "data-label": t("col.risk") }, Z.riskBadge(c.severity)), h("td", { "data-label": t("col.status") }, Z.statusBadge(c.status), c.in_window ? null : h("span", { class: "chip", style: "margin-inline-start:6px" }, t("cs.out")))));
          body.replaceChildren(h("div", { class: "tblwrap" }, h("table", { class: "tbl stack" }, h("thead", null, h("tr", null, [t("cs.id"), t("col.emp"), t("col.dept"), t("col.target"), t("cs.attempts"), t("cs.first") + " (UTC)", t("cs.last") + " (UTC)", t("col.risk"), t("col.status")].map((x) => h("th", null, x)))), h("tbody", null, rows))));
        }, destroy() { seq++; },
      };
      return inst;
    },
  };

  /* ================= case detail ================= */
  D.pages.cases_detail = null;
  const caseDetail = {
    title: "d.cases",
    mount(view, id) {
      let seq = 0, draft = null, draftStatus = null, busy = false; const host = h("div", { style: "display:grid;gap:20px" }); host.append(D.skel(6, 24)); view.append(host);
      const save = async (status) => {
        if (busy) return; busy = true;
        try { const body = { note: (draft || "").trim() || undefined }; if (status) body.status = status; await D.A("/admin/cases/" + encodeURIComponent(id), { method: "PATCH", body }); draft = null; draftStatus = null; Z.toast(t("cs.saved"), "ok"); busy = false; await inst.refresh(); D.chrome(); }
        catch (e) { busy = false; Z.toast(e.message, "bad"); }
      };
      const inst = {
        refresh: async () => {
          const my = ++seq; let c;
          try { c = await D.A("/admin/cases/" + encodeURIComponent(id)); }
          catch (e) { if (e.status === 401) return; if (my === seq) host.replaceChildren(e.status === 404 ? card([D.empty("cases", t("cs.nf"), "", [D.link("/dashboard/cases", t("cs.back"), "btn primary sm")])]) : D.err(e.message, inst.refresh)); return; }
          if (my !== seq) return; if (draftStatus == null) draftStatus = c.status; if (draft == null) draft = c.note || "";
          const p = c.person, th = c.threshold, parts = c.score_parts;
          const rs = c.reasons.map((r) => ({ count: () => t("rs.count", { n: r.n, d: r.days, th: r.threshold }), mix: () => t("rs.mix", { a: r.denied, b: r.elsewhere }), days: () => t("rs.days", { n: r.n }), sensitive: () => t("rs.sens"), leak: () => t("rs.leak", { n: r.n }) })[r.k]());
          const tl = c.timeline.map((e) => h("li", { class: e.leak ? "leak" : e.decision }, h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" }, Z.ltr(Z.fmtDT(e.ts)), Z.decisionBadge(e)), h("span", { class: "sm muted" }, t("ev.sim") + " ", Z.ltr(String(e.proximity)), " · ", h("span", { class: "mono ltr" }, e.ref))));
          const days = Object.entries(c.per_day).sort();
          const steps = ["stp.1", "stp.2"].concat(c.leaks ? ["stp.3"] : [], ["stp.4"]);
          const statusSel = D.select(["new", "under_review", "reviewed", "resolved"].map((s) => [s, t("status." + s)]), draftStatus, (v) => { draftStatus = v; }, t("cs.status"));
          const note = h("textarea", { rows: 3, maxlength: 300, "aria-label": t("cs.note"), placeholder: t("cs.note") }, draft); note.oninput = () => { draft = note.value; };
          const closedAlready = c.status === "reviewed" || c.status === "resolved";
          host.replaceChildren(
            D.link("/dashboard/cases", [icon("chevl", "rtl-flip"), t("cs.back")], "btn sm ghost"),
            h("div", { class: "pagehead" }, h("div", null, h("h2", { class: "ltr", style: "font-size:24px;display:inline-block" }, c.id), h("p", null, Z.nm(p) + " · " + Z.doc(c.resource_info) + " · " + t("cs.opened") + " ", Z.ltr(Z.fmtDT(c.opened)))), h("div", { style: "display:flex;gap:8px" }, Z.riskBadge(c.severity), Z.statusBadge(c.status))),
            h("div", { class: "banner" }, icon("info"), h("span", null, t("cs.frame"))),
            h("div", { class: "g2" },
              h("div", { style: "display:grid;gap:20px;align-content:start;min-width:0" },
                card([h("h3", null, t("cs.tl")), h("p", { class: "sm muted" }, t("cs.tl.note")), h("ul", { class: "tl" }, tl)], "ch"),
                h("div", { class: "g2e" }, card([h("h3", null, t("cs.why")), h("ul", { style: "margin:0;padding-inline-start:18px;display:grid;gap:8px;color:var(--ink-2)" }, rs.map((x) => h("li", null, x)))], "ch"),
                  card([h("h3", null, t("cs.score") + " ", h("span", { class: "num" }, c.score + "/100")),
                    ...[[t("cs.s.prox"), parts.proximity, 80], [t("cs.s.sens"), parts.sensitive, 10], [t("cs.s.leak"), parts.leak, 10]].map(([l, v, m]) => h("div", null, h("div", { class: "sm", style: "display:flex;justify-content:space-between" }, h("span", null, l), h("b", { class: "num" }, "+" + v)), h("div", { class: "sev-bar", style: "margin-top:4px" }, h("i", { style: "width:" + (v / m) * 100 + "%" })))),
                    h("div", { class: "sm muted" }, t("cs.attempts") + ": " + c.attempts + " / " + th)], "ch")),
                card([h("h3", null, t("cs.perday") + " (UTC)"), (() => { const x = h("div"); Z.hbars(x, days.map(([d, n]) => ({ label: d.slice(5), value: n, color: C.suspicious }))); return x; })()], "ch")),
              h("div", { style: "display:grid;gap:20px;align-content:start;min-width:0" },
                card([h("h3", null, t("cs.empcard")), h("div", { class: "who" }, Z.avatar(p), h("div", null, h("b", null, Z.nm(p)), h("div", { class: "sm muted" }, Z.title(p) + " · " + Z.dept(p)))),
                  h("dl", { class: "kv" }, h("dt", null, t("cs.res")), h("dd", null, Z.doc(c.resource_info), c.resource_info.sensitive ? h("span", { class: "chip", style: "margin-inline-start:8px" }, t("cs.sensitive")) : null)),
                  D.link("/dashboard/employees/" + c.user_id, [icon("users"), t("d.employees")], "btn sm")], "ch"),
                card([h("h3", null, t("cs.review")), h("label", { class: "sm muted" }, t("cs.status")), statusSel, note,
                  h("div", { style: "display:flex;gap:10px;flex-wrap:wrap" }, h("button", { class: "btn primary", type: "button", disabled: closedAlready, onclick: () => save("reviewed") }, icon("check"), t("cs.mark")), h("button", { class: "btn", type: "button", onclick: () => save(draftStatus !== c.status ? draftStatus : null) }, t("cs.save"))),
                  h("div", null, h("h3", { style: "font-size:13px;margin-bottom:6px" }, t("cs.hist")), c.history.length ? c.history.slice().reverse().map((x) => h("div", { class: "sm", style: "padding:6px 0;border-bottom:1px solid var(--line-2)" }, Z.ltr(Z.fmtDT(x.ts)) , " · ", x.from !== x.to ? t("status." + x.from) + " → " + t("status." + x.to) : "", x.note ? h("div", { class: "muted" }, x.note) : null)) : h("p", { class: "sm muted" }, t("cs.nohist")))], "ch"),
                card([h("h3", null, t("cs.steps")), h("ol", { style: "margin:0;padding-inline-start:20px;display:grid;gap:8px;color:var(--ink-2);font-size:14px" }, steps.map((k) => h("li", null, t(k)))),
                  h("h3", { style: "font-size:13px;margin-top:6px" }, t("cs.limits")), h("ul", { class: "sm muted", style: "margin:0;padding-inline-start:18px;display:grid;gap:4px" }, ["lm.1", "lm.2", "lm.3"].map((k) => h("li", null, t(k))))], "ch"))));
        }, destroy() { seq++; },
      };
      return inst;
    },
  };
  D.pages.cases_detail = caseDetail;
})();
