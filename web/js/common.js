/* ZIMAAM shared runtime: i18n, DOM helper, icons, logo, API client, toast/dialog, charts. No dependencies. */
(function () {
  const Z = (window.Z = {});
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} } };
  Z.ls = ls; Z.ss = ss;

  /* ---------- i18n ---------- */
  Z.lang = ls.get("zimaam_lang") || ((navigator.language || "ar").startsWith("en") ? "en" : "ar");
  Z.dict = { ar: {}, en: {} };
  Z.add = (d) => { for (const l of ["ar", "en"]) Object.assign(Z.dict[l], d[l] || {}); };
  Z.t = (k, v) => { let s = Z.dict[Z.lang][k]; if (s == null) s = Z.dict.en[k] != null ? Z.dict.en[k] : k; if (v) for (const x in v) s = s.split("{" + x + "}").join(v[x]); return s; };
  const listeners = [];
  Z.onLang = (fn) => listeners.push(fn);
  Z.applyLang = () => {
    document.documentElement.lang = Z.lang; document.documentElement.dir = Z.lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = Z.t(n.dataset.i18n)));
    document.querySelectorAll("[data-i18n-ph]").forEach((n) => n.setAttribute("placeholder", Z.t(n.dataset.i18nPh)));
    document.querySelectorAll("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", Z.t(n.dataset.i18nAria)));
    listeners.forEach((f) => f());
  };
  Z.setLang = (l) => { Z.lang = l; ls.set("zimaam_lang", l); Z.applyLang(); };
  Z.langButton = (light) => {
    const b = Z.h("button", { class: "langbtn" + (light ? " light" : ""), type: "button", "aria-label": "Language" });
    const upd = () => (b.textContent = Z.lang === "ar" ? "English" : "العربية");
    b.onclick = () => Z.setLang(Z.lang === "ar" ? "en" : "ar"); upd(); Z.onLang(upd); return b;
  };

  /* ---------- DOM ---------- */
  Z.h = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k]; if (v == null || v === false) continue;
      if (k === "class") n.className = v; else if (k.startsWith("on")) n[k] = v; else if (k === "html") throw new Error("no raw html"); else n.setAttribute(k, v === true ? "" : v);
    }
    const add = (c) => { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(add); else n.append(c.nodeType ? c : document.createTextNode(String(c))); };
    kids.forEach(add); return n;
  };
  Z.clear = (n) => { while (n.firstChild) n.removeChild(n.firstChild); return n; };
  const NS = "http://www.w3.org/2000/svg";
  Z.s = (tag, attrs, ...kids) => { const n = document.createElementNS(NS, tag); for (const k in attrs || {}) n.setAttribute(k, attrs[k]); kids.forEach((c) => c != null && n.append(c.nodeType ? c : document.createTextNode(String(c)))); return n; };

  /* ---------- icons (static, trusted markup) ---------- */
  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    cases: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="m13.3 16.3 2.2 2.2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    audit: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3zM12 9v4M12 17h.01"/>',
    send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>', play: '<path d="m6 3 14 9-14 9z"/>', menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M21 12a9 9 0 0 0-15-6.7L3 8M3 3v5h5M3 12a9 9 0 0 0 15 6.7L21 16M16 16h5v5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M8 14h.01M16 14h.01M2 14h2M20 14h2"/>',
    radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m12 12 7-7"/>',
    scale: '<path d="M12 3v18M8 21h8M5 7h14M5 7l-3 8a4 4 0 0 0 6 0zM19 7l-3 8a4 4 0 0 0 6 0z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M17 6l3 3M15 8l2 2"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
    chevl: '<path d="m15 18-6-6 6-6"/>', chevr: '<path d="m9 18 6-6-6-6"/>', sort: '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>', eyeoff: '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-3.2 4.2M6.6 6.6A16 16 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6M2 2l20 20"/>',
    trend: '<path d="m22 7-8.5 8.5-5-5L2 17M16 7h6v6"/>', clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  };
  Z.icon = (n, cls) => { const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", "i " + (cls || "")); s.setAttribute("aria-hidden", "true"); s.innerHTML = P[n] || ""; return s; };

  /* ---------- logo ---------- */
  Z.logoMark = (cls) => {
    const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 64 64"); s.setAttribute("class", cls || "mark"); s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<rect x="6" y="6" width="52" height="52" rx="15" fill="none" stroke="currentColor" stroke-width="4.5"/>' +
      '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 19 38 32"/><path d="M16 32h22"/><path d="M17 45 38 32"/></g><circle class="dot" cx="44.5" cy="32" r="5.5"/>';
    return s;
  };
  Z.brand = (href) => Z.h("a", { class: "brand", href: href || "/", "aria-label": "ZIMAAM زِمام" }, Z.logoMark(), Z.h("span", { class: "words" }, Z.h("span", { class: "en" }, "ZIMAAM"), Z.h("span", { class: "ar" }, "زِمام")));
  document.querySelectorAll("[data-brand]").forEach((n) => n.replaceWith(Z.brand(n.dataset.brand || "/")));

  /* ---------- session + API ---------- */
  Z.sid = () => { let s = ls.get("zimaam_sid"); if (!s || !/^[A-Za-z0-9_-]{8,64}$/.test(s)) { const a = new Uint8Array(16); crypto.getRandomValues(a); s = "v-" + Array.from(a, (b) => b.toString(16).padStart(2, "0")).join(""); ls.set("zimaam_sid", s); } return s; };
  /* a link like /portal?sb=<id> opens the same sandbox on another device (a demo convenience; the id is a capability) */
  (function () { try { const q = new URLSearchParams(location.search).get("sb"); if (q && /^[A-Za-z0-9_-]{8,64}$/.test(q)) { ls.set("zimaam_sid", q); const u = new URL(location.href); u.searchParams.delete("sb"); history.replaceState(null, "", u.pathname + u.search + u.hash); } } catch (e) {} })();
  Z.shareUrl = (path) => location.origin + path + "?sb=" + Z.sid();
  Z.copy = async (txt) => { try { await navigator.clipboard.writeText(txt); return true; } catch (e) { return false; } };
  Z.api = async (path, o) => {
    o = o || {}; const hd = { "X-Session-Id": Z.sid() };
    if (o.body) hd["Content-Type"] = "application/json";
    if (o.admin) hd["X-Admin-Key"] = ss.get("zimaam_admin") || "";
    if (o.portal) hd["X-Portal-Token"] = ss.get("zimaam_portal") || "";
    let r; try { r = await fetch("/api" + path, { method: o.method || (o.body ? "POST" : "GET"), headers: hd, body: o.body ? JSON.stringify(o.body) : undefined }); }
    catch (e) { const er = new Error(Z.t("err.network")); er.network = true; throw er; }
    let j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const er = new Error((j && typeof j.detail === "string" && j.detail) || Z.t("err.generic")); er.status = r.status; throw er; }
    return j;
  };

  /* ---------- toast + dialogs ---------- */
  Z.toast = (msg, kind) => {
    let box = document.querySelector(".toasts"); if (!box) { box = Z.h("div", { class: "toasts", role: "status", "aria-live": "polite" }); document.body.append(box); }
    const t = Z.h("div", { class: "toast " + (kind || "ok") }, Z.icon(kind === "bad" ? "alert" : kind === "warn" ? "alert" : "check"), Z.h("div", null, msg));
    box.append(t); setTimeout(() => t.remove(), 4200);
  };
  Z.dialog = (o) => new Promise((res) => {
    const d = Z.h("dialog", { class: "dlg " + (o.wide ? "wide" : ""), "aria-labelledby": "dlg-t" });
    const close = (v) => { d.close(); d.remove(); res(v); };
    const foot = Z.h("div", { class: "ft" });
    (o.buttons || []).forEach((b) => foot.append(Z.h("button", { class: "btn " + (b.cls || ""), type: "button", onclick: () => close(b.value) }, b.label)));
    d.append(Z.h("div", { class: "hd", id: "dlg-t" }, o.title), Z.h("div", { class: "bd" }, o.body), foot);
    d.addEventListener("cancel", (e) => { e.preventDefault(); close(o.cancelValue); });
    d.addEventListener("click", (e) => { if (e.target === d) close(o.cancelValue); });
    document.body.append(d); d.showModal(); const f = foot.querySelector(".primary,.danger") || foot.lastChild; f && f.focus();
  });
  Z.confirm = (o) => Z.dialog({ title: o.title, body: o.body, cancelValue: false, buttons: [{ label: Z.t("c.cancel"), value: false }, { label: o.ok || Z.t("c.confirm"), value: true, cls: o.danger ? "danger" : "primary" }] });

  /* ---------- formats ---------- */
  const p2 = (n) => String(n).padStart(2, "0");
  Z.fmtDT = (ts) => { const d = new Date(ts * 1000); return d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-" + p2(d.getUTCDate()) + " " + p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()); };
  Z.fmtT = (ts) => { const d = new Date(ts * 1000); return p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()); };
  Z.fmtD = (ts) => Z.fmtDT(ts).slice(5, 10);
  Z.ltr = (txt, cls) => Z.h("span", { class: "ltr num " + (cls || "") }, txt);
  Z.nm = (p) => p["name_" + Z.lang]; Z.title = (p) => p["title_" + Z.lang]; Z.dept = (p) => p["dept_" + Z.lang];
  Z.doc = (d) => (d ? d["title_" + Z.lang] : "—");
  Z.avatar = (p) => Z.h("div", { class: "avatar " + p.dept, "aria-hidden": "true" }, (p.name_en || "?")[0]);
  Z.badge = (kind, text, nodot) => Z.h("span", { class: "badge " + kind + (nodot ? " nodot" : "") }, text);
  Z.decisionBadge = (e) => e.leak ? Z.badge("bad", Z.t("dec.leak")) : e.decision === "answered" ? Z.badge("ok", Z.t("dec.answered")) : e.decision === "denied" ? Z.badge("bad", Z.t("dec.denied")) : Z.badge("mute", Z.t("dec.no_match"));
  Z.riskBadge = (r) => Z.badge({ none: "mute", low: "info", medium: "warn", high: "bad" }[r] || "mute", Z.t("risk." + r));
  Z.statusBadge = (s) => Z.badge({ new: "bad", under_review: "warn", reviewed: "info", resolved: "ok" }[s], Z.t("status." + s));
  Z.reveal = () => {
    const els = document.querySelectorAll(".reveal"); if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  };

  /* ---------- charts (SVG) ---------- */
  Z.COLORS = { allowed: "#0e9f6e", denied: "#d0344a", suspicious: "#e59a0f", none: "#8da2c4", low: "#2f6bff", medium: "#e59a0f", high: "#d0344a" };
  const tipEl = () => { let t = document.querySelector(".tip"); if (!t) { t = Z.h("div", { class: "tip" }); t.hidden = true; document.body.append(t); } return t; };
  Z.tip = (el, fn) => {
    el.addEventListener("pointermove", (e) => { const t = tipEl(); t.hidden = false; t.replaceChildren(...[].concat(fn(e))); const w = t.offsetWidth; t.style.left = Math.min(innerWidth - w - 8, Math.max(8, e.clientX + 12)) + "px"; t.style.top = e.clientY + 14 + "px"; });
    el.addEventListener("pointerleave", () => (tipEl().hidden = true));
  };
  Z.lineChart = (host, o) => {
    const W = 640, H = 240, L = 34, R = 10, T = 12, B = 26, n = o.labels.length;
    const max = Math.max(4, ...o.series.flatMap((s) => s.values)), top = Math.ceil(max / 4) * 4;
    const x = (i) => L + (n === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (n - 1)), y = (v) => T + (H - T - B) * (1 - v / top);
    const svg = Z.s("svg", { class: "chart", viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": o.aria || "" });
    for (let k = 0; k <= 4; k++) { const v = (top / 4) * k; svg.append(Z.s("line", { class: "grid", x1: L, x2: W - R, y1: y(v), y2: y(v) }), Z.s("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end" }, Math.round(v))); }
    const every = Math.ceil(n / 7); o.labels.forEach((lb, i) => { if (i % every === 0 || i === n - 1) svg.append(Z.s("text", { x: x(i), y: H - 8, "text-anchor": "middle" }, lb)); });
    o.series.forEach((s) => {
      const pts = s.values.map((v, i) => x(i) + "," + y(v)).join(" ");
      if (s.area) svg.append(Z.s("polygon", { points: x(0) + "," + y(0) + " " + pts + " " + x(n - 1) + "," + y(0), fill: s.color, opacity: ".08" }));
      svg.append(Z.s("polyline", { points: pts, fill: "none", stroke: s.color, "stroke-width": 2.2, "stroke-linejoin": "round", "stroke-linecap": "round", ...(s.dash ? { "stroke-dasharray": "5 4" } : {}) }));
    });
    const cur = Z.s("line", { y1: T, y2: H - B, stroke: "#9aa8c0", "stroke-dasharray": "3 3", visibility: "hidden" }); svg.append(cur);
    const dots = o.series.map((s) => { const c = Z.s("circle", { r: 4, fill: s.color, stroke: "#fff", "stroke-width": 2, visibility: "hidden" }); svg.append(c); return c; });
    const hit = Z.s("rect", { x: L, y: T, width: W - L - R, height: H - T - B, fill: "transparent" }); svg.append(hit);
    const idx = (e) => { const r = svg.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; return Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1)))); };
    Z.tip(hit, (e) => { const i = idx(e); cur.setAttribute("x1", x(i)); cur.setAttribute("x2", x(i)); cur.setAttribute("visibility", "visible"); dots.forEach((d, k) => { d.setAttribute("cx", x(i)); d.setAttribute("cy", y(o.series[k].values[i])); d.setAttribute("visibility", "visible"); });
      return [Z.h("div", null, o.labels[i]), ...o.series.map((s) => Z.h("div", null, s.name + ": " + s.values[i]))]; });
    hit.addEventListener("pointerleave", () => { cur.setAttribute("visibility", "hidden"); dots.forEach((d) => d.setAttribute("visibility", "hidden")); });
    host.replaceChildren(svg);
  };
  Z.donut = (host, parts, centerLabel) => {
    const total = parts.reduce((a, p) => a + p.value, 0), R = 54, C = 2 * Math.PI * R;
    const svg = Z.s("svg", { class: "chart", viewBox: "0 0 140 140", role: "img", "aria-label": centerLabel });
    svg.append(Z.s("circle", { cx: 70, cy: 70, r: R, fill: "none", stroke: "#eef1f6", "stroke-width": 16 }));
    let off = 0; parts.forEach((p) => { if (!p.value) return; const len = (p.value / total) * C; const c = Z.s("circle", { cx: 70, cy: 70, r: R, fill: "none", stroke: p.color, "stroke-width": 16, "stroke-dasharray": Math.max(0, len - 1.5) + " " + C, "stroke-dashoffset": -off, transform: "rotate(-90 70 70)" }); Z.tip(c, () => p.label + ": " + p.value + " (" + Math.round((p.value / total) * 100) + "%)"); svg.append(c); off += len; });
    svg.append(Z.s("text", { x: 70, y: 70, "text-anchor": "middle", style: "font-size:24px;font-weight:700;fill:#0c1a33" }, total), Z.s("text", { x: 70, y: 88, "text-anchor": "middle" }, centerLabel));
    host.replaceChildren(svg);
  };
  Z.hbars = (host, rows) => {
    const max = Math.max(1, ...rows.map((r) => r.value));
    host.replaceChildren(...rows.map((r) => Z.h("div", { style: "display:grid;grid-template-columns:96px minmax(0,1fr) 34px;gap:10px;align-items:center;font-size:13px;margin:10px 0" },
      Z.h("span", null, r.label), Z.h("div", { class: "sev-bar", style: "height:12px" }, Z.h("i", { style: "width:" + (r.value / max) * 100 + "%;background:" + r.color })), Z.h("b", { class: "num" }, r.value))));
  };

  /* ---------- shared dictionary ---------- */
  Z.add({
    ar: {
      "c.cancel": "إلغاء", "c.confirm": "تأكيد", "c.retry": "إعادة المحاولة", "c.close": "إغلاق", "c.back": "رجوع", "c.demo": "بيانات تجريبية",
      "err.network": "تعذّر الاتصال بالخادم. تحقق من الاتصال ثم أعد المحاولة.", "err.generic": "حدث خطأ غير متوقع. أعد المحاولة.",
      "dec.answered": "مسموح", "dec.denied": "مرفوض", "dec.no_match": "لا نتيجة", "dec.leak": "تسرّب",
      "risk.none": "طبيعي", "risk.low": "منخفض", "risk.medium": "متوسط", "risk.high": "مرتفع",
      "status.new": "جديدة", "status.under_review": "قيد المراجعة", "status.reviewed": "تمت المراجعة", "status.resolved": "مغلقة",
      "doc.HR-SAL": "نطاقات الرواتب والترقيات", "doc.HR-HEAD": "أعداد الموظفين والمكاتب", "doc.FIN-REP": "التقرير المالي الربعي", "doc.SALES-PIPE": "مسار المبيعات", "doc.HANDBOOK": "دليل الموظف",
      "dept.hr": "الموارد البشرية", "dept.finance": "المالية", "dept.sales": "المبيعات",
    },
    en: {
      "c.cancel": "Cancel", "c.confirm": "Confirm", "c.retry": "Try again", "c.close": "Close", "c.back": "Back", "c.demo": "Demo data",
      "err.network": "Can't reach the server. Check your connection and try again.", "err.generic": "Something went wrong. Try again.",
      "dec.answered": "Allowed", "dec.denied": "Denied", "dec.no_match": "No result", "dec.leak": "Leak",
      "risk.none": "Normal", "risk.low": "Low", "risk.medium": "Medium", "risk.high": "High",
      "status.new": "New", "status.under_review": "Under review", "status.reviewed": "Reviewed", "status.resolved": "Resolved",
      "doc.HR-SAL": "Salary bands and promotions", "doc.HR-HEAD": "Headcount and offices", "doc.FIN-REP": "Quarterly finance report", "doc.SALES-PIPE": "Sales pipeline", "doc.HANDBOOK": "Employee handbook",
      "dept.hr": "Human Resources", "dept.finance": "Finance", "dept.sales": "Sales",
    },
  });
})();
