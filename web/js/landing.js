(function () {
  Z.add({
    ar: {
      tagline: "وكلاء تنطلق، وحدود لا تُخترق",
      "nav.how": "كيف يعمل", "nav.features": "المميزات", "nav.arch": "التكامل", "nav.try": "جرّب", "nav.explore": "استكشف المنصة",
      "hero.h1": "حدود واضحة لوكلاء الذكاء الاصطناعي داخل مؤسستك",
      "hero.lead": "زِمام طبقة حماية وحوكمة بين الموظف ووكيل الذكاء الاصطناعي ومصادر البيانات. تفرض الصلاحيات قبل الوصول، وتكشف أنماط الاستدلال المشبوهة، وتمنح فريق الأمن ما يحتاجه للمراجعة والتحكم.",
      "hero.cta1": "استكشف المنصة", "hero.cta2": "كيف يعمل زِمام؟",
      "hero.note": "زِمام لا يستبدل وكلاءك الحاليين. يتكامل معهم عبر بوابة (Gateway) أو وسيط (Middleware).",
      "flow.ok": "طلب مسموح", "flow.flag": "نمط يحتاج مراجعة", "flow.block": "وصول مرفوض",
      "flow.emp": "الموظفون", "flow.gate": "زِمام", "flow.agent": "وكيل الذكاء الاصطناعي", "flow.src": "مصادر البيانات", "flow.rev": "مراجعة الأمن",
      "prob.h": "الوكلاء يصلون إلى المعلومات أسرع مما يستطيع الأمن متابعته",
      "prob.sub": "حين يجيب وكيل ذكاء اصطناعي عن أسئلة الموظفين من مستندات الشركة، تظهر ثلاث فجوات.",
      "prob.before": "بدون طبقة حماية", "prob.after": "مع زِمام",
      "b1": "صلاحيات منسوخة وقت الفهرسة تتأخر عن التغييرات، فيبقى موظف سُحبت صلاحيته يرى المستند.",
      "b2": "سؤال مرفوض واحد لا يلفت النظر، لكن أسئلة متفرقة حول المورد نفسه عبر أيام تكشف نمطًا لا يراه أحد.",
      "b3": "لا يوجد سجل يربط الموظف بالمورد والوقت، فيصعب التحقيق عند الحاجة.",
      "a1": "فحص الصلاحيات من مصدرها وقت السؤال، وسحبها يسري على الطلب التالي.",
      "a2": "عدّ الاقتراب من كل مورد محمي خلال نافذة زمنية، وتنبيه عند بلوغ الحد.",
      "a3": "حالة تحقيق بجدول زمني للمراجعة البشرية، دون تخزين نص الأسئلة.",
      "how.h": "ثلاث مراحل تعمل معًا", "how.sub": "اختر مرحلة لترى ما يحدث فيها.",
      "s1.t": "التحكم في الوصول", "s1.d": "التحقق قبل إتاحة المعلومة",
      "s2.t": "كشف المخاطر", "s2.d": "مراقبة الأنماط المشبوهة",
      "s3.t": "الحوكمة الأمنية", "s3.d": "مراجعة وتحكم من فريق الأمن",
      "s1.1": "يقرأ صلاحيات الموظف من مصدرها وقت السؤال.", "s1.2": "لا يُجاب عن مستند خارج صلاحية الموظف.", "s1.3": "اختبار حدود يقيس نسبة التسرب بعد أي تغيير في الصلاحيات.",
      "s2.1": "يسجل أقرب مورد محمي لكل سؤال، دون نص السؤال.", "s2.2": "يعدّ التكرار لكل موظف ومورد خلال نافذة 3 أيام.", "s2.3": "ينبّه عند بلوغ الحد (4 افتراضيًا) حتى لو كانت الإجابات من مستندات أخرى.",
      "s3.1": "يفتح حالة تحقيق بجدول زمني ودرجة خطورة قابلة للتفسير.", "s3.2": "يراجع المسؤول الحالة ويغيّر حالتها.", "s3.3": "يسحب الصلاحية من لوحة الإدارة فتسري على الطلب التالي.",
      "feat.h": "ما الذي تقدمه المنصة",
      "f1": "تحكم ذكي في الوصول", "f1d": "فرض الصلاحيات من المصدر قبل أن يصل المحتوى إلى الوكيل أو الموظف.",
      "f2": "كشف السلوك المشبوه", "f2d": "تتبع الاقتراب المتكرر من الموارد المحمية لكل موظف.",
      "f3": "كشف محاولات الاستدلال", "f3d": "أسئلة غير مباشرة متتابعة حول المورد نفسه تُحسب كنمط واحد.",
      "f4": "مراقبة أمنية", "f4d": "لوحة لحظية بالطلبات والقرارات والمخاطر حسب القسم.",
      "f5": "حالات التحقيق", "f5d": "جدول زمني وأسباب التصنيف وإجراءات المراجعة. أدلة للمراجعة، لا حكم على النية.",
      "f6": "حوكمة مركزية للصلاحيات", "f6d": "سحب الصلاحيات واستعادتها وتعديلها مع سجل تدقيق لكل تغيير.",
      "arch.h": "طبقة بين الموظف والوكيل والبيانات",
      "arch.sub": "كل طلب يمر عبر زِمام قبل أن يصل إلى الوكيل، وكل قرار يُسجَّل كبيانات وصفية فقط.",
      "arch.note": "التكامل ليس تلقائيًا: يُركَّب زِمام كبوابة أو وسيط أمام نظام الوكيل، ويُربط بمصدر الصلاحيات في المؤسسة.",
      "ar.user": "الموظف", "ar.gw": "زِمام (بوابة)", "ar.agent": "وكيل / RAG", "ar.data": "مصادر البيانات", "ar.acl": "مصدر الصلاحيات", "ar.log": "سجل الأحداث (وصفي)", "ar.det": "الكاشف", "ar.dash": "لوحة الأمن",
      "facts.note": "حقائق عن البيئة التجريبية، وليست إحصاءات تشغيل.",
      "fa1": "سيناريوهات جاهزة", "fa2": "موظفون تجريبيون", "fa3": "موارد محمية", "fa4": "نصوص أسئلة مخزنة",
      "try.h": "جرّبه بنفسك في ثلاث دقائق", "try.sub": "الموظف والمسؤول يعملان على نفس البيئة، فما ينفذه الموظف يظهر للأمن فورًا.",
      "t1": "افتح بوابة الموظف واختر موظفًا تجريبيًا.", "t2": "شغّل سيناريو الاستدلال أو اكتب أسئلتك.", "t3": "انتقل إلى لوحة الأمن وشاهد الحدث يظهر دون تحديث الصفحة.",
      "t4": "افتح حالة التحقيق وراجع الجدول الزمني.", "t5": "من الموظفين والصلاحيات، اسحب صلاحية الموظف عن المورد.", "t6": "عد إلى البوابة وكرر السؤال، وسيُرفض.",
      "try.card": "ابدأ من هنا", "try.cardp": "بيئة تجريبية معزولة لكل زائر، ببيانات اصطناعية.", "try.b1": "افتح بوابة الموظف", "try.b2": "افتح لوحة الأمن", "try.same": "افتح البوابة واللوحة في نافذتين لترى التحديث اللحظي.",
      "cta.h": "ابدأ باستكشاف المنصة", "foot.portal": "بوابة الموظف", "foot.dash": "لوحة الأمن", "foot.story": "الجولة المصوّرة",
      "foot.demo": "نسخة تجريبية: بيانات اصطناعية ومطابقة TF-IDF، بلا نموذج لغوي حقيقي.",
    },
    en: {
      tagline: "Agents move. Boundaries hold.",
      "nav.how": "How it works", "nav.features": "Features", "nav.arch": "Integration", "nav.try": "Try it", "nav.explore": "Explore the platform",
      "hero.h1": "Clear boundaries for AI agents inside your organization",
      "hero.lead": "ZIMAAM is a security and governance layer between employees, AI agents and data sources. It enforces permissions before access, detects suspicious inference patterns, and gives security teams what they need to review and control.",
      "hero.cta1": "Explore the platform", "hero.cta2": "How does ZIMAAM work?",
      "hero.note": "ZIMAAM does not replace your agents. It integrates through a gateway or middleware.",
      "flow.ok": "Allowed request", "flow.flag": "Pattern for review", "flow.block": "Access denied",
      "flow.emp": "Employees", "flow.gate": "ZIMAAM", "flow.agent": "AI agent", "flow.src": "Data sources", "flow.rev": "Security review",
      "prob.h": "Agents reach information faster than security can follow",
      "prob.sub": "When an AI agent answers employee questions from company documents, three gaps appear.",
      "prob.before": "Without a protection layer", "prob.after": "With ZIMAAM",
      "b1": "Permissions copied at indexing time lag behind changes, so someone whose access was removed can still read the document.",
      "b2": "One denied question looks harmless, but scattered questions about the same resource across days form a pattern nobody sees.",
      "b3": "No record ties employee, resource and time together, so investigation is hard.",
      "a1": "Permissions are checked at the source at question time, and a revocation applies to the next request.",
      "a2": "Closeness to each protected resource is counted in a time window, with an alert at the threshold.",
      "a3": "A case with a timeline for human review, without storing question text.",
      "how.h": "Three stages working together", "how.sub": "Pick a stage to see what happens in it.",
      "s1.t": "Access control", "s1.d": "Verify before information is released",
      "s2.t": "Risk detection", "s2.d": "Watch for suspicious patterns",
      "s3.t": "Security governance", "s3.d": "Review and control by the security team",
      "s1.1": "Reads the employee's permissions from the source at question time.", "s1.2": "Never answers from a document outside the employee's access.", "s1.3": "A boundary test measures the leak rate after any permission change.",
      "s2.1": "Logs the closest protected resource for each question, without the question text.", "s2.2": "Counts repeats per employee and resource in a 3-day window.", "s2.3": "Alerts at the threshold (4 by default), even when the answers came from other documents.",
      "s3.1": "Opens a case with a timeline and an explainable severity score.", "s3.2": "An administrator reviews the case and changes its status.", "s3.3": "Revokes access from the console and it applies to the next request.",
      "feat.h": "What the platform provides",
      "f1": "Intelligent access control", "f1d": "Permissions enforced from the source before content reaches the agent or the employee.",
      "f2": "Suspicious behavior detection", "f2d": "Repeated closeness to protected resources, tracked per employee.",
      "f3": "Inference attack detection", "f3d": "Indirect, consecutive questions about one resource count as a single pattern.",
      "f4": "Security monitoring", "f4d": "A live console of requests, decisions and risk by department.",
      "f5": "Investigation cases", "f5d": "Timeline, reasons for the flag and review actions. Evidence for review, not a verdict on intent.",
      "f6": "Centralized access governance", "f6d": "Revoke, restore and modify access, with an audit trail for every change.",
      "arch.h": "A layer between employee, agent and data",
      "arch.sub": "Every request passes through ZIMAAM before it reaches the agent, and every decision is logged as metadata only.",
      "arch.note": "Integration is not automatic: ZIMAAM is deployed as a gateway or middleware in front of the agent system and connected to the organization's permission source.",
      "ar.user": "Employee", "ar.gw": "ZIMAAM (gateway)", "ar.agent": "Agent / RAG", "ar.data": "Data sources", "ar.acl": "Permission source", "ar.log": "Event log (metadata)", "ar.det": "Detector", "ar.dash": "Security console",
      "facts.note": "Facts about the demo environment, not production statistics.",
      "fa1": "Ready scenarios", "fa2": "Demo employees", "fa3": "Protected resources", "fa4": "Query texts stored",
      "try.h": "Try it yourself in three minutes", "try.sub": "Employee and administrator share one environment, so what an employee does shows up for security immediately.",
      "t1": "Open the employee portal and pick a demo employee.", "t2": "Run the inference scenario or type your own questions.", "t3": "Switch to the security console and watch the event appear without reloading.",
      "t4": "Open the investigation case and review the timeline.", "t5": "In Employees & Access, revoke the employee's access to the resource.", "t6": "Return to the portal and ask again. It is denied.",
      "try.card": "Start here", "try.cardp": "An isolated sandbox for every visitor, with synthetic data.", "try.b1": "Open employee portal", "try.b2": "Open security console", "try.same": "Open the portal and the console in two windows to see the live update.",
      "cta.h": "Start exploring the platform", "foot.portal": "Employee portal", "foot.dash": "Security console", "foot.story": "Guided story",
      "foot.demo": "Demo: synthetic data and TF-IDF matching, no real language model.",
    },
  });

  /* nav language button */
  document.getElementById("langslot").append(Z.langButton());

  /* hero flow diagram */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function flow() {
    const s = Z.s, T = (x, y, txt, cls, anchor) => s("text", { x, y, class: "lbl " + (cls || ""), "text-anchor": anchor || "middle" }, txt);
    const svg = s("svg", { class: "flow", viewBox: "0 0 620 370", role: "img", "aria-label": Z.t("hero.h1") });
    const defs = s("defs"); const g = s("linearGradient", { id: "gt", x1: "0", x2: "0", y1: "0", y2: "1" });
    g.append(s("stop", { offset: "0", "stop-color": "#22cde0" }), s("stop", { offset: "1", "stop-color": "#2f6bff" })); defs.append(g); svg.append(defs);
    [70, 170, 270].forEach((y) => { svg.append(s("circle", { cx: 50, cy: y, r: 17, fill: "#0d2547", stroke: "#3a5f9a", "stroke-width": 1.5 }), s("circle", { cx: 50, cy: y - 4, r: 5, fill: "#9fb3d3" }), s("path", { d: "M41 " + (y + 10) + " a9 7 0 0 1 18 0", fill: "#9fb3d3" })); });
    svg.append(T(50, 318, Z.t("flow.emp")));
    [70, 170, 270].forEach((y) => svg.append(s("path", { d: "M70 " + y + " L250 " + y, stroke: "#ffffff18", "stroke-width": 1.5, fill: "none", "stroke-dasharray": "3 5" })));
    svg.append(s("rect", { x: 250, y: 36, width: 14, height: 262, rx: 7, fill: "url(#gt)" }));
    [70, 120, 170, 220, 270].forEach((y) => svg.append(s("circle", { cx: 257, cy: y, r: 3.2, fill: "#050f20" })));
    svg.append(T(257, 24, Z.t("flow.gate"), "b"));
    svg.append(s("rect", { x: 352, y: 126, width: 96, height: 88, rx: 12, fill: "#0d2547", stroke: "#3a5f9a" }), s("rect", { x: 376, y: 146, width: 48, height: 32, rx: 6, fill: "none", stroke: "#22cde0", "stroke-width": 2 }), s("circle", { cx: 388, cy: 162, r: 3, fill: "#22cde0" }), s("circle", { cx: 412, cy: 162, r: 3, fill: "#22cde0" }), s("path", { d: "M400 146v-8", stroke: "#22cde0", "stroke-width": 2 }));
    svg.append(T(400, 200, Z.t("flow.agent")));
    [60, 150, 240].forEach((y) => { svg.append(s("path", { d: "M448 170 C 485 170 480 " + (y + 20) + " 520 " + (y + 20), stroke: "#ffffff18", "stroke-width": 1.5, fill: "none", "stroke-dasharray": "3 5" }), s("ellipse", { cx: 556, cy: y + 8, rx: 30, ry: 9, fill: "#0d2547", stroke: "#3a5f9a" }), s("path", { d: "M526 " + (y + 8) + " v28 a30 9 0 0 0 60 0 v-28", fill: "#0d2547", stroke: "#3a5f9a" }), s("ellipse", { cx: 556, cy: y + 8, rx: 30, ry: 9, fill: "#13315c", stroke: "#3a5f9a" })); });
    svg.append(T(556, 318, Z.t("flow.src")));
    svg.append(s("rect", { x: 196, y: 326, width: 122, height: 30, rx: 8, fill: "#3a2a07", stroke: "#e59a0f" }), T(257, 346, Z.t("flow.rev"), "b"));
    svg.lastChild.setAttribute("fill", "#f4d9a8");
    if (!reduce) {
      const dot = (color, path, dur, begin, r) => { const c = s("circle", { r: r || 4.5, fill: color, opacity: 0 }); c.append(s("animateMotion", { dur: dur, begin: begin, repeatCount: "indefinite", path: path, calcMode: "linear" }), s("animate", { attributeName: "opacity", values: "0;1;1;0", keyTimes: "0;.08;.9;1", dur: dur, begin: begin, repeatCount: "indefinite" })); svg.append(c); };
      dot("#22cde0", "M70 70 C 160 70 170 120 257 120 L 352 170 L 448 170 C 485 170 480 80 520 80", "4.2s", "0s");
      dot("#22cde0", "M70 170 L 352 170 L 448 170 C 485 170 480 170 520 170", "3.6s", "1.2s");
      dot("#22cde0", "M70 270 C 160 270 180 220 257 220 L 352 180 L 448 170 C 485 170 480 260 520 260", "4.6s", "2.4s");
      dot("#e59a0f", "M70 170 L 257 170 L 257 326", "3.4s", "0.6s", 5);
      dot("#ff5d73", "M70 270 L 238 270 L 120 270", "3s", "1.8s", 5);
    }
    document.getElementById("flow").replaceChildren(svg);
  }

  /* problem vs solution */
  function vs() {
    const col = (cls, title, keys, ic) => Z.h("div", { class: "col " + cls }, Z.h("h3", null, Z.icon(cls === "before" ? "alert" : "shield"), title), Z.h("ul", null, keys.map((k) => Z.h("li", null, Z.icon(ic), Z.t(k)))));
    document.getElementById("vs").replaceChildren(col("before", Z.t("prob.before"), ["b1", "b2", "b3"], "x"), col("after", Z.t("prob.after"), ["a1", "a2", "a3"], "check"));
  }

  /* how-it-works tabs */
  let step = 0;
  const miniSvg = (i) => {
    const s = Z.s; const v = s("svg", { viewBox: "0 0 360 90", class: "flow", role: "presentation" });
    const box = (x, w, t, c) => { v.append(s("rect", { x, y: 22, width: w, height: 46, rx: 9, fill: "#0d2547", stroke: c || "#3a5f9a" }), s("text", { x: x + w / 2, y: 50, class: "lbl b", "text-anchor": "middle" }, t)); };
    const arrow = (x1, x2, c) => v.append(s("path", { d: "M" + x1 + " 45 H" + x2, stroke: c || "#22cde0", "stroke-width": 2, fill: "none", "marker-end": "none" }), s("path", { d: "M" + (x2 - 6) + " 40 L" + x2 + " 45 L" + (x2 - 6) + " 50", stroke: c || "#22cde0", "stroke-width": 2, fill: "none" }));
    if (i === 0) { box(8, 90, Z.t("ar.user")); box(135, 90, "ZIMAAM", "#22cde0"); box(262, 90, Z.t("ar.agent")); arrow(100, 133); arrow(227, 260); }
    if (i === 1) { box(8, 90, "ZIMAAM", "#22cde0"); box(135, 90, Z.t("ar.log")); box(262, 90, Z.t("ar.det"), "#e59a0f"); arrow(100, 133); arrow(227, 260, "#e59a0f"); }
    if (i === 2) { box(8, 90, Z.t("ar.det"), "#e59a0f"); box(135, 90, Z.t("ar.dash")); box(262, 90, Z.t("ar.acl")); arrow(100, 133); arrow(227, 260); v.append(s("path", { d: "M262 80 H 140", stroke: "#22cde0", "stroke-width": 1.5, "stroke-dasharray": "4 4", fill: "none" })); }
    return v;
  };
  function how() {
    const tabs = document.getElementById("tabs");
    tabs.replaceChildren(...[0, 1, 2].map((i) => {
      const b = Z.h("button", { class: "tab", role: "tab", type: "button", "aria-selected": String(i === step), onclick: () => { step = i; how(); } }, Z.h("span", { class: "n" }, i + 1), Z.h("div", null, Z.h("b", null, Z.t("s" + (i + 1) + ".t")), Z.h("span", { class: "d" }, Z.t("s" + (i + 1) + ".d"))));
      return b;
    }));
    const n = step + 1;
    document.getElementById("stage").replaceChildren(Z.h("h3", null, Z.t("s" + n + ".t")), miniSvg(step), Z.h("ul", null, [1, 2, 3].map((k) => Z.h("li", null, Z.icon("check"), Z.t("s" + n + "." + k)))));
  }

  const feats = () => document.getElementById("feats").replaceChildren(...[["shield", 1], ["eye", 2], ["radar", 3], ["activity", 4], ["cases", 5], ["scale", 6]].map(([ic, n]) =>
    Z.h("div", { class: "feat" }, Z.h("div", { class: "ic" }, Z.icon(ic)), Z.h("h3", null, Z.t("f" + n)), Z.h("p", null, Z.t("f" + n + "d")))));

  function arch() {
    const s = Z.s, v = s("svg", { class: "flow", viewBox: "0 0 1000 250", role: "img", "aria-label": Z.t("arch.h") });
    const box = (x, y, w, t, c, fill) => { v.append(s("rect", { x, y, width: w, height: 54, rx: 11, fill: fill || "#0d2547", stroke: c || "#3a5f9a", "stroke-width": c ? 2 : 1.2 }), s("text", { x: x + w / 2, y: y + 32, class: "lbl b", "text-anchor": "middle" }, t)); };
    const line = (d, c, dash) => v.append(s("path", { d, stroke: c || "#22cde0", "stroke-width": 2, fill: "none", ...(dash ? { "stroke-dasharray": "5 5" } : {}) }));
    box(10, 40, 120, Z.t("ar.user")); box(180, 40, 180, Z.t("ar.gw"), "#22cde0", "#0b2f4d"); box(410, 40, 140, Z.t("ar.agent")); box(600, 40, 140, Z.t("ar.data"));
    line("M130 67 H180"); line("M360 67 H410"); line("M550 67 H600");
    box(180, 170, 180, Z.t("ar.acl")); line("M270 94 V170", "#22cde0", true);
    box(410, 170, 140, Z.t("ar.log")); line("M340 94 C380 130 380 190 410 197", "#e59a0f", true);
    box(600, 170, 140, Z.t("ar.det"), "#e59a0f"); line("M550 197 H600", "#e59a0f");
    box(790, 170, 190, Z.t("ar.dash")); line("M740 197 H790", "#e59a0f");
    document.getElementById("archsvg").replaceChildren(v);
  }
  function facts() {
    const rows = [[3, "fa1"], [5, "fa2"], [5, "fa3"], [0, "fa4"]];
    const host = document.getElementById("facts");
    host.replaceChildren(...rows.map(([n, k]) => Z.h("div", null, Z.h("b", { "data-n": n }, reduce ? n : 0), Z.h("span", null, Z.t(k)))));
  }
  function countUp() {
    const els = document.querySelectorAll("#facts b"); if (reduce) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; io.disconnect(); els.forEach((b) => { const n = +b.dataset.n, t0 = performance.now(); (function f(t) { const p = Math.min(1, (t - t0) / 900); b.textContent = Math.round(n * p); if (p < 1) requestAnimationFrame(f); })(t0); }); }), { threshold: 0.4 });
    io.observe(document.getElementById("facts"));
  }
  const list = () => document.getElementById("trylist").replaceChildren(...[1, 2, 3, 4, 5, 6].map((n) => Z.h("li", null, Z.t("t" + n))));

  const all = () => { flow(); vs(); how(); feats(); arch(); facts(); countUp(); list(); };
  all(); Z.onLang(all); Z.applyLang(); Z.reveal();

  /* light parallax on the hero grid */
  if (!reduce) { const g = document.getElementById("heroGrid"); addEventListener("scroll", () => { if (scrollY < 900) g.style.transform = "translateY(" + scrollY * 0.18 + "px)"; }, { passive: true }); }
})();
