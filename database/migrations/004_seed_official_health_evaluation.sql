-- ============================================================
-- صِحّة | 004_seed_official_health_evaluation.sql
-- تحميل هيكل التقييم الرسمي للمكونات السبعة من دليل المدارس المعززة للصحة.
-- لا يحذف البيانات. يمكن تشغيله بأمان أكثر من مرة.
-- المصدر: المدارس المعززة.pdf، صفحات التقييم 30-54.
-- ============================================================

BEGIN;

INSERT INTO components (code, name, description, official_total_score, sort_order)
VALUES ('1', 'سياسات واستراتيجيات العمل', 'توضيح آليات تطبيق المبادرة والسياسات اللازمة لتعزيز الصحة بالمدرسة.', 60, 1)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_total_score = EXCLUDED.official_total_score,
  sort_order = EXCLUDED.sort_order;

INSERT INTO components (code, name, description, official_total_score, sort_order)
VALUES ('2', 'إكساب المعارف وتنمية المهارات وتبني السلوكيات المعززة للصحة', 'إكساب المعارف وتنمية المهارات وتبني السلوكيات المعززة للصحة.', 50, 2)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_total_score = EXCLUDED.official_total_score,
  sort_order = EXCLUDED.sort_order;

INSERT INTO components (code, name, description, official_total_score, sort_order)
VALUES ('3', 'خدمات الرعاية الصحية', 'تعزيز صحة الطلبة والعاملين بدنيا ونفسيا واجتماعيا مع التركيز على الوقاية والإسعافات الأولية والإحالة.', 50, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_total_score = EXCLUDED.official_total_score,
  sort_order = EXCLUDED.sort_order;

INSERT INTO components (code, name, description, official_total_score, sort_order)
VALUES ('4', 'تعزيز البيئة المدرسية', 'تهيئة بيئة مدرسية صحية وآمنة وداعمة للتعليم والتعلم وتعزيز صحة الطلبة.', 43, 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_total_score = EXCLUDED.official_total_score,
  sort_order = EXCLUDED.sort_order;

INSERT INTO components (code, name, description, official_total_score, sort_order)
VALUES ('5', 'تعزيز الصحة النفسية', 'تعزيز الصحة النفسية للمجتمع المدرسي وتنمية تقدير الذات وتحمل المسؤولية والاتصال الاجتماعي.', 51, 5)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_total_score = EXCLUDED.official_total_score,
  sort_order = EXCLUDED.sort_order;

INSERT INTO components (code, name, description, official_total_score, sort_order)
VALUES ('6', 'تعزيز التغذية وسلامة الغذاء', 'تحسين الوضع الغذائي للمجتمع المدرسي داخل المدرسة وفي المجتمع المحلي.', 52, 6)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_total_score = EXCLUDED.official_total_score,
  sort_order = EXCLUDED.sort_order;

INSERT INTO components (code, name, description, official_total_score, sort_order)
VALUES ('7', 'تعزيز النشاط البدني', 'رفع نسبة الطلبة الذين يمارسون النشاط البدني بصورة منتظمة، ويفضل يوميا، ليصبح عادة مدى الحياة.', 35, 7)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_total_score = EXCLUDED.official_total_score,
  sort_order = EXCLUDED.sort_order;

-- مؤشر واحد موحد لكل مكون: النموذج البرمجي واحد، والبنود تتغير حسب المكون.

INSERT INTO indicators (component_id, code, title, description, sort_order)
SELECT id, 'OFFICIAL-EVALUATION', 'التقييم الرسمي للمكون: سياسات واستراتيجيات العمل', 'بنود التقييم الرسمية الواردة في دليل المدارس المعززة للصحة.', 1
FROM components c
WHERE c.code = '1'
  AND NOT EXISTS (
    SELECT 1 FROM indicators i
    WHERE i.component_id = c.id AND i.code = 'OFFICIAL-EVALUATION'
  );


INSERT INTO indicators (component_id, code, title, description, sort_order)
SELECT id, 'OFFICIAL-EVALUATION', 'التقييم الرسمي للمكون: إكساب المعارف وتنمية المهارات وتبني السلوكيات المعززة للصحة', 'بنود التقييم الرسمية الواردة في دليل المدارس المعززة للصحة.', 1
FROM components c
WHERE c.code = '2'
  AND NOT EXISTS (
    SELECT 1 FROM indicators i
    WHERE i.component_id = c.id AND i.code = 'OFFICIAL-EVALUATION'
  );


INSERT INTO indicators (component_id, code, title, description, sort_order)
SELECT id, 'OFFICIAL-EVALUATION', 'التقييم الرسمي للمكون: خدمات الرعاية الصحية', 'بنود التقييم الرسمية الواردة في دليل المدارس المعززة للصحة.', 1
FROM components c
WHERE c.code = '3'
  AND NOT EXISTS (
    SELECT 1 FROM indicators i
    WHERE i.component_id = c.id AND i.code = 'OFFICIAL-EVALUATION'
  );


INSERT INTO indicators (component_id, code, title, description, sort_order)
SELECT id, 'OFFICIAL-EVALUATION', 'التقييم الرسمي للمكون: تعزيز البيئة المدرسية', 'بنود التقييم الرسمية الواردة في دليل المدارس المعززة للصحة.', 1
FROM components c
WHERE c.code = '4'
  AND NOT EXISTS (
    SELECT 1 FROM indicators i
    WHERE i.component_id = c.id AND i.code = 'OFFICIAL-EVALUATION'
  );


INSERT INTO indicators (component_id, code, title, description, sort_order)
SELECT id, 'OFFICIAL-EVALUATION', 'التقييم الرسمي للمكون: تعزيز الصحة النفسية', 'بنود التقييم الرسمية الواردة في دليل المدارس المعززة للصحة.', 1
FROM components c
WHERE c.code = '5'
  AND NOT EXISTS (
    SELECT 1 FROM indicators i
    WHERE i.component_id = c.id AND i.code = 'OFFICIAL-EVALUATION'
  );


INSERT INTO indicators (component_id, code, title, description, sort_order)
SELECT id, 'OFFICIAL-EVALUATION', 'التقييم الرسمي للمكون: تعزيز التغذية وسلامة الغذاء', 'بنود التقييم الرسمية الواردة في دليل المدارس المعززة للصحة.', 1
FROM components c
WHERE c.code = '6'
  AND NOT EXISTS (
    SELECT 1 FROM indicators i
    WHERE i.component_id = c.id AND i.code = 'OFFICIAL-EVALUATION'
  );


INSERT INTO indicators (component_id, code, title, description, sort_order)
SELECT id, 'OFFICIAL-EVALUATION', 'التقييم الرسمي للمكون: تعزيز النشاط البدني', 'بنود التقييم الرسمية الواردة في دليل المدارس المعززة للصحة.', 1
FROM components c
WHERE c.code = '7'
  AND NOT EXISTS (
    SELECT 1 FROM indicators i
    WHERE i.component_id = c.id AND i.code = 'OFFICIAL-EVALUATION'
  );


-- بنود التقييم الرسمية

INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.1', 'تشكيل فريق المبادرة بالمدرسة على أن يضم الفئات المطلوبة وتحديد رئيس الفريق ومنسق المبادرة', 'درجة البند وفق استمارة تقييم المكون.', 5, 1
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.1'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومقابلات؛ استمارة طلب الانضمام للمبادرة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.1'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومقابلات؛ استمارة طلب الانضمام للمبادرة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.2', 'الترويج للمبادرة من خلال اللوحات أو الملصقات أو الأعمال الفنية أو الإلكترونية وتعريف المجتمع المدرسي بالمبادرة', 'درجة البند وفق استمارة تقييم المكون.', 5, 2
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.2'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'اللوحات والملصقات والأعمال الفنية؛ مقابلات المجتمع المدرسي', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.2'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='اللوحات والملصقات والأعمال الفنية؛ مقابلات المجتمع المدرسي'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.3', 'وجود استراتيجيات عمل بالمدرسة وسياسات أو لوائح وقنوات رسمية للإصدار', 'درجة البند وفق استمارة تقييم المكون.', 5, 3
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.3'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'وجود السياسات واللوائح ومقابلات الطلبة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.3'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='وجود السياسات واللوائح ومقابلات الطلبة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.4', 'تم تدريب فريق المبادرة بالمدرسة وتوعيته بأهدافها وآلية تطبيقها', 'درجة البند وفق استمارة تقييم المكون.', 5, 4
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.4'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'توثيق التدريب والتوعية', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.4'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='توثيق التدريب والتوعية'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.5', 'اجتماعات فريق المبادرة بالمدرسة لمتابعة مستجدات المبادرة', 'درجة البند وفق استمارة تقييم المكون.', 5, 5
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.5'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'تقارير ومحاضر الاجتماعات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.5'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='تقارير ومحاضر الاجتماعات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.6', 'إجراء تقييم أولي ذاتي بداية العام الدراسي لرصد المشاكل المتعلقة بالصحة وتحديد أولوياتها', 'درجة البند وفق استمارة تقييم المكون.', 5, 6
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.6'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'نتائج المسوحات الطبية أو الاستبيانات أو سجلات العيادة أو الأخصائيين', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.6'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='نتائج المسوحات الطبية أو الاستبيانات أو سجلات العيادة أو الأخصائيين'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.7', 'وضع خطة لحل المشكلة الصحية الرئيسية ذات الأولوية موضحا فيها الهدف العام والخاص والأنشطة التنفيذية والجدول الزمني والموارد المطلوبة والمسؤول عن التنفيذ', 'درجة البند وفق استمارة تقييم المكون.', 10, 7
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.7'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مراجعة الخطة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.7'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مراجعة الخطة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.8', 'إبراز دور مكونات المبادرة ومساهماتها في حل المشكلة الرئيسية ذات الأولوية', 'درجة البند وفق استمارة تقييم المكون.', 5, 8
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.8'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'الاطلاع على دلائل دعم كل مكون في حل المشكلة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.8'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='الاطلاع على دلائل دعم كل مكون في حل المشكلة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.9', 'التقييم الذاتي النهائي لنتائج خطة حل المشكلة الرئيسية ومدى تحقيق الهدف الخاص مدعوما بالأدلة', 'درجة البند وفق استمارة تقييم المكون.', 5, 9
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.9'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'وجود التقييم مكتوبا ومستوفيا أدلة التقييم', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.9'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='وجود التقييم مكتوبا ومستوفيا أدلة التقييم'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.10', 'تنفيذ مشاريع أخرى داعمة لتعزيز الصحة بالمدرسة وذات توصيف واضح', 'درجة البند وفق استمارة تقييم المكون.', 5, 10
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.10'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'وجود مشاريع ذات توصيف موثق', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.10'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='وجود مشاريع ذات توصيف موثق'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.11', 'التوأمة مع مدرسة أو مدارس أخرى', 'درجة البند وفق استمارة تقييم المكون.', 2, 11
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.11'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'توثيق التوأمة من المخاطبات والفعاليات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.11'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='توثيق التوأمة من المخاطبات والفعاليات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '1.12', 'تقديم عرض مرئي مختصر لآلية تطبيق المبادرة بالمدرسة', 'درجة البند وفق استمارة تقييم المكون.', 5, 12
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '1' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '1.12'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'العرض المرئي؛ مدة العرض لا تزيد عن 15 دقيقة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='1' AND e.code='1.12'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='العرض المرئي؛ مدة العرض لا تزيد عن 15 دقيقة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '2.1', 'وجود خطة للتوعية الصحية بالمدرسة تستهدف البرامج الصحية المختلفة والفئات المستهدفة', 'درجة البند وفق استمارة تقييم المكون.', 10, 1
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '2' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '2.1'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مقابلة عينة من الطلبة والمعلمين والإداريين؛ سجلات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='2' AND e.code='2.1'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مقابلة عينة من الطلبة والمعلمين والإداريين؛ سجلات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '2.2', 'تفعيل المناسبات الصحية العالمية باستخدام أساليب التعليم النشط المختلفة', 'درجة البند وفق استمارة تقييم المكون.', 10, 2
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '2' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '2.2'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'توثيق الفعاليات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='2' AND e.code='2.2'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='توثيق الفعاليات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '2.3', 'لدى الطلبة ممارسات سليمة في النواحي الصحية المختلفة', 'درجة البند وفق استمارة تقييم المكون.', 5, 3
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '2' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '2.3'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مقابلات ومعاينة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='2' AND e.code='2.3'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مقابلات ومعاينة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '2.4', 'تدريب 5% من إجمالي قوة المدرسة على تنفيذ مهارات الإسعافات الأولية', 'درجة البند وفق استمارة تقييم المكون.', 10, 4
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '2' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '2.4'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مقابلة مع فريق الإسعافات الأولية', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='2' AND e.code='2.4'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مقابلة مع فريق الإسعافات الأولية'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '2.5', 'إعداد مواد تثقيفية صحية خاصة من قبل الطلبة', 'درجة البند وفق استمارة تقييم المكون.', 5, 5
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '2' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '2.5'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'معاينة المواد ومقابلة الطلبة المعدين لها؛ عرض المواد التثقيفية', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='2' AND e.code='2.5'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='معاينة المواد ومقابلة الطلبة المعدين لها؛ عرض المواد التثقيفية'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '2.6', 'وجود مسابقات تتناول الجوانب الصحية', 'درجة البند وفق استمارة تقييم المكون.', 5, 6
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '2' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '2.6'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات المدرسة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='2' AND e.code='2.6'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات المدرسة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '2.7', 'تنظيم فعاليات للأسر والمجتمع لإذكاء الوعي بأهمية تعزيز صحتهم داخل أو خارج المدرسة', 'درجة البند وفق استمارة تقييم المكون.', 5, 7
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '2' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '2.7'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات التوثيق', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='2' AND e.code='2.7'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات التوثيق'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.1', 'الكادر التمريضي تم تدريبه على مبادرة المدارس المعززة للصحة', 'درجة البند وفق استمارة تقييم المكون.', 5, 1
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.1'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'شهادة الحضور أو نسخة من برنامج الورشة التدريبية', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.1'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='شهادة الحضور أو نسخة من برنامج الورشة التدريبية'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.2', 'الكادر التمريضي على علم بأهم المشاكل الصحية الموجودة بالمدرسة بناء على نتائج المسوحات الطبية وأنشطة العيادة', 'درجة البند وفق استمارة تقييم المكون.', 10, 2
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.2'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'السجلات ودلائل ومؤشرات المشاكل الصحية', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.2'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='السجلات ودلائل ومؤشرات المشاكل الصحية'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.3', 'الكادر التمريضي التحق بورش تدريبية في مجالات الصحة النفسية والمشورة الصحية لليافعين وتثقيف الأقران والدعم النفسي وصحة الفتيات', 'درجة البند وفق استمارة تقييم المكون.', 5, 3
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.3'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'شهادة الحضور أو نسخة من برنامج الورشة التدريبية', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.3'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='شهادة الحضور أو نسخة من برنامج الورشة التدريبية'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.4', 'عيادة الصحة المدرسية نظيفة ومرتبة ومكتملة من ناحية المستلزمات الطبية حسب القائمة المعتمدة', 'درجة البند وفق استمارة تقييم المكون.', 5, 4
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.4'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجل عهدة الأجهزة؛ توفر الأدوية وصلاحيتها؛ المطهرات والغيار والنظافة؛ قائمة معايير مكافحة العدوى', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.4'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجل عهدة الأجهزة؛ توفر الأدوية وصلاحيتها؛ المطهرات والغيار والنظافة؛ قائمة معايير مكافحة العدوى'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.5', 'وجود سجل صحي ورقي أو إلكتروني مكتمل البيانات لكل طالب', 'درجة البند وفق استمارة تقييم المكون.', 5, 5
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.5'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مراجعة سجلات الطالب', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.5'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مراجعة سجلات الطالب'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.6', 'وجود سجل صحي للعاملين بالمدرسة وبرامجهم الوقائية', 'درجة البند وفق استمارة تقييم المكون.', 5, 6
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.6'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'وجود سجل محدث وموثق البيانات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.6'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='وجود سجل محدث وموثق البيانات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.7', 'لدى الهيئة التدريسية والعاملين بالمدرسة ممارسات صحية تستهدف الوصول إلى نمط حياة صحي سليم', 'درجة البند وفق استمارة تقييم المكون.', 5, 7
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.7'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مقابلة عينة عشوائية من الهيئة التدريسية والإدارية والعاملين', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.7'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مقابلة عينة عشوائية من الهيئة التدريسية والإدارية والعاملين'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.8', 'وجود متابعة ورعاية خاصة للطلبة ذوي الأمراض المزمنة والاحتياجات الخاصة', 'درجة البند وفق استمارة تقييم المكون.', 5, 8
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.8'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'معاينة التقارير الطبية للحالات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.8'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='معاينة التقارير الطبية للحالات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '3.9', 'اكتمال وتحديث سجلات عيادة الصحة المدرسية', 'درجة البند وفق استمارة تقييم المكون.', 5, 9
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '3' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '3.9'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مراجعة سجلات عيادة الصحة المدرسية', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='3' AND e.code='3.9'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مراجعة سجلات عيادة الصحة المدرسية'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '4.1', 'وجود ماء نظيف وصالح للشرب والاستخدامات الأخرى', 'درجة البند وفق استمارة تقييم المكون.', 6, 1
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '4' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '4.1'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'تقرير فحص المياه؛ المعاينة والاطلاع على الاستمارات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='4' AND e.code='4.1'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='تقرير فحص المياه؛ المعاينة والاطلاع على الاستمارات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '4.2', 'عدد صنابير مياه الشرب مطابق للمعيار المطلوب (صنبور/75 طالب)', 'درجة البند وفق استمارة تقييم المكون.', 3, 2
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '4' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '4.2'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'المعاينة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='4' AND e.code='4.2'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='المعاينة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '4.3', 'سلامة الصرف الصحي ونظافة دورات المياه ووجود أحواض لغسل الأيدي', 'درجة البند وفق استمارة تقييم المكون.', 10, 3
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '4' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '4.3'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'تقرير صحة البيئة والمعاينة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='4' AND e.code='4.3'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='تقرير صحة البيئة والمعاينة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '4.4', 'التهوية والتكييف مناسبة في الفصول مع وجود إضاءة كافية', 'درجة البند وفق استمارة تقييم المكون.', 7, 4
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '4' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '4.4'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'المعاينة؛ تقرير البيئة؛ سجل الصيانة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='4' AND e.code='4.4'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='المعاينة؛ تقرير البيئة؛ سجل الصيانة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '4.5', 'نظافة المبنى المدرسي والفصول والبيئة المحيطة', 'درجة البند وفق استمارة تقييم المكون.', 6, 5
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '4' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '4.5'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'المعاينة؛ الاطلاع على تقرير البيئة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='4' AND e.code='4.5'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='المعاينة؛ الاطلاع على تقرير البيئة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '4.6', 'إجراءات السلامة مستوفاة', 'درجة البند وفق استمارة تقييم المكون.', 5, 6
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '4' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '4.6'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'المعاينة؛ الاطلاع على تقرير البيئة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='4' AND e.code='4.6'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='المعاينة؛ الاطلاع على تقرير البيئة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '4.7', 'سلامة الحافلات', 'درجة البند وفق استمارة تقييم المكون.', 6, 7
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '4' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '4.7'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'المعاينة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='4' AND e.code='4.7'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='المعاينة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '5.1', 'وجود فرد مدرب على تعزيز الصحة النفسية', 'درجة البند وفق استمارة تقييم المكون.', 5, 1
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '5' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '5.1'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'وجود شهادات التدريب', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='5' AND e.code='5.1'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='وجود شهادات التدريب'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '5.2', 'تقديم حصص توجيهية وإرشادية وفعاليات ومبادرات ومحاضرات وقائية ونمائية في الصحة النفسية', 'درجة البند وفق استمارة تقييم المكون.', 12, 2
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '5' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '5.2'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'خطة عمل الأخصائي النفسي أو الاجتماعي والبرامج المقدمة؛ مقابلات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='5' AND e.code='5.2'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='خطة عمل الأخصائي النفسي أو الاجتماعي والبرامج المقدمة؛ مقابلات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '5.3', 'تقديم برامج علاجية للمشكلات السلوكية والنفسية وإحالتها للمختصين مع مراعاة الخصوصية', 'درجة البند وفق استمارة تقييم المكون.', 5, 3
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '5' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '5.3'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'قائمة بأعداد المحولين وما تم إجراؤه لهم مع مراعاة السرية والخصوصية', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='5' AND e.code='5.3'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='قائمة بأعداد المحولين وما تم إجراؤه لهم مع مراعاة السرية والخصوصية'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '5.4', 'تقديم الخدمات الإرشادية للرعاية الطالبية للفئات المستهدفة', 'درجة البند وفق استمارة تقييم المكون.', 13, 4
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '5' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '5.4'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومقابلات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='5' AND e.code='5.4'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومقابلات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '5.5', 'وجود دعم من المجتمع الخارجي والمؤسسات الحكومية', 'درجة البند وفق استمارة تقييم المكون.', 7, 5
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '5' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '5.5'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'توثيق', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='5' AND e.code='5.5'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='توثيق'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '5.6', 'وجود أنشطة اجتماعية وترفيهية للطلبة والعاملين بالمدرسة', 'درجة البند وفق استمارة تقييم المكون.', 9, 6
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '5' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '5.6'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومقابلات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='5' AND e.code='5.6'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومقابلات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '6.1', 'تطبيق الاشتراطات الصحية للجمعيات التعاونية والمقاصف المدرسية', 'درجة البند وفق استمارة تقييم المكون.', 12, 1
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '6' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '6.1'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومعاينة؛ استمارة متابعة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='6' AND e.code='6.1'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومعاينة؛ استمارة متابعة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '6.2', 'تحديد المشكلات الغذائية بين الطلبة بناء على نتائج التقييم التغذوي', 'درجة البند وفق استمارة تقييم المكون.', 5, 2
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '6' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '6.2'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'نتائج استبيان التقييم التغذوي؛ سجل المترددين؛ الفحص الشامل', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='6' AND e.code='6.2'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='نتائج استبيان التقييم التغذوي؛ سجل المترددين؛ الفحص الشامل'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '6.3', 'وجود متابعة للطلبة ذوي المشكلات الغذائية', 'درجة البند وفق استمارة تقييم المكون.', 5, 3
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '6' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '6.3'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'توثيق وسجلات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='6' AND e.code='6.3'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='توثيق وسجلات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '6.4', 'وجود برامج وفعاليات تغذوية داعمة لحل مشكلات التغذية بالمدرسة', 'درجة البند وفق استمارة تقييم المكون.', 10, 4
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '6' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '6.4'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومعاينة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='6' AND e.code='6.4'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومعاينة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '6.5', 'وجود أنشطة توعوية في التغذية وسلامة الغذاء للطلبة والمعلمين والعاملين', 'درجة البند وفق استمارة تقييم المكون.', 5, 5
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '6' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '6.5'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومقابلة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='6' AND e.code='6.5'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومقابلة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '6.6', 'يمارس الطلبة سلوكا غذائيا صحيا كنمط حياة', 'درجة البند وفق استمارة تقييم المكون.', 5, 6
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '6' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '6.6'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مقابلة عينة عشوائية من الطلبة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='6' AND e.code='6.6'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مقابلة عينة عشوائية من الطلبة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '6.7', 'وجود أنشطة موجهة لأولياء الأمور والمجتمع المحلي تتعلق بالتغذية وسلامة الغذاء', 'درجة البند وفق استمارة تقييم المكون.', 5, 7
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '6' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '6.7'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومقابلة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='6' AND e.code='6.7'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومقابلة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '6.8', 'وجود مشاركة مجتمعية لدعم التغذية الصحية بالمدرسة', 'درجة البند وفق استمارة تقييم المكون.', 5, 8
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '6' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '6.8'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'توثيق المشاركة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='6' AND e.code='6.8'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='توثيق المشاركة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '7.1', 'تفعيل مشاركة الطالب والمعلمين في الأنشطة البدنية', 'درجة البند وفق استمارة تقييم المكون.', 5, 1
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '7' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '7.1'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات؛ مقابلات؛ توثيق', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='7' AND e.code='7.1'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات؛ مقابلات؛ توثيق'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '7.2', 'وجود برامج منتظمة للأنشطة البدنية للطلبة وذوي الاحتياجات الخاصة', 'درجة البند وفق استمارة تقييم المكون.', 5, 2
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '7' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '7.2'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومقابلات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='7' AND e.code='7.2'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومقابلات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '7.3', 'تحقيق مبدأ السلامة والأمن الرياضي', 'درجة البند وفق استمارة تقييم المكون.', 5, 3
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '7' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '7.3'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'معاينة؛ سجل', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='7' AND e.code='7.3'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='معاينة؛ سجل'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '7.4', 'وجود ملاعب مختلفة مهيأة ومجهزة للأنشطة الرياضية المختلفة', 'درجة البند وفق استمارة تقييم المكون.', 5, 4
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '7' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '7.4'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'معاينة', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='7' AND e.code='7.4'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='معاينة'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '7.5', 'وجود برامج نشاط بدني يستهدف الإداريين والمعلمين والعاملين', 'درجة البند وفق استمارة تقييم المكون.', 5, 5
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '7' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '7.5'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومقابلات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='7' AND e.code='7.5'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومقابلات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '7.6', 'وجود برامج نشاط بدني وترفيهي لأفراد المجتمع سواء داخل المدرسة أو خارجها', 'درجة البند وفق استمارة تقييم المكون.', 5, 6
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '7' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '7.6'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'سجلات ومقابلات', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='7' AND e.code='7.6'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='سجلات ومقابلات'
  );


INSERT INTO evaluation_items (indicator_id, code, title, description, max_score, sort_order)
SELECT i.id, '7.7', 'يمارس الطلبة النشاط البدني كنمط حياة', 'درجة البند وفق استمارة تقييم المكون.', 5, 7
FROM indicators i
JOIN components c ON c.id = i.component_id
WHERE c.code = '7' AND i.code = 'OFFICIAL-EVALUATION'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_items e
    WHERE e.indicator_id = i.id AND e.code = '7.7'
  );


INSERT INTO evaluation_sources (evaluation_item_id, title, description)
SELECT e.id, 'مقابلة عينة عشوائية من الطلاب', 'مصدر التقييم كما ورد في استمارة المكون.'
FROM evaluation_items e
JOIN indicators i ON i.id=e.indicator_id
JOIN components c ON c.id=i.component_id
WHERE c.code='7' AND e.code='7.7'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_sources s WHERE s.evaluation_item_id=e.id AND s.title='مقابلة عينة عشوائية من الطلاب'
  );


-- ملاحظة توثيقية:
-- مجموع درجات بنود المكون الأول كما تظهر في النص المستخرج = 62،
-- بينما الدليل يذكر إجمالي درجات التقييم = 60. لم نغيّر أيا من النصوص.
-- يجب حسم هذه الملاحظة مع النسخة الرسمية/فريق التقييم قبل اعتماد الحساب الآلي.

COMMIT;