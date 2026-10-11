# إشعارات الصلاة — Cloudflare Workers + D1 (نسخة ما قبل النشر)

خدمة منفصلة عن موقع GitHub Pages وعن نموذج Railway القديم. **لم تُنشر ولم تُختبر على هاتف حتى الآن**. لا تفعل `assets/data/prayer-push-config.json` حتى نجاح اختبارات الأمان والإرسال.

## البنية

- `src/index.js`: Worker يستقبل اشتراكات Push ويشغّل Cron كل دقيقة.
- `schema.sql`: D1 للاشتراكات وجدول منع التكرار والذاكرة المؤقتة للمواقيت.
- `wrangler.jsonc`: إعدادات Worker وربط D1 دون أسرار.
- واجهات API: `GET /health`, `GET /api/public-key`, `POST /api/subscriptions`, `DELETE /api/subscriptions`.
- كل اشتراك مقترن برمز إدارة عشوائي محفوظ في جهاز المشترك. الرمز المطلوب لتعديل الاشتراك أو حذفه، وليس مفتاح VAPID.

## التهيئة قبل النشر

1. أنشئ حساب Cloudflare ثم من هذا المجلد نفّذ `npm install` و`npx wrangler login`.
2. نفّذ `npx wrangler d1 create quran-prayer-push`، وانسخ **معرّف قاعدة البيانات** إلى `database_id` في `wrangler.jsonc`.
3. غيّر `VAPID_SUBJECT` إلى `mailto:` لبريد مسؤول خدمة Push. لا تضع أي بريد سري في المستودع إذا لم ترغب في نشره.
4. ولّد زوج VAPID متوافقًا مع Web Push: عبر `npx web-push generate-vapid-keys` (من جهازك). أدخل المفتاح العام فقط كمتغير بيئة `VAPID_PUBLIC_KEY`، والمفتاح الخاص عبر `npx wrangler secret put VAPID_PRIVATE_KEY`. يوصى بوضع المفتاح العام أيضًا في متغير سري إن رغبت، لكن نشره لا يُعد سرًا.
5. نفّذ `npx wrangler d1 execute quran-prayer-push --remote --file=schema.sql` ثم `npx wrangler deploy`.
6. افحص `/health` و`/api/public-key` على رابط workers.dev. اجعل `ALLOWED_ORIGIN=https://imadtbn.github.io`.
7. أجرِ اختبار إرسال تجريبي وفحص استقبال الهاتف في الخلفية قبل ضبط `assets/data/prayer-push-config.json` على `{"apiBaseUrl":"https://...workers.dev","enabled":true}`.

## الأمان والحدود

- خدمة Push ليست مجانية بلا حدود: Cron يعمل كل دقيقة، وعدد قراءات D1 يرتفع مع المشتركين. التصميم الأولي يعالج **حتى 1000 مشترك في جولة Cron**، وهو حد تنفيذي وليس سعة الخدمة أو ضمانًا لدقة التنبيهات.
- أضف **Rate Limiting/WAF** في حساب Cloudflare على مسارات `/api/subscriptions` قبل تفعيل الخدمة العامة. تم تقييد CORS إلى موقع المكتبة، لكن CORS لا يمنع جميع الطلبات غير الصادرة عن المتصفح.
- المسارات تسمح فقط بعناوين خوادم Push المعروفة لتقليل مخاطر SSRF. افحص الحاجة لإضافة نطاق موثوق آخر وفق الأجهزة المدعومة.
- تجمع الخدمة موقع GPS التقريبي/إحداثياته واشتراكات Push. انشر سياسة خصوصية واضحة، وفترة حذف البيانات، وسياسة الاحتفاظ والموافقة قبل الإطلاق العام. يمكن للمستخدم حذف اشتراكه من الجهاز المرتبط به. وضع خاص لإزالة الاشتراكات بعد فقدان بيانات الجهاز يحتاج تصميمًا إضافيًا.
- الزمن محسوب من واجهة AlAdhan حسب GPS وطريقة الحساب، ويمكن أن يتأخر Cron أو Push في الخلفية. لا تَعِد بإشعار في الثانية المحددة.
- تحتوي هذه النسخة على تشفير Web Push وفق RFC 8291 وVAPID وفق RFC 8292 بتطبيق WebCrypto؛ **لا تعتبر التوافق مثبتًا دون تجربة استقبال حقيقية من Chrome/Firefox/Safari**.
- Node.js السابق في `push-server/` مرجعي/قديم ولا يُستخدم في نشر Cloudflare.
