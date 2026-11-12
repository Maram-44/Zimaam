/* ZIMAAM employee portal: a simulated internal AI assistant. Every question goes through the real gateway (access check -> log -> detector). */
(function () {
  const { h, icon, t } = Z;
  Z.add({
    ar: {
      "p.demoenv": "بيئة تجريبية", "p.dash": "لوحة الأمن", "nav.dash": "لوحة الأمن",
      "p.pick.h": "اختر موظفًا تجريبيًا", "p.pick.sub": "تدخل بصفة الموظف وتسأل المساعد الداخلي كما يفعل أي موظف. كل سؤال يمر عبر زِمام ويظهر أثره لدى فريق الأمن.",
      "p.pick.note": "هذه محاكاة لتوليد الأنشطة التي يراقبها زِمام، وليست وكيل ذكاء اصطناعي حقيقيًا: الإجابات تُسترجع من مستندات اصطناعية بمطابقة نصية (TF-IDF) دون نموذج لغوي. الدخول هنا تجريبي وليس مصادقة مؤسسية.",
      "p.signin": "دخول كـ", "p.switch": "تبديل الموظف", "p.signedas": "أنت تستخدم المساعد بصفتك",
      "p.sc.h": "سيناريوهات جاهزة", "p.sc.sub": "تُنفَّذ فعليًا على الباكند، وتصل نتائجها إلى لوحة الأمن مباشرة.",
      "p.sc1.t": "وصول مباشر غير مصرح", "p.sc1.d": "موظف مبيعات يسأل عن رواتب الإدارة.",
      "p.sc2.t": "محاولة استدلال غير مباشر", "p.sc2.d": "موظفة موارد بشرية تسأل أسئلة متفرقة عن التقرير المالي.",
      "p.sc3.t": "نشاط طبيعي", "p.sc3.d": "محلل مالي يطلب معلومات مسموحة له.",
      "p.run": "تشغيل", "p.running": "جارٍ تنفيذ السيناريو…", "p.stop": "إيقاف", "p.stopped": "تم إيقاف السيناريو.",
      "p.sc.as": "سيتم الدخول بصفة {n}", "p.sc.done": "اكتمل السيناريو. افتح لوحة الأمن لمشاهدة الأثر.",
      "p.chat": "المساعد الداخلي", "p.clear": "مسح المحادثة", "p.cleared": "تم مسح المحادثة.",
      "p.empty.t": "ابدأ بسؤال", "p.empty.d": "اكتب سؤالًا عن مستندات الشركة، أو شغّل أحد السيناريوهات الجاهزة.",
      "p.ph": "اكتب سؤالك…", "p.send": "إرسال", "p.thinking": "جارٍ البحث…",
      "p.ok": "مسموح", "p.denied": "مرفوض", "p.none": "لا نتيجة",
      "p.denied.msg": "ليس لديك صلاحية للوصول إلى هذه المعلومات. إذا كنت تحتاجها لعملك، قدّم طلب صلاحية عبر مسؤول النظام.",
      "p.none.msg": "لم أجد معلومات مطابقة في المستندات المتاحة لك.",
      "p.src": "المصدر", "p.retry": "إعادة المحاولة", "p.err": "تعذّر تنفيذ الطلب.",
      "p.expired": "انتهت جلسة الموظف (ربما أُعيد ضبط البيئة). اختر موظفًا من جديد.",
      "p.share": "افتح لوحة الأمن على جهاز آخر", "p.copied": "تم نسخ الرابط. يفتح نفس البيئة التجريبية.", "p.copyfail": "تعذّر النسخ. انسخ الرابط يدويًا.",
      "p.hint": "جرّب: سؤال عن مستند خارج قسمك، ثم افتح لوحة الأمن في تبويب آخر.",
    },
    en: {
      "p.demoenv": "Demo environment", "p.dash": "Security dashboard", "nav.dash": "Security dashboard",
      "p.pick.h": "Pick a demo employee", "p.pick.sub": "You sign in as an employee and ask the internal assistant, like anyone at the company. Every question goes through ZIMAAM and shows up for the security team.",
      "p.pick.note": "This simulates the activity ZIMAAM monitors. It is not a real AI agent: answers are retrieved from synthetic documents by lexical matching (TF-IDF), with no language model. Sign-in here is a demo, not enterprise authentication.",
      "p.signin": "Sign in as", "p.switch": "Switch employee", "p.signedas": "You are using the assistant as",
      "p.sc.h": "Ready-made scenarios", "p.sc.sub": "They run on the real backend, and the results reach the security dashboard live.",
      "p.sc1.t": "Direct unauthorized access", "p.sc1.d": "A sales employee asks about executive pay.",
      "p.sc2.t": "Indirect inference attempt", "p.sc2.d": "An HR employee asks scattered questions about the finance report.",
      "p.sc3.t": "Normal activity", "p.sc3.d": "A financial analyst asks for information they may access.",
      "p.run": "Run", "p.running": "Running scenario…", "p.stop": "Stop", "p.stopped": "Scenario stopped.",
      "p.sc.as": "Signing in as {n}", "p.sc.done": "Scenario finished. Open the security dashboard to see the effect.",
      "p.chat": "Internal assistant", "p.clear": "Clear chat", "p.cleared": "Chat cleared.",
      "p.empty.t": "Ask a question", "p.empty.d": "Type a question about company documents, or run one of the ready-made scenarios.",
      "p.ph": "Type your question…", "p.send": "Send", "p.thinking": "Searching…",
      "p.ok": "Allowed", "p.denied": "Denied", "p.none": "No result",
      "p.denied.msg": "You don't have access to this information. If you need it for your work, request access through your system administrator.",
      "p.none.msg": "I couldn't find matching information in the documents available to you.",
      "p.src": "Source", "p.retry": "Try again", "p.err": "The request failed.",
      "p.expired": "The employee session ended (the demo may have been reset). Pick an employee again.",
      "p.share": "Open the security dashboard on another device", "p.copied": "Link copied. It opens the same demo environment.", "p.copyfail": "Couldn't copy. Copy the link manually.",
      "p.hint": "Try: ask about a document outside your department, then open the dashboard in another tab.",
    },
  });
  const SCEN = [
    { id: "sc1", user: "sara", qs: ["executive salary bands and bonus"] },
    { id: "sc2", user: "noura", qs: ["quarterly revenue forecast", "net profit and budget", "budget cuts expenditure limits", "cashflow treasury liabilities", "audit findings financial statements"] },
    { id: "sc3", user: "mohamed", qs: ["quarterly revenue forecast", "expense policy travel reimbursement", "leave policy and working hours"] },
  ];
  const root = document.getElementById("root");
  const S = { users: [], user: null, msgs: [], busy: false, running: false, cancel: false, err: null };
  try { S.user = JSON.parse(Z.ss.get("zimaam_portal_user") || "null"); } catch (e) {}
  if (!Z.ss.get("zimaam_portal")) S.user = null;
  document.getElementById("langslot").append(Z.langButton(false));
  const toDash = document.getElementById("toDash"); toDash.replaceChildren(icon("shield"), h("span", null, t("p.dash")));
  Z.onLang(() => { toDash.replaceChildren(icon("shield"), h("span", null, t("p.dash"))); render(); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function login(uid) {
    const r = await Z.api("/portal/login", { body: { user_id: uid } });
    Z.ss.set("zimaam_portal", r.token); Z.ss.set("zimaam_portal_user", JSON.stringify(r.user));
    S.user = r.user; S.msgs = []; S.err = null; return r.user;
  }
  function logout(silent) { Z.ss.set("zimaam_portal", null); Z.ss.set("zimaam_portal_user", null); S.user = null; S.msgs = []; if (!silent) render(); }

  async function send(q) {
    q = (q || "").trim(); if (!q || S.busy) return false;
    S.busy = true; S.msgs.push({ r: "me", text: q }); const pending = { r: "bot", pending: true }; S.msgs.push(pending); render(true);
    try {
      const r = await Z.api("/portal/ask", { portal: true, body: { query: q } });
      Object.assign(pending, { pending: false, status: r.status, text: r.answer, src: r["source_title_" + Z.lang], srcEn: r.source_title_en, srcAr: r.source_title_ar });
    } catch (e) {
      if (e.status === 401) { logout(true); Z.toast(t("p.expired"), "warn"); S.busy = false; S.running = false; render(); return false; }
      Object.assign(pending, { pending: false, status: "error", q, errText: e.status === 429 || e.status === 422 ? e.message : e.network ? e.message : t("p.err") });
    }
    S.busy = false; render(true); return pending.status !== "error";
  }

  async function runScenario(sc) {
    if (S.running || S.busy) return;
    S.running = true; S.cancel = false;
    try {
      if (!S.user || S.user.id !== sc.user) {
        const p = S.users.find((u) => u.id === sc.user); Z.toast(t("p.sc.as", { n: p ? Z.nm(p) : sc.user }), "ok");
        await login(sc.user);
      }
      S.msgs = []; render();
      for (const q of sc.qs) {
        if (S.cancel) { Z.toast(t("p.stopped"), "warn"); break; }
        const ok = await send(q); if (!S.user || !ok) break; await sleep(650);
      }
      if (!S.cancel && S.user) Z.toast(t("p.sc.done"), "ok");
    } catch (e) { Z.toast(e.message, "bad"); }
    S.running = false; render(true);
  }

  /* ---------- views ---------- */
  function picker() {
    return h("div", null,
      h("h1", { style: "font-size:clamp(24px,3vw,32px)" }, t("p.pick.h")),
      h("p", { class: "muted", style: "margin-top:8px;max-width:64ch" }, t("p.pick.sub")),
      h("div", { class: "banner warn", style: "margin-top:16px;max-width:820px" }, icon("info"), h("span", null, t("p.pick.note"))),
      S.err ? h("div", { class: "errbox", style: "margin-top:16px" }, h("span", null, S.err), h("button", { class: "btn sm", onclick: load }, t("c.retry"))) : null,
      h("div", { class: "picker" }, S.users.length ? S.users.map((u) => h("button", { class: "pick", type: "button", onclick: async () => { try { await login(u.id); render(); } catch (e) { Z.toast(e.message, "bad"); } } },
        Z.avatar(u), h("b", null, Z.nm(u)), h("span", { class: "muted sm" }, Z.title(u)), h("span", { class: "chip", style: "justify-self:start;margin-top:6px" }, Z.dept(u)))) :
        [1, 2, 3, 4, 5].map(() => h("div", { class: "skel", style: "height:132px;border-radius:12px" }))));
  }

  function bubble(m) {
    if (m.r === "me") return h("div", { class: "msg me" }, m.text);
    if (m.pending) return h("div", { class: "msg bot", "aria-live": "polite" }, h("span", { class: "dots", "aria-label": t("p.thinking") }, h("i"), h("i"), h("i")));
    if (m.status === "error") return h("div", { class: "msg bot denied" }, h("div", { class: "st" }, Z.badge("bad", t("p.err"))), h("div", null, m.errText),
      h("button", { class: "btn sm", style: "margin-top:10px", type: "button", onclick: () => { S.msgs = S.msgs.filter((x) => x !== m); send(m.q); } }, icon("refresh"), t("p.retry")));
    const kind = { answered: ["ok", "p.ok"], denied: ["bad", "p.denied"], no_result: ["mute", "p.none"] }[m.status];
    const body = m.status === "answered" ? m.text : m.status === "denied" ? t("p.denied.msg") : t("p.none.msg");
    return h("div", { class: "msg bot" + (m.status === "denied" ? " denied" : "") }, h("div", { class: "st" }, Z.badge(kind[0], t(kind[1]))), h("div", null, body),
      m.status === "answered" && m.srcEn ? h("div", { class: "src" }, t("p.src") + ": " + (Z.lang === "ar" ? m.srcAr : m.srcEn)) : null);
  }

  function chat() {
    const u = S.user, inp = h("input", { class: "input", type: "text", maxlength: 500, "data-i18n-ph": "p.ph", placeholder: t("p.ph"), "aria-label": t("p.ph"), id: "q", autocomplete: "off", disabled: S.busy || S.running });
    const go = () => { const v = inp.value; inp.value = ""; send(v); };
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); go(); } });
    const msgs = h("div", { class: "msgs", id: "msgs", role: "log", "aria-live": "polite" }, S.msgs.length ? S.msgs.map(bubble) :
      h("div", { class: "empty" }, icon("inbox"), h("b", null, t("p.empty.t")), h("span", null, t("p.empty.d")), h("span", { class: "sm" }, t("p.hint"))));
    return h("div", { class: "chatgrid" },
      h("aside", { class: "card side-card" },
        h("div", { class: "who" }, Z.avatar(u), h("div", null, h("div", { class: "muted sm" }, t("p.signedas")), h("b", null, Z.nm(u)), h("div", { class: "sm muted" }, Z.title(u) + " · " + Z.dept(u)))),
        h("button", { class: "btn sm", type: "button", disabled: S.running, onclick: () => logout() }, icon("user"), t("p.switch")),
        h("div", null, h("h3", null, t("p.sc.h")), h("p", { class: "muted sm", style: "margin:4px 0 12px" }, t("p.sc.sub")),
          h("div", { class: "sc" }, SCEN.map((sc) => h("button", { class: "scbtn", type: "button", disabled: S.running || S.busy, onclick: () => runScenario(sc) }, icon("play"), h("div", null, h("b", null, t("p." + sc.id + ".t")), h("span", null, t("p." + sc.id + ".d")))))) ),
        h("button", { class: "btn sm", type: "button", onclick: async () => Z.toast(t((await Z.copy(Z.shareUrl("/dashboard"))) ? "p.copied" : "p.copyfail"), "ok") }, icon("globe"), t("p.share"))),
      h("section", { class: "card chat", "aria-label": t("p.chat") },
        h("div", { class: "hd" }, h("b", null, t("p.chat")), h("div", { style: "display:flex;gap:8px;align-items:center" }, h("span", { class: "demo-tag" }, t("p.demoenv")),
          h("button", { class: "btn sm ghost", type: "button", disabled: S.running || !S.msgs.length, onclick: () => { S.msgs = []; render(); Z.toast(t("p.cleared"), "ok"); } }, icon("trash"), t("p.clear")))),
        msgs,
        h("div", null, S.running ? h("div", { class: "runner" }, t("p.running") + " ", h("button", { class: "btn sm", type: "button", onclick: () => { S.cancel = true; } }, t("p.stop"))) : null,
          h("form", { class: "composer", onsubmit: (e) => { e.preventDefault(); go(); } }, inp,
            h("button", { class: "btn primary", type: "submit", disabled: S.busy || S.running }, icon("send", "rtl-flip"), t("p.send"))))));
  }

  function render(stick) {
    const had = document.activeElement && document.activeElement.id === "q", old = document.getElementById("msgs"), top = old ? old.scrollTop : 0;
    root.replaceChildren(S.user ? chat() : picker());
    const m = document.getElementById("msgs"); if (m) m.scrollTop = stick ? m.scrollHeight : top;
    if (had || (S.user && stick && !S.busy && !S.running)) { const q = document.getElementById("q"); if (q && !q.disabled) q.focus(); }
  }
  async function load() {
    try { S.err = null; S.users = (await Z.api("/portal/users")).users; } catch (e) { S.err = e.message; }
    render();
  }
  render(); load(); Z.applyLang();
})();
