/* ZIMAAM dashboard core: demo sign-in, shell, client-side router, live stream, shared components. */
(function () {
  const { h, icon, t } = Z;
  const D = (Z.D = { pages: {}, state: {}, inst: null, page: null, cases: { items: [], counts: {} }, seq: 0 });
  const root = document.getElementById("root");
  Z.add({
    ar: {
      "d.overview": "نظرة عامة", "d.live": "النشاط المباشر", "d.cases": "حالات التحقيق", "d.employees": "الموظفون والصلاحيات", "d.audit": "سجل التدقيق", "d.settings": "الإعدادات",
      "d.title": "لوحة الأمن والإدارة", "d.menu": "القائمة", "d.logout": "تسجيل الخروج", "d.admin": "مسؤول الأمن (تجريبي)",
      "lg.h": "لوحة الأمن والإدارة", "lg.p": "لمسؤولي الأمن ومديري النظام. تعرض نشاط الموظفين مع وكيل الذكاء الاصطناعي، والحالات التي تستدعي مراجعة، وتتيح التحكم في الصلاحيات.",
      "lg.note": "الدخول هنا تجريبي بدون كلمة مرور، وهو ليس مصادقة مؤسسية. تعتمد البيئة على جلسة معزولة لكل زائر وبيانات اصطناعية.", "lg.btn": "الدخول كمسؤول تجريبي", "lg.portal": "افتح بوابة الموظف", "lg.home": "الصفحة الرئيسية",
      "st.label": "حالة الأمن", "st.ok": "طبيعية", "st.review": "تحتاج مراجعة", "st.high": "حالات عالية الخطورة",
      "up.label": "آخر تحديث", "live.on": "مباشر", "live.off": "تحديث دوري", "notif": "الإشعارات", "notif.none": "لا توجد إشعارات جديدة.", "notif.case": "حالة جديدة تحتاج مراجعة", "notif.all": "عرض كل الحالات",
      "tz": "التوقيت UTC (ساعة المحاكاة)", "demo": "بيانات تجريبية", "events": "حدث", "of": "من", "prev": "السابق", "next": "التالي",
      "f.search": "بحث…", "f.all": "الكل", "f.decision": "القرار", "f.risk": "الخطورة", "f.dept": "القسم", "f.role": "الدور", "f.kind": "نوع العملية", "f.reset": "مسح الفلاتر",
      "r.24h": "آخر 24 ساعة", "r.7d": "آخر 7 أيام", "r.30d": "آخر 30 يومًا",
      "col.emp": "الموظف", "col.dept": "القسم", "col.type": "نوع الحدث", "col.target": "المورد", "col.decision": "القرار", "col.risk": "الخطورة", "col.time": "الوقت",
      "col.actor": "المنفّذ", "col.action": "العملية", "col.affected": "الموظف المتأثر", "col.result": "النتيجة", "col.detail": "التفاصيل", "col.role": "الدور", "col.status": "الحالة", "col.access": "الوصول", "col.flags": "مؤشرات",
      "ev.query": "استعلام للمساعد", "ev.none": "لا أحداث بعد", "ev.none.d": "ستظهر هنا أحداث الموظفين فور حدوثها. افتح بوابة الموظف وجرّب سيناريو، أو حمّل سجلًا تجريبيًا.", "ev.nomatch": "لا نتائج مطابقة", "ev.nomatch.d": "غيّر البحث أو الفلاتر.",
      "ev.detail": "تفاصيل الحدث", "ev.sim": "درجة التقارب", "ev.closest": "أقرب مورد محمي", "ev.ref": "مرجع الاستعلام (مُجزّأ)", "ev.case": "الحالة المرتبطة", "ev.opencase": "فتح الحالة", "ev.nocase": "لا توجد حالة مرتبطة",
      "ev.note": "لا يُحفظ نص الاستعلام ولا محتوى المستند. المرجع مُجزّأ بملح ولا يمكن عكسه.",
      "dec.answered": "مسموح", "dec.denied": "مرفوض",
      "ov.sub": "الوضع الأمني الحالي في هذه البيئة التجريبية.", "ov.empty.h": "لا نشاط بعد في هذه البيئة", "ov.empty.p": "جرّب السيناريوهات من بوابة الموظف لتوليد أحداث حقيقية، أو حمّل سجل أسبوعين تجريبيًا لرؤية اللوحة ممتلئة.",
      "ov.seed": "تحميل سجل تجريبي (بيانات تجريبية)", "ov.portal": "فتح بوابة الموظف", "ov.seeded": "تم تحميل سجل تجريبي.", "ov.recent": "أحدث الأحداث الأمنية",
      "k.total": "إجمالي الطلبات", "k.allowed": "طلبات مسموحة", "k.denied": "طلبات مرفوضة", "k.susp": "أنشطة مشبوهة", "k.cases": "حالات تحقيق نشطة", "k.mon": "موظفون تحت المراقبة", "k.new": "{n} جديدة",
      "c.act": "النشاط الأمني عبر الزمن", "c.allowed": "مسموح", "c.denied": "مرفوض", "c.susp": "مشبوه", "c.risk": "توزيع مستويات الخطورة", "c.dept": "الأنشطة المشبوهة حسب القسم", "c.dec": "قرارات الوصول", "c.trend": "اتجاه الخطورة",
      "c.suspdef": "نشاط مشبوه = سؤال أقرب نتيجة له مورد محمي لا يملك الموظف صلاحيته.",
      "tr.up": "ارتفاع في الأنشطة المشبوهة", "tr.down": "انخفاض في الأنشطة المشبوهة", "tr.flat": "مستقر", "tr.none": "لا أنشطة مشبوهة في الفترة", "tr.cmp": "النصف الأخير: {a} · النصف السابق: {b}", "pct.allowed": "{p}% من الطلبات مسموحة",
      "lv.h": "النشاط المباشر", "lv.sub": "كل سؤال من بوابة الموظف يظهر هنا خلال ثوانٍ دون تحديث الصفحة.", "lv.pause": "إيقاف مؤقت", "lv.resume": "استئناف", "lv.paused": "العرض متوقف. الأحداث الجديدة لا تُضاف حتى تستأنف.", "lv.open": "الحالات المفتوحة", "lv.noopen": "لا حالات جديدة.", "lv.total": "إجمالي الأحداث: {n}",
      "cs.h": "حالات التحقيق", "cs.sub": "تُفتح الحالة تلقائيًا عند بلوغ حد التنبيه. هي أنماط تستدعي مراجعة بشرية، وليست إثباتًا لنية.",
      "cs.id": "رقم الحالة", "cs.attempts": "المحاولات", "cs.first": "أول ظهور", "cs.last": "آخر ظهور", "cs.out": "خارج النافذة", "cs.none": "لا حالات", "cs.none.d": "تُفتح حالة عندما يقترب موظف من المورد المحمي نفسه {n} مرات أو أكثر خلال {d} أيام. جرّب سيناريو «محاولة استدلال» من بوابة الموظف.",
      "cs.back": "كل الحالات", "cs.nf": "الحالة غير موجودة", "cs.frame": "يرصد زِمام نمطًا يستدعي مراجعة بشرية. هذا ليس إثباتًا لنية الموظف، وقد يكون له تفسير مشروع مثل احتياج وظيفي.",
      "cs.tl": "الجدول الزمني للمحاولات", "cs.tl.note": "كل سطر سؤال كان أقرب مورد محمي له هو هذا المورد. «مرفوض» = أفضل تطابق مستند لا يملك الموظف صلاحيته. «مسموح» = أجابه مستند آخر مسموح.", "cs.perday": "المحاولات حسب اليوم",
      "cs.why": "سبب التصنيف", "cs.score": "درجة الخطورة", "cs.s.prox": "عدد الاقترابات مقابل الحد", "cs.s.sens": "مورد حساس", "cs.s.leak": "محتوى مُقدَّم خارج الصلاحية", "cs.total": "المجموع",
      "cs.emp": "الموظف", "cs.res": "المورد المستهدف", "cs.sensitive": "حساس", "cs.review": "المراجعة", "cs.status": "حالة التحقيق", "cs.note": "ملاحظة المراجع", "cs.mark": "تمت المراجعة", "cs.save": "حفظ", "cs.saved": "تم تحديث الحالة.", "cs.hist": "سجل الحالة", "cs.nohist": "لا تغييرات بعد.",
      "cs.steps": "خطوات مقترحة", "cs.limits": "حدود هذا التقرير", "cs.opened": "فُتحت", "cs.empcard": "ملف الموظف",
      "rs.count": "{n} اقترابًا من المورد خلال {d} أيام (الحد {th}).", "rs.mix": "منها {a} مرفوضة و{b} أُجيبت من مستندات أخرى.", "rs.days": "على {n} يومًا مختلفًا.", "rs.sens": "المورد مصنّف حساسًا.", "rs.leak": "{n} طلبًا قُدِّم له محتوى خارج صلاحيته (تسرّب).",
      "stp.1": "راجع الجدول الزمني مع مدير الموظف ومالك بيانات المورد.", "stp.2": "تحقق إن كان دوره يحتاج هذه المعلومات فعلًا، وفكّر في طلب صلاحية موثّق.", "stp.3": "أولوية: قُدِّم محتوى لا يسمح به مصدر الصلاحيات. حدّث صلاحيات الفهرس وراجع ما أُعيد.", "stp.4": "لا يخزّن زِمام نص الاستعلامات. استرجاعها (إن لزم) يتم عبر الإجراء المعتمد وفق السياسة فقط.",
      "lm.1": "الحالة دليل على نمط في الاستعلامات وليست إثباتًا لنية.", "lm.2": "الأعداد تعتمد على الحدود المضبوطة وعلى نموذج التمثيل النصي (هنا TF-IDF).", "lm.3": "التقارير تحوي بيانات وصفية فقط: لا نص استعلام ولا محتوى مستند.",
      "em.h": "الموظفون والصلاحيات", "em.sub": "إدارة الوصول إلى المستندات. أي تغيير يُطبَّق على الطلب التالي للموظف ويُسجَّل في سجل التدقيق.", "em.active": "نشط", "em.docs": "{n} من {m} موارد", "em.cases": "{n} حالات", "em.susp": "{n} مشبوه", "em.none": "لا موظفين مطابقين",
      "em.back": "كل الموظفين", "em.perms": "الصلاحيات الحالية", "em.via": "عبر الدور", "em.extra": "صلاحية إضافية", "em.granted": "مسموح", "em.nogr": "غير مسموح", "em.revoke": "سحب", "em.restore": "استعادة", "em.modify": "تعديل الصلاحيات",
      "em.k.ev": "أحداث (30 يومًا)", "em.k.susp": "مشبوهة", "em.k.den": "مرفوضة", "em.k.cs": "حالات",
      "em.recent": "آخر الأنشطة", "em.cases": "الحالات الأمنية المرتبطة", "em.nocases": "لا حالات مرتبطة.", "em.test": "جرّب كهذا الموظف في بوابة الموظف", "em.noact": "لا أنشطة بعد.",
      "em.rv.t": "سحب الصلاحية؟", "em.rv.b": "سيفقد {n} الوصول إلى «{d}» ابتداءً من طلبه التالي. يُحدَّث مصدر الصلاحيات (ACL) ويُسجَّل الإجراء في سجل التدقيق.",
      "em.rs.t": "استعادة الصلاحية؟", "em.rs.b": "سيستعيد {n} الوصول إلى «{d}» ابتداءً من طلبه التالي.",
      "em.rv.ok": "سُحبت الصلاحية وتسري على الطلب التالي.", "em.rs.ok": "استُعيدت الصلاحية.", "em.mod.t": "تعديل صلاحيات {n}", "em.mod.p": "حدّد الموارد التي يمكنه الوصول إليها.", "em.mod.apply": "تطبيق التغييرات", "em.mod.none": "لم تغيّر شيئًا.", "em.mod.sum": "ستُسحب: {r} · ستُستعاد: {s}", "em.mod.ok": "تم تطبيق {n} تغيير(ات).",
      "em.stale": "تم سحب صلاحية من المصدر، لكن فهرس البحث يعمل بنسخة قديمة ({d}). لا يزال الموظف قادرًا على رؤية: {x}. حدّث الفهرس لإغلاق الفجوة.", "em.syncnow": "مزامنة الفهرس الآن", "em.synced": "تمت المزامنة.",
      "au.h": "سجل التدقيق", "au.sub": "كل عملية وصول وكل تغيير إداري. لا يحتوي نص الاستعلامات ولا محتوى المستندات.", "au.none": "لا سجلات مطابقة", "au.none.d": "ستظهر هنا الأسئلة وتغييرات الصلاحيات فور حدوثها.",
      "au.bt": "اختبار حدود الصلاحيات", "au.bt.p": "يختبر كل زوج (موظف، مستند محظور) ويقيس هل يُقدَّم المحتوى فعلًا خارج الصلاحية.", "au.bt.run": "شغّل الاختبار", "au.bt.leak": "نسبة التسرّب", "au.bt.recall": "الاسترجاع للمصرّح به", "au.bt.pairs": "أزواج محظورة", "au.bt.mode": "مصدر الصلاحيات في الإنفاذ", "au.bt.leaks": "تسرّب: {n} من {m}",
      "act.query": "سؤال", "act.admin_login": "دخول المسؤول", "act.permission_revoked": "سحب صلاحية", "act.permission_restored": "استعادة صلاحية", "act.case_status": "تغيير حالة تحقيق", "act.mode_change": "تغيير مصدر الصلاحيات", "act.setting_change": "تغيير إعداد", "act.acl_sync": "مزامنة الفهرس", "act.seed": "تحميل سجل تجريبي",
      "who.admin": "المسؤول", "who.system": "النظام", "res.ok": "نجحت", "res.answered": "مسموح", "res.denied": "مرفوض",
      "dt.srcacl": "تحديث مصدر الصلاحيات (ACL)", "dt.demo": "دخول تجريبي", "dt.closest": "أقرب مورد محمي: {d}", "dt.mode": "مصدر الإنفاذ: {m}", "dt.sync": "دُفعت {n} عمليات سحب إلى الفهرس", "dt.seed": "{n} حدثًا تجريبيًا", "dt.reveal": "رسالة الرفض للموظف: {v}", "dt.on": "ظاهرة", "dt.off": "مخفية",
      "se.h": "الإعدادات", "se.sub": "إعدادات هذه البيئة التجريبية فقط.",
      "se.mode": "مصدر الصلاحيات وقت الإنفاذ", "se.mode.p": "«مباشر» يقرأ الصلاحيات من مصدرها عند كل سؤال، فيسري السحب فورًا. «نسخة الفهرس» يحاكي نسخة قديمة منسوخة وقت الفهرسة: يبقى الموظف يصل بعد سحب صلاحيته حتى تتم المزامنة.", "se.live": "مباشر", "se.snap": "نسخة الفهرس (قديمة)", "se.pending": "عمليات سحب لم تُزامَن: {n}", "se.sync": "مزامنة الفهرس الآن",
      "se.reveal": "إظهار رسالة «مرفوض» للموظف", "se.reveal.p": "في الإنتاج يُفضَّل إخفاؤها كي لا يتعلم المهاجم أي مستند موجود. عند إخفائها يرى الموظف «لا نتيجة».",
      "se.det": "إعدادات الكشف", "se.thr": "حد التنبيه", "se.thr.v": "{n} اقترابات", "se.win": "نافذة العدّ", "se.win.v": "{n} أيام", "se.prox": "حد التقارب", "se.emb": "نموذج التمثيل", "se.emb.v": "TF-IDF نصي (بديل تجريبي)",
      "se.priv": "الخصوصية: ما الذي يُخزَّن", "se.stored": "يُخزَّن", "se.nstored": "لا يُخزَّن", "st.user": "المستخدم", "st.role": "القسم", "st.time": "الوقت", "st.decision": "القرار", "st.served": "المستند المقدَّم", "st.leak": "علامة التسرّب", "st.closest": "أقرب مورد محمي", "st.sim": "درجة التقارب", "st.hash": "مرجع مُجزّأ للاستعلام", "st.qt": "نص الاستعلام", "st.dc": "محتوى المستندات",
      "se.demo": "بيانات العرض", "se.seed": "تحميل سجل تجريبي (14 يومًا)", "se.seeded": "السجل التجريبي محمّل", "se.reset": "إعادة ضبط البيئة", "se.reset.t": "إعادة ضبط البيئة؟", "se.reset.b": "سيُمحى كل النشاط والحالات وسجل التدقيق والتغييرات في الصلاحيات، وتُنهى جلسات الموظفين. لا يمكن التراجع.", "se.reset.ok": "أُعيد ضبط البيئة.",
      "se.share": "فتح من جهاز آخر", "se.share.p": "الرابطان يفتحان نفس البيئة التجريبية (مثلًا الجوال لبوابة الموظف والحاسوب للوحة).", "se.share.portal": "نسخ رابط بوابة الموظف", "se.share.dash": "نسخ رابط اللوحة", "se.copied": "تم نسخ الرابط.", "se.copyfail": "تعذّر النسخ.",
      "se.real": "ما الحقيقي وما المحاكى", "se.r1": "حقيقي: فحص الصلاحيات، تسجيل الأحداث، العدّ والتنبيه، فتح الحالات، سحب الصلاحية وأثره على الطلب التالي، سجل التدقيق.", "se.r2": "محاكى: الموظفون والمستندات اصطناعية، والمساعد لا يستخدم نموذجًا لغويًا (مطابقة TF-IDF)، والدخول تجريبي، والساعة محاكاة.", "se.r3": "يحتاج تكاملًا: ربط زِمام بوكيلك الفعلي عبر Gateway أو Middleware، ومزامنة الصلاحيات من نظام الهوية (IdP) ومصادر البيانات.",
      "se.saved": "تم حفظ الإعداد.",
    },
    en: {
      "d.overview": "Overview", "d.live": "Live Activity", "d.cases": "Investigation Cases", "d.employees": "Employees & Access", "d.audit": "Access Audit", "d.settings": "Settings",
      "d.title": "Security & Governance Dashboard", "d.menu": "Menu", "d.logout": "Sign out", "d.admin": "Security admin (demo)",
      "lg.h": "Security & Governance Dashboard", "lg.p": "For security officers and system administrators. It shows how employees use the AI assistant, the cases that need review, and lets you control access.",
      "lg.note": "Sign-in here is a demo with no password; it is not enterprise authentication. Each visitor gets an isolated sandbox with synthetic data.", "lg.btn": "Sign in as demo administrator", "lg.portal": "Open employee portal", "lg.home": "Home",
      "st.label": "Security status", "st.ok": "Normal", "st.review": "Needs review", "st.high": "High-risk cases",
      "up.label": "Updated", "live.on": "Live", "live.off": "Periodic refresh", "notif": "Notifications", "notif.none": "No new notifications.", "notif.case": "New case needs review", "notif.all": "View all cases",
      "tz": "UTC time (simulated clock)", "demo": "Demo data", "events": "events", "of": "of", "prev": "Previous", "next": "Next",
      "f.search": "Search…", "f.all": "All", "f.decision": "Decision", "f.risk": "Risk", "f.dept": "Department", "f.role": "Role", "f.kind": "Action type", "f.reset": "Clear filters",
      "r.24h": "Last 24 hours", "r.7d": "Last 7 days", "r.30d": "Last 30 days",
      "col.emp": "Employee", "col.dept": "Department", "col.type": "Event type", "col.target": "Target resource", "col.decision": "Decision", "col.risk": "Risk", "col.time": "Time",
      "col.actor": "Performed by", "col.action": "Action", "col.affected": "Affected employee", "col.result": "Result", "col.detail": "Details", "col.role": "Role", "col.status": "Status", "col.access": "Access", "col.flags": "Signals",
      "ev.query": "Assistant query", "ev.none": "No events yet", "ev.none.d": "Employee events appear here as they happen. Open the employee portal and run a scenario, or load sample history.", "ev.nomatch": "No matching results", "ev.nomatch.d": "Change the search or filters.",
      "ev.detail": "Event details", "ev.sim": "Closeness score", "ev.closest": "Closest protected resource", "ev.ref": "Query reference (hashed)", "ev.case": "Linked case", "ev.opencase": "Open case", "ev.nocase": "No linked case",
      "ev.note": "Query text and document content are never stored. The reference is a salted hash and cannot be reversed.",
      "dec.answered": "Allowed", "dec.denied": "Denied",
      "ov.sub": "Current security posture of this demo environment.", "ov.empty.h": "No activity in this environment yet", "ov.empty.p": "Run the scenarios from the employee portal to generate real events, or load a two-week sample history to see the dashboard full.",
      "ov.seed": "Load sample history (demo data)", "ov.portal": "Open employee portal", "ov.seeded": "Sample history loaded.", "ov.recent": "Recent security events",
      "k.total": "Total requests", "k.allowed": "Allowed requests", "k.denied": "Denied requests", "k.susp": "Suspicious activities", "k.cases": "Active investigation cases", "k.mon": "Employees monitored", "k.new": "{n} new",
      "c.act": "Security activity over time", "c.allowed": "Allowed", "c.denied": "Denied", "c.susp": "Suspicious", "c.risk": "Risk distribution", "c.dept": "Suspicious activity by department", "c.dec": "Access decisions", "c.trend": "Risk trend",
      "c.suspdef": "Suspicious = a question whose closest match is a protected resource the employee can't access.",
      "tr.up": "Suspicious activity rising", "tr.down": "Suspicious activity falling", "tr.flat": "Stable", "tr.none": "No suspicious activity in this period", "tr.cmp": "Latest half: {a} · previous half: {b}", "pct.allowed": "{p}% of requests allowed",
      "lv.h": "Live Activity", "lv.sub": "Every question from the employee portal appears here within seconds, with no page reload.", "lv.pause": "Pause", "lv.resume": "Resume", "lv.paused": "Paused. New events are not added until you resume.", "lv.open": "Open cases", "lv.noopen": "No new cases.", "lv.total": "Total events: {n}",
      "cs.h": "Investigation Cases", "cs.sub": "A case opens automatically when the alert threshold is reached. Cases are patterns for human review, not proof of intent.",
      "cs.id": "Case ID", "cs.attempts": "Attempts", "cs.first": "First seen", "cs.last": "Last seen", "cs.out": "Outside window", "cs.none": "No cases", "cs.none.d": "A case opens when an employee gets close to the same protected resource {n} or more times within {d} days. Try the “Indirect inference attempt” scenario in the employee portal.",
      "cs.back": "All cases", "cs.nf": "Case not found", "cs.frame": "ZIMAAM flagged a pattern that needs human review. This is not proof of the employee's intent; there may be a legitimate explanation such as a job need.",
      "cs.tl": "Attempt timeline", "cs.tl.note": "Each row is a query whose closest protected resource was this one. “Denied” = the best match was a document the employee can't read. “Allowed” = another permitted document answered.", "cs.perday": "Attempts per day",
      "cs.why": "Why it was flagged", "cs.score": "Risk score", "cs.s.prox": "Closeness count vs threshold", "cs.s.sens": "Sensitive resource", "cs.s.leak": "Content served outside permissions", "cs.total": "Total",
      "cs.emp": "Employee", "cs.res": "Target resource", "cs.sensitive": "Sensitive", "cs.review": "Review", "cs.status": "Investigation status", "cs.note": "Reviewer note", "cs.mark": "Mark as reviewed", "cs.save": "Save", "cs.saved": "Case updated.", "cs.hist": "Case history", "cs.nohist": "No changes yet.",
      "cs.steps": "Suggested next steps", "cs.limits": "Limits of this report", "cs.opened": "Opened", "cs.empcard": "Employee profile",
      "rs.count": "{n} close approaches to the resource within {d} days (threshold {th}).", "rs.mix": "{a} denied and {b} answered from other documents.", "rs.days": "Spread over {n} distinct day(s).", "rs.sens": "The resource is classified as sensitive.", "rs.leak": "{n} request(s) were served content outside the employee's permissions (leak).",
      "stp.1": "Review the timeline with the employee's manager and the data owner of the resource.", "stp.2": "Check whether the role legitimately needs this information; consider a documented access request.", "stp.3": "Priority: content was served that the permission source does not allow. Refresh the index permissions and review what was returned.", "stp.4": "ZIMAAM does not store query text. Retrieving it, if needed, goes through the approved process and policy only.",
      "lm.1": "A case is evidence of a query pattern, not proof of intent.", "lm.2": "Counts depend on the configured thresholds and the text-representation model (here TF-IDF).", "lm.3": "Reports hold metadata only: no query text and no document content.",
      "em.h": "Employees & Access", "em.sub": "Manage access to documents. Every change applies to the employee's next request and is written to the audit log.", "em.active": "Active", "em.docs": "{n} of {m} resources", "em.cases": "{n} cases", "em.susp": "{n} suspicious", "em.none": "No matching employees",
      "em.back": "All employees", "em.perms": "Current permissions", "em.via": "Via role", "em.extra": "Extra grant", "em.granted": "Allowed", "em.nogr": "Not allowed", "em.revoke": "Revoke", "em.restore": "Restore", "em.modify": "Modify permissions",
      "em.k.ev": "Events (30 days)", "em.k.susp": "Suspicious", "em.k.den": "Denied", "em.k.cs": "Cases",
      "em.recent": "Recent activity", "em.cases": "Related security cases", "em.nocases": "No related cases.", "em.test": "Try as this employee in the portal", "em.noact": "No activity yet.",
      "em.rv.t": "Revoke access?", "em.rv.b": "{n} will lose access to “{d}” from their next request. The permission source (ACL) is updated and the action is written to the audit log.",
      "em.rs.t": "Restore access?", "em.rs.b": "{n} will regain access to “{d}” from their next request.",
      "em.rv.ok": "Access revoked. It applies to the next request.", "em.rs.ok": "Access restored.", "em.mod.t": "Modify permissions for {n}", "em.mod.p": "Select the resources this employee can access.", "em.mod.apply": "Apply changes", "em.mod.none": "Nothing changed.", "em.mod.sum": "Will revoke: {r} · Will restore: {s}", "em.mod.ok": "{n} change(s) applied.",
      "em.stale": "A permission was revoked at the source, but the search index runs on a stale copy ({d}). The employee can still see: {x}. Sync the index to close the gap.", "em.syncnow": "Sync index now", "em.synced": "Synced.",
      "au.h": "Access Audit", "au.sub": "Every access operation and every administrative change. It holds no query text and no document content.", "au.none": "No matching records", "au.none.d": "Questions and permission changes appear here as they happen.",
      "au.bt": "Permission boundary test", "au.bt.p": "Tests every (employee, forbidden document) pair and measures whether content is actually served outside permissions.", "au.bt.run": "Run test", "au.bt.leak": "Leak rate", "au.bt.recall": "Authorized recall", "au.bt.pairs": "Forbidden pairs", "au.bt.mode": "Enforcement permission source", "au.bt.leaks": "Leaks: {n} of {m}",
      "act.query": "Query", "act.admin_login": "Admin sign-in", "act.permission_revoked": "Access revoked", "act.permission_restored": "Access restored", "act.case_status": "Case status change", "act.mode_change": "Permission source change", "act.setting_change": "Setting change", "act.acl_sync": "Index sync", "act.seed": "Sample history loaded",
      "who.admin": "Administrator", "who.system": "System", "res.ok": "Succeeded", "res.answered": "Allowed", "res.denied": "Denied",
      "dt.srcacl": "Permission source (ACL) updated", "dt.demo": "Demo sign-in", "dt.closest": "Closest protected: {d}", "dt.mode": "Enforcement source: {m}", "dt.sync": "{n} revocation(s) pushed to the index", "dt.seed": "{n} synthetic events", "dt.reveal": "Employee-facing denial message: {v}", "dt.on": "shown", "dt.off": "hidden",
      "se.h": "Settings", "se.sub": "Settings for this demo environment only.",
      "se.mode": "Permission source at enforcement time", "se.mode.p": "“Live” reads permissions from their source on every question, so a revocation applies immediately. “Index copy” simulates a stale copy taken at indexing time: the employee keeps access after a revocation until the next sync.", "se.live": "Live", "se.snap": "Index copy (stale)", "se.pending": "Revocations not yet synced: {n}", "se.sync": "Sync index now",
      "se.reveal": "Show “denied” message to the employee", "se.reveal.p": "In production you would hide it so an attacker can't learn which documents exist. When hidden, the employee sees “no result”.",
      "se.det": "Detection settings", "se.thr": "Alert threshold", "se.thr.v": "{n} close approaches", "se.win": "Counting window", "se.win.v": "{n} days", "se.prox": "Closeness cutoff", "se.emb": "Text-representation model", "se.emb.v": "TF-IDF lexical (demo stand-in)",
      "se.priv": "Privacy: what is stored", "se.stored": "Stored", "se.nstored": "Not stored", "st.user": "User", "st.role": "Department", "st.time": "Time", "st.decision": "Decision", "st.served": "Document served", "st.leak": "Leak flag", "st.closest": "Closest protected resource", "st.sim": "Closeness score", "st.hash": "Salted hash of the query", "st.qt": "Query text", "st.dc": "Document content",
      "se.demo": "Demo data", "se.seed": "Load sample history (14 days)", "se.seeded": "Sample history loaded", "se.reset": "Reset environment", "se.reset.t": "Reset the environment?", "se.reset.b": "This erases all activity, cases, the audit log and permission changes, and ends employee sessions. It can't be undone.", "se.reset.ok": "Environment reset.",
      "se.share": "Open on another device", "se.share.p": "Both links open the same demo environment (for example, a phone for the employee portal and a laptop for the dashboard).", "se.share.portal": "Copy employee portal link", "se.share.dash": "Copy dashboard link", "se.copied": "Link copied.", "se.copyfail": "Couldn't copy.",
      "se.real": "What is real and what is simulated", "se.r1": "Real: permission checks, event logging, counting and alerting, case creation, access revocation and its effect on the next request, the audit log.", "se.r2": "Simulated: employees and documents are synthetic, the assistant uses no language model (TF-IDF matching), sign-in is a demo, and the clock is simulated.", "se.r3": "Needs integration: connecting ZIMAAM to your actual agent through a Gateway or Middleware, and syncing permissions from your identity provider (IdP) and data sources.",
      "se.saved": "Setting saved.",
    },
  });

  /* ---------- helpers ---------- */
  D.A = async (path, o) => { try { return await Z.api(path, Object.assign({ admin: true }, o)); } catch (e) { if (e.status === 401) D.logout(true); throw e; } };
  const debounce = (fn, ms) => { let k; return (...a) => { clearTimeout(k); k = setTimeout(() => fn(...a), ms); }; };
  D.debounce = debounce;
  D.stamp = () => { const el = document.getElementById("upd"); if (el) el.textContent = t("up.label") + " " + new Date().toLocaleTimeString(Z.lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB"); };
  D.pagehead = (title, sub, right) => { const pt = document.getElementById("ptitle"); const dup = pt && pt.textContent === title; return h("div", { class: "pagehead" }, h("div", null, h("h2", { class: dup ? "sr" : "", style: "font-size:22px" }, title), sub ? h("p", { style: dup ? "margin:0" : "" }, sub) : null), h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" }, right)); };
  D.skel = (n, hgt) => h("div", { style: "display:grid;gap:10px;padding:16px" }, Array.from({ length: n || 4 }, () => h("div", { class: "skel", style: "height:" + (hgt || 18) + "px" })));
  D.empty = (ic, title, text, actions) => h("div", { class: "empty" }, icon(ic), h("b", null, title), text ? h("span", null, text) : null, actions ? h("div", { style: "display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px" }, actions) : null);
  D.err = (msg, retry) => h("div", { class: "errbox" }, h("span", null, msg), retry ? h("button", { class: "btn sm", type: "button", onclick: retry }, icon("refresh"), t("c.retry")) : null);
  D.select = (opts, value, on, aria) => { const s = h("select", { class: "select", "aria-label": aria }, opts.map(([v, l]) => h("option", { value: v, selected: v === value }, l))); s.onchange = () => on(s.value); return s; };
  D.seg = (opts, value, on) => h("div", { class: "seg", role: "group" }, opts.map(([v, l]) => h("button", { type: "button", "aria-pressed": String(v === value), onclick: () => on(v) }, l)));
  D.search = (value, on) => { const i = h("input", { class: "input", type: "search", value, placeholder: t("f.search"), "aria-label": t("f.search") }); i.oninput = debounce(() => on(i.value), 250); return h("div", { class: "field" }, icon("search"), i); };
  D.go = (href, replace) => { history[replace ? "replaceState" : "pushState"](null, "", href); route(); };
  D.link = (href, kids, cls) => h("a", { href, "data-link": "", class: cls || "", style: (cls || "").includes("btn") ? "justify-self:start;width:fit-content" : null }, kids);
  D.person = (p) => h("div", { style: "display:flex;gap:10px;align-items:center;min-width:0" }, (() => { const a = Z.avatar(p); a.style.cssText = "width:30px;height:30px;font-size:13px;margin:0"; return a; })(), h("span", { style: "min-width:0" }, h("b", { style: "font-weight:600" }, Z.nm(p))));
  D.pager = (total, page, size, on) => {
    const from = total ? (page - 1) * size + 1 : 0, to = Math.min(total, page * size), last = Math.max(1, Math.ceil(total / size));
    return h("div", { class: "pager" }, h("span", { class: "num" }, from + "–" + to + " " + t("of") + " " + total),
      h("div", { style: "display:flex;gap:8px" }, h("button", { class: "btn sm icon", type: "button", "aria-label": t("prev"), disabled: page <= 1, onclick: () => on(page - 1) }, icon("chevl", "rtl-flip")),
        h("button", { class: "btn sm icon", type: "button", "aria-label": t("next"), disabled: page >= last, onclick: () => on(page + 1) }, icon("chevr", "rtl-flip"))));
  };
  const caseBadge = (id) => h("a", { href: "/dashboard/cases/" + id, "data-link": "", class: "chip ltr", style: "text-decoration:none" }, id);
  D.caseChip = caseBadge;

  /* ---------- events table (overview + live) ---------- */
  D.eventDialog = async (e) => {
    const kv = h("dl", { class: "kv" }, [
      [t("col.emp"), Z.nm(e.person) + " · " + Z.title(e.person)], [t("col.dept"), Z.dept(e.person)], [t("col.time") + " (UTC)", Z.ltr(Z.fmtDT(e.ts))],
      [t("col.decision"), Z.decisionBadge(e)], [t("col.target"), Z.doc(e.target_info)], [t("col.risk"), Z.riskBadge(e.risk)],
      [t("ev.closest"), e.closest_doc ? Z.doc(Object.assign({}, { title_ar: t("doc." + e.closest_doc), title_en: t("doc." + e.closest_doc) })) : "—"],
      [t("ev.sim"), e.proximity == null ? "—" : Z.ltr(String(e.proximity))], [t("ev.case"), e.case_id ? caseBadge(e.case_id) : t("ev.nocase")], [t("ev.ref"), h("span", { class: "mono ltr" }, e.ref)],
    ].flatMap(([k, v]) => [h("dt", null, k), h("dd", null, v)]));
    const btns = [{ label: t("c.close"), value: false }]; if (e.case_id) btns.push({ label: t("ev.opencase"), value: true, cls: "primary" });
    const r = await Z.dialog({ title: t("ev.detail"), wide: true, body: h("div", { style: "display:grid;gap:14px" }, kv, h("p", { class: "sm muted" }, t("ev.note"))), buttons: btns, cancelValue: false });
    if (r && e.case_id) D.go("/dashboard/cases/" + e.case_id);
  };
  D.eventsTable = (o) => {
    const st = o.state; let seen = null, seq = 0, paused = false;
    const host = h("div"), body = h("div", { "aria-live": "off" });
    const filtersActive = () => !!(st.q || st.decision || st.risk);
    const reset = h("button", { class: "btn sm ghost", type: "button", hidden: "", onclick: () => { st.q = st.decision = st.risk = ""; st.page = 1; o.rebuild ? o.rebuild() : load(); } }, t("f.reset"));
    const toolbar = o.toolbar ? h("div", { class: "toolbar" }, D.search(st.q, (v) => { st.q = v; st.page = 1; load(); }),
      D.select([["", t("f.decision") + ": " + t("f.all")], ["answered", t("dec.answered")], ["denied", t("dec.denied")]], st.decision, (v) => { st.decision = v; st.page = 1; load(); }, t("f.decision")),
      D.select([["", t("f.risk") + ": " + t("f.all")], ["none", t("risk.none")], ["low", t("risk.low")], ["medium", t("risk.medium")], ["high", t("risk.high")]], st.risk, (v) => { st.risk = v; st.page = 1; load(); }, t("f.risk")),
      reset) : null;
    host.append(...[toolbar, body].filter(Boolean));
    const th = (label, key) => { if (!o.sortable || !key) return h("th", null, label); const on = st.sort === key;
      return h("th", { "aria-sort": on ? (st.order === "asc" ? "ascending" : "descending") : "none" }, h("button", { type: "button", onclick: () => { if (on) st.order = st.order === "asc" ? "desc" : "asc"; else { st.sort = key; st.order = key === "user" || key === "dept" || key === "target" ? "asc" : "desc"; } st.page = 1; load(); } }, label, icon("sort"))); };
    function draw(r) {
      if (!r.items.length) { body.replaceChildren(filtersActive() ? D.empty("search", t("ev.nomatch"), t("ev.nomatch.d")) : D.empty("inbox", t("ev.none"), t("ev.none.d"), [h("a", { class: "btn primary sm", href: "/portal", target: "_blank", rel: "noopener" }, t("ov.portal"))])); return; }
      const max = Math.max(...r.items.map((x) => x.id)), fresh = seen == null ? () => false : (x) => x.id > seen; if (seen == null || max > seen) seen = max;
      const rows = r.items.map((e) => h("tr", { class: "row" + (fresh(e) ? " fresh" : ""), tabindex: "0", onclick: () => D.eventDialog(e), onkeydown: (k) => { if (k.key === "Enter") D.eventDialog(e); } },
        h("td", { "data-label": t("col.emp") }, D.person(e.person)), h("td", { "data-label": t("col.dept") }, Z.dept(e.person)), h("td", { "data-label": t("col.type") }, t("ev.query")),
        h("td", { "data-label": t("col.target") }, e.target_info ? Z.doc(e.target_info) : "—"), h("td", { "data-label": t("col.decision") }, Z.decisionBadge(e)),
        h("td", { "data-label": t("col.risk") }, Z.riskBadge(e.risk)), h("td", { "data-label": t("col.time") }, Z.ltr(Z.fmtDT(e.ts)))));
      const tbl = h("table", { class: "tbl stack" }, h("thead", null, h("tr", null, th(t("col.emp"), "user"), th(t("col.dept"), "dept"), th(t("col.type"), null), th(t("col.target"), "target"), th(t("col.decision"), "decision"), th(t("col.risk"), "risk"), th(t("col.time") + " (UTC)", "ts"))), h("tbody", null, rows));
      body.replaceChildren(...[h("div", { class: "tblwrap" }, tbl), o.pager === false ? null : D.pager(r.total, st.page, st.size, (p) => { st.page = p; load(); })].filter(Boolean));
    }
    async function load() {
      if (paused) return; const my = ++seq; reset.hidden = !filtersActive();
      const qs = new URLSearchParams({ range: st.range, q: st.q || "", decision: st.decision || "", risk: st.risk || "", sort: st.sort || "ts", order: st.order || "desc", page: st.page || 1, size: st.size || 10 });
      try { const r = await D.A("/admin/events?" + qs); if (my !== seq) return; draw(r); if (o.onData) o.onData(r); }
      catch (e) { if (my === seq && e.status !== 401) body.replaceChildren(D.err(e.message, load)); }
    }
    body.append(D.skel(5));
    return { el: host, load, setPaused: (v) => { paused = v; } };
  };

  /* ---------- auth + shell ---------- */
  const tok = () => Z.ss.get("zimaam_admin");
  D.logout = (expired) => {
    const k = tok(); if (k && !expired) Z.api("/admin/logout", { admin: true, body: {} }).catch(() => {});
    Z.ss.set("zimaam_admin", null); stopLive(); D.inst && D.inst.destroy && D.inst.destroy(); D.inst = null; loginView(); if (expired) Z.toast(t("err.generic"), "warn");
  };
  function loginView() {
    const lb = Z.langButton(true);
    root.replaceChildren(h("div", { class: "login" }, h("div", { class: "box" },
      h("div", { style: "display:flex;justify-content:space-between;align-items:center" }, Z.brand("/"), lb),
      h("div", null, h("h1", { style: "font-size:22px" }, t("lg.h")), h("p", { class: "muted", style: "margin-top:8px" }, t("lg.p"))),
      h("div", { class: "banner warn" }, icon("info"), h("span", null, t("lg.note"))),
      h("button", { class: "btn primary", id: "loginBtn", type: "button", onclick: async (e) => { e.currentTarget.disabled = true; try { const r = await Z.api("/admin/login", { body: {} }); Z.ss.set("zimaam_admin", r.token); boot(); } catch (er) { Z.toast(er.message, "bad"); e.target.disabled = false; } } }, icon("key"), t("lg.btn")),
      h("div", { style: "display:flex;gap:16px;justify-content:center;font-size:13px" }, h("a", { href: "/portal", style: "color:var(--blue)" }, t("lg.portal")), h("a", { href: "/", style: "color:var(--blue)" }, t("lg.home"))))));
  }
  const NAV = [["overview", "grid", "/dashboard"], ["live", "activity", "/dashboard/live"], ["cases", "cases", "/dashboard/cases"], ["employees", "users", "/dashboard/employees"], ["audit", "audit", "/dashboard/audit"], ["settings", "settings", "/dashboard/settings"]];
  let bellOpen = false;
  function shell() {
    const side = h("aside", { class: "sidebar", id: "side", "aria-label": "Main" }, Z.brand("/"),
      NAV.map(([k, ic, href]) => h("a", { class: "nav", href, "data-link": "", "data-k": k }, icon(ic), h("span", null, t("d." + k)), k === "cases" ? h("span", { class: "count", id: "navCases", hidden: "" }) : null)),
      h("div", { class: "foot" }, h("div", null, t("lg.note").split(".")[0] + "."), h("div", { class: "mono ltr", style: "margin-top:6px" }, "sandbox · " + Z.sid().slice(2, 10))));
    const scrim = h("div", { class: "scrim", id: "scrim", onclick: () => closeSide() });
    const bell = h("div", { class: "popwrap" }, h("button", { class: "btn icon", type: "button", id: "bellBtn", "aria-label": t("notif"), "aria-expanded": "false", onclick: () => toggleBell() }, icon("bell"), h("span", { class: "bell-dot", id: "bellDot", hidden: "" })), h("div", { class: "pop", id: "pop", hidden: "" }));
    const top = h("header", { class: "topbar" },
      h("button", { class: "btn icon menu", type: "button", "aria-label": t("d.menu"), onclick: () => { side.classList.add("open"); scrim.classList.add("show"); } }, icon("menu")),
      h("h1", { id: "ptitle" }), h("span", { id: "stpill" }), h("span", { class: "live off", id: "livepill", style: "white-space:nowrap" }, h("i"), h("span", { id: "livetxt" })),
      h("span", { class: "muted sm", id: "upd", style: "white-space:nowrap" }), bell, Z.langButton(true),
      h("button", { class: "btn sm", type: "button", title: t("d.admin"), onclick: () => D.logout(false) }, icon("logout", "rtl-flip"), h("span", { class: "hide-sm" }, t("d.logout"))));
    root.replaceChildren(h("div", { class: "dash" }, side, scrim, h("div", { class: "dmain" }, top, h("main", { class: "content", id: "view" }))));
  }
  function closeSide() { const s = document.getElementById("side"); s && s.classList.remove("open"); const c = document.getElementById("scrim"); c && c.classList.remove("show"); }
  function toggleBell(force) { bellOpen = force == null ? !bellOpen : force; const p = document.getElementById("pop"); if (!p) return; p.hidden = !bellOpen; document.getElementById("bellBtn").setAttribute("aria-expanded", String(bellOpen)); }
  document.addEventListener("click", (e) => { if (bellOpen && !e.target.closest(".popwrap")) toggleBell(false); const a = e.target.closest && e.target.closest("a[data-link]"); if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { e.preventDefault(); toggleBell(false); D.go(a.getAttribute("href")); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { toggleBell(false); closeSide(); } });

  /* chrome: sidebar count, notification bell, security status (derived from the cases list) */
  D.chrome = async () => {
    try { const r = await D.A("/admin/cases"); D.cases = r; } catch (e) { return; }
    const items = D.cases.items, fresh = items.filter((c) => c.status === "new"), high = items.filter((c) => c.status !== "resolved" && c.severity === "high");
    const n = document.getElementById("navCases"); if (n) { n.hidden = !fresh.length; n.textContent = fresh.length; }
    const dot = document.getElementById("bellDot"); if (dot) { dot.hidden = !fresh.length; dot.textContent = fresh.length; }
    const pill = document.getElementById("stpill"); if (pill) pill.replaceChildren(Z.badge(high.length ? "bad" : fresh.length ? "warn" : "ok", t("st.label") + ": " + (high.length ? t("st.high") : fresh.length ? t("st.review") : t("st.ok"))));
    const pop = document.getElementById("pop");
    if (pop) pop.replaceChildren(h("div", { style: "padding:12px 14px;font-weight:700;border-bottom:1px solid var(--line-2)" }, t("notif")),
      ...(fresh.length ? fresh.slice(0, 5) : [null]).map((c) => c ? h("a", { class: "it", href: "/dashboard/cases/" + c.id, "data-link": "" }, icon("alert"), h("div", null, h("b", null, c.id + " · " + Z.nm(c.person)), h("div", { class: "muted sm" }, t("notif.case") + " · " + Z.doc(c.resource_info)))) : h("div", { class: "empty", style: "padding:24px" }, h("span", null, t("notif.none")))),
      h("a", { class: "it", href: "/dashboard/cases", "data-link": "", style: "justify-content:center;color:var(--blue);font-weight:600" }, t("notif.all")));
  };

  /* ---------- router ---------- */
  function parse() {
    const p = location.pathname.replace(/\/+$/, "").split("/").filter(Boolean); const page = p[1] || "overview";
    return { page: D.pages[page] ? page : "overview", id: p[2] ? decodeURIComponent(p[2]) : null };
  }
  async function route() {
    if (!tok()) return loginView();
    if (!document.getElementById("view")) shell();
    const { page, id } = parse(); D.inst && D.inst.destroy && D.inst.destroy();
    const mod = (id && D.pages[page + "_detail"]) || D.pages[page]; D.page = page; closeSide();
    document.querySelectorAll("#side a.nav").forEach((a) => (a.getAttribute("data-k") === page ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    document.getElementById("ptitle").textContent = t(mod.title); document.title = t(mod.title) + " — ZIMAAM";
    const view = document.getElementById("view"); view.replaceChildren(); window.scrollTo(0, 0);
    D.inst = mod.mount(view, id) || {}; const mine = D.inst; D.chrome();
    try { await (mine.refresh && mine.refresh()); D.stamp(); } catch (e) { /* page shows its own error */ }
  }
  D.tick = debounce(() => { if (!tok() || !D.inst) return; D.chrome(); Promise.resolve(D.inst.refresh && D.inst.refresh()).then(D.stamp, () => {}); }, 250);
  addEventListener("popstate", route);

  /* ---------- live updates: Server-Sent Events, with polling as the fallback ---------- */
  const live = { es: null, poll: null, first: true, rev: null };
  function setLive(on) { const p = document.getElementById("livepill"), x = document.getElementById("livetxt"); if (p) p.classList.toggle("off", !on); if (x) x.textContent = t(on ? "live.on" : "live.off"); }
  function startPoll() { if (!live.poll) live.poll = setInterval(() => { if (!document.hidden) D.tick(); }, 3000); }
  function stopPoll() { clearInterval(live.poll); live.poll = null; }
  function startLive() {
    stopLive(); if (!window.EventSource) { setLive(false); startPoll(); return; }
    live.first = true; const es = (live.es = new EventSource("/api/admin/stream?sid=" + encodeURIComponent(Z.sid()) + "&key=" + encodeURIComponent(tok() || "")));
    es.onopen = () => { setLive(true); stopPoll(); };
    es.onmessage = (m) => { let r; try { r = JSON.parse(m.data).rev; } catch (e) { return; } setLive(true); if (live.first) { live.first = false; live.rev = r; return; } if (r !== live.rev) { live.rev = r; D.tick(); } };
    es.onerror = () => { setLive(false); startPoll(); };
  }
  function stopLive() { if (live.es) { live.es.close(); live.es = null; } stopPoll(); }
  D.live = live;
  document.addEventListener("visibilitychange", () => { if (!document.hidden && tok()) D.tick(); });

  function boot() { shell(); startLive(); setLive(false); route(); }
  Z.onLang(() => { if (!tok()) return loginView(); const had = document.getElementById("view"); if (had) { const keep = D.live.es; shell(); route(); setLive(!!keep && keep.readyState === 1); } });
  D.start = () => { Z.applyLang(); if (tok()) { shell(); startLive(); route(); } else loginView(); };
})();
