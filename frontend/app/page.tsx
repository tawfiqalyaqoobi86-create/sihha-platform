"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileUp,
  HeartPulse,
  Info,
  Leaf,
  Menu,
  Save,
  Search,
  Plus,
  Target,
  ShieldCheck,
  Users,
  Utensils,
} from "lucide-react";

type Component = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  official_total_score?: number | null;
  sort_order?: number | null;
};

type Item = {
  id: string;
  item_number: number;
  title: string;
  description?: string | null;
  max_score: number;
  sort_order?: number | null;
  sources?: { id: string; title: string; description?: string | null }[];
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const icons = [ShieldCheck, Building2, Utensils, Activity, Users, HeartPulse, Leaf];

const judgments = [
  { value: "5", label: "متميز (5)" },
  { value: "4", label: "جيد (4)" },
  { value: "3", label: "ملائم (3)" },
  { value: "2", label: "غير ملائم (2)" },
  { value: "1", label: "يحتاج إلى تدخل سريع (1)" },
];

export default function Home() {
  const [components, setComponents] = useState<Component[]>([]);
  const [selected, setSelected] = useState<Component | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [judgment, setJudgment] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [evidenceCount, setEvidenceCount] = useState<Record<string, number>>({});
  const [problems, setProblems] = useState<any[]>([]);
  const [showProblems, setShowProblems] = useState(false);
  const [problemTitle, setProblemTitle] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [showPlans, setShowPlans] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [planGoal, setPlanGoal] = useState("");
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [objectives, setObjectives] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [objectiveTitle, setObjectiveTitle] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [activityResponsible, setActivityResponsible] = useState("");
  const [activityStart, setActivityStart] = useState("");
  const [activityEnd, setActivityEnd] = useState("");
  const [activityComponents, setActivityComponents] = useState<Record<string,string[]>>({});
  const [activityEvidence, setActivityEvidence] = useState<Record<string,any[]>>({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboard, setDashboard] = useState({ problems: 0, plans: 0, objectives: 0, activities: 0, evidence: 0, score: 0, percentage: 0, components: [] as any[] });
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [showCompetition, setShowCompetition] = useState(false);
  const [competition, setCompetition] = useState<any>(null);
  const SCHOOL_ID = "d088a83c-9619-4bc2-9c7e-02d9e5631617";
  const YEAR_ID = "49fbf490-53ec-4044-9b76-d856e9533ee8";

  useEffect(() => {
    fetch(`${API}/api/components/`)
      .then((r) => {
        if (!r.ok) throw new Error("تعذر الاتصال بواجهة المكونات");
        return r.json();
      })
      .then((json) => {
        const data = json.data ?? [];
        setComponents(data);
        setSelected(data[0] ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProblems().catch(() => {});
    loadPlans().catch(() => {});
    fetch(`${API}/api/evaluations/school/${SCHOOL_ID}/year/${YEAR_ID}`)
      .then((r) => r.json())
      .then((json) => {
        const savedJudgments: Record<string, string> = {};
        const savedNotes: Record<string, string> = {};
        for (const row of json.data?.items ?? []) {
          savedJudgments[row.evaluation_item_id] = String(row.score);
          savedNotes[row.evaluation_item_id] = row.evaluator_notes ?? "";
        }
        setJudgment(savedJudgments);
        setNotes(savedNotes);
      })
      .catch(() => {});

    if (!selected) return;
    setItemsLoading(true);
    fetch(`${API}/api/components/${selected.id}/evaluation-items`)
      .then((r) => {
        if (!r.ok) throw new Error("تعذر جلب بنود التقييم");
        return r.json();
      })
      .then((json) => setItems(json.items ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setItemsLoading(false));
  }, [selected]);

  const totalMax = useMemo(
    () => components.reduce((sum, c) => sum + Number(c.official_total_score || 0), 0),
    [components]
  );

  const selectedIndex = selected
    ? components.findIndex((c) => c.id === selected.id)
    : 0;

  const overallMax = totalMax || 341;

  async function linkActivityComponents(activityId: string, componentIds: string[]) {
    await fetch(`${API}/api/health-plans/activities/${activityId}/components`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({component_ids:componentIds})
    });
    setActivityComponents(v=>({...v,[activityId]:componentIds}));
  }

  async function loadActivityEvidence(activityId: string) {
    const r=await fetch(`${API}/api/evidence/activity/${activityId}`);
    const json=await r.json();
    setActivityEvidence(v=>({...v,[activityId]:json.data??[]}));
  }

  async function loadPlanDetails(planId: string) {
    setSelectedPlanId(planId);
    const [o, a] = await Promise.all([
      fetch(`${API}/api/health-plans/${planId}/objectives`).then(r => r.json()),
      fetch(`${API}/api/health-plans/${planId}/activities`).then(r => r.json()),
    ]);
    setObjectives(o.data ?? []);
    setActivities(a.data ?? []);
  }

  async function createObjective() {
    if (!selectedPlanId || !objectiveTitle.trim()) return;
    const r = await fetch(`${API}/api/health-plans/${selectedPlanId}/objectives`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({health_plan_id:selectedPlanId,title:objectiveTitle}),
    });
    const json = await r.json();
    if (!r.ok) { setError(json.detail || "تعذر حفظ الهدف"); return; }
    setObjectiveTitle("");
    await loadPlanDetails(selectedPlanId);
  }

  async function createActivity() {
    if (!selectedPlanId || !activityTitle.trim()) return;
    const r = await fetch(`${API}/api/health-plans/${selectedPlanId}/activities`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        health_plan_id:selectedPlanId,
        title:activityTitle,
        responsible_person:activityResponsible || null,
        start_date:activityStart || null,
        end_date:activityEnd || null,
        status:"planned"
      }),
    });
    const json = await r.json();
    if (!r.ok) { setError(json.detail || "تعذر حفظ النشاط"); return; }
    setActivityTitle(""); setActivityResponsible(""); setActivityStart(""); setActivityEnd("");
    await loadPlanDetails(selectedPlanId);
  }

  async function loadCompetition() {
    const r=await fetch(API + "/api/competition/school/" + SCHOOL_ID + "/year/" + YEAR_ID);
    const json=await r.json();
    if (!r.ok) { setError(json.detail || "تعذر تحميل وضع المسابقة"); return; }
    setCompetition(json.competition);
  }

  async function loadReport() {
    const r=await fetch(API + "/api/reports/school/" + SCHOOL_ID + "/year/" + YEAR_ID);
    const json=await r.json();
    if (!r.ok) { setError(json.detail || "تعذر إعداد التقرير"); return; }
    setReport(json);
  }

  async function loadDashboard() {
    const [pr, pl] = await Promise.all([
      fetch(API + "/api/health-problems/school/" + SCHOOL_ID + "/year/" + YEAR_ID).then(r=>r.json()),
      fetch(API + "/api/health-plans/school/" + SCHOOL_ID + "/year/" + YEAR_ID).then(r=>r.json())
    ]);
    const ps=pr.data??[], pls=pl.data??[];
    let objectives=0, activities=0;
    for (const p of pls) {
      const [o,a]=await Promise.all([
        fetch(API + "/api/health-plans/" + p.id + "/objectives").then(r=>r.json()),
        fetch(API + "/api/health-plans/" + p.id + "/activities").then(r=>r.json())
      ]);
      objectives += o.data?.length ?? 0; activities += a.data?.length ?? 0;
    }
    const ev=await fetch(API + "/api/evaluations/school/" + SCHOOL_ID + "/year/" + YEAR_ID + "/summary").then(r=>r.json());
    setDashboard({problems:ps.length,plans:pls.length,objectives,activities,evidence:Object.values(evidenceCount).reduce((a,b)=>a+b,0),score:ev.total_score??0,percentage:ev.percentage??0,components:ev.components??[]});
  }

  async function loadPlans() {
    const r = await fetch(`${API}/api/health-plans/school/${SCHOOL_ID}/year/${YEAR_ID}`);
    const json = await r.json();
    setPlans(json.data ?? []);
  }

  async function createPlan() {
    if (!selectedProblemId || !planTitle.trim() || !planGoal.trim()) return;
    const r = await fetch(`${API}/api/health-plans/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        school_id: SCHOOL_ID,
        academic_year_id: YEAR_ID,
        problem_id: selectedProblemId,
        title: planTitle,
        main_goal: planGoal,
      }),
    });
    const json = await r.json();
    if (!r.ok) { setError(json.detail || "تعذر حفظ الخطة"); return; }
    setPlanTitle("");
    setPlanGoal("");
    await loadPlans();
  }

  async function loadProblems() {
    const r = await fetch(`${API}/api/health-problems/school/${SCHOOL_ID}/year/${YEAR_ID}`);
    const json = await r.json();
    setProblems(json.data ?? []);
  }

  async function createProblem() {
    if (!problemTitle.trim()) return;
    const r = await fetch(`${API}/api/health-problems/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        school_id: SCHOOL_ID,
        academic_year_id: YEAR_ID,
        title: problemTitle,
        description: problemDescription || null,
        priority_level: "medium",
      }),
    });
    const json = await r.json();
    if (!r.ok) {
      setError(json.detail || "تعذر حفظ المشكلة");
      return;
    }
    setProblemTitle("");
    setProblemDescription("");
    await loadProblems();
  }

  async function uploadEvidence(item: Item, file: File) {
    setUploading((v) => ({ ...v, [item.id]: true }));
    setError("");
    try {
      const form = new FormData();
      form.append("school_id", SCHOOL_ID);
      form.append("academic_year_id", YEAR_ID);
      form.append("evaluation_item_id", item.id);
      form.append("title", file.name);
      form.append("description", "شاهد مرفوع من شاشة التقييم");
      form.append("file", file);

      const response = await fetch(`${API}/api/evidence/upload`, {
        method: "POST",
        body: form,
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || "تعذر رفع الشاهد");

      setEvidenceCount((v) => ({ ...v, [item.id]: (v[item.id] || 0) + 1 }));
      setSaveMessage("تم رفع الشاهد بنجاح");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء رفع الشاهد");
    } finally {
      setUploading((v) => ({ ...v, [item.id]: false }));
    }
  }

  async function saveCurrentComponent() {
    if (!selected) return;
    setSaveMessage("جاري الحفظ...");
    setError("");
    try {
      for (const item of items) {
        const score = Number(judgment[item.id] || 0);
        const response = await fetch(`${API}/api/evaluations/save-item`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            school_id: SCHOOL_ID,
            academic_year_id: YEAR_ID,
            evaluation_item_id: item.id,
            score,
            evaluator_notes: notes[item.id] || null,
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.detail || "تعذر حفظ التقييم");
        }
      }
      setSaveMessage("تم حفظ التقييم بنجاح");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      setSaveMessage("");
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء الحفظ");
    }
  }

  function go(step: number) {
    const next = components[selectedIndex + step];
    if (next) setSelected(next);
  }

  if (loading) {
    return <main className="min-h-screen grid place-items-center">جاري تحميل المنصة...</main>;
  }

  return (
    <main className="min-h-screen">
      <header className="border-b bg-white/95 px-5 py-3 shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-600">
              <HeartPulse />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#102a56]">التقييم الذاتي للمدارس المعززة للصحة</h1>
              <p className="text-xs text-slate-500">منصة صِحّة • مدرسة عمر بن مسعود للصفوف (5-12)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <div className="font-bold">توفيق اليعقوبي</div>
              <div className="text-xs text-slate-500">مدير المدرسة • 2026–2027</div>
            </div>
            <Menu className="text-slate-500" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_300px]">
        <section className="min-w-0">
          <div className="mb-4 rounded-2xl border bg-gradient-to-l from-blue-50 to-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-sm text-slate-500">الرئيسية ← المكونات ← التقييم</p>
                <h2 className="text-2xl font-extrabold">
                  {selected ? `C${selected.code} - ${selected.name}` : "التقييم"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  تقييم الممارسة المدرسية وفق البنود الرسمية وحفظ الشواهد والملاحظات.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="نسبة الإنجاز" value="0%" />
                <Stat label="الدرجة المحصلة" value="0" />
                <Stat label="الدرجة القصوى" value={selected?.official_total_score ?? 0} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ToolbarButton icon={<ClipboardList size={17} />} text="بنود التقييم" active />
              <ToolbarButton icon={<BarChart3 size={17} />} text="تحليل النتائج" />
              <ToolbarButton icon={<Info size={17} />} text="معلومات المكون" />
              <ToolbarButton icon={<Search size={17} />} text="البحث" />
              <button onClick={()=>{setShowDashboard(!showDashboard); if(!showDashboard) loadDashboard();}} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><BarChart3 size={17}/> لوحة القيادة</button>
              <button onClick={()=>{setShowReport(!showReport); if(!showReport) loadReport();}} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><ClipboardList size={17}/> التقارير</button>
              <button onClick={()=>{setShowCompetition(!showCompetition); if(!showCompetition) loadCompetition();}} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><ShieldCheck size={17}/> وضع المسابقة</button><button
              onClick={() => { setShowPlans(!showPlans); if (!showPlans) loadPlans(); }}
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"
            >
              <ClipboardList size={17} /> الخطط الصحية
            </button><button
              onClick={() => { setShowProblems(!showProblems); if (!showProblems) loadProblems(); }}
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"
            >
              <Target size={17} /> المشكلات الصحية
            </button>
            </div>
          </div>

          {showCompetition && competition && (
            <div className="mb-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-l from-blue-50 to-white p-5 shadow-sm">
              <div className="mb-4"><h3 className="text-xl font-extrabold text-[#102a56]">وضع المسابقة</h3><p className="text-xs text-slate-500">ملف مختصر يبرز جاهزية المدرسة وإنجازاتها وشواهدها.</p></div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {[["التقييم",(competition.evaluation?.percentage??0)+"%"],["المشكلات",competition.problems?.length??0],["الخطط",competition.plans?.length??0],["الابتكارات",competition.innovations?.length??0],["التوأمة",competition.twinning?.length??0]].map(([l,v])=><div key={String(l)} className="rounded-xl bg-white p-4 text-center shadow-sm"><b className="text-xl text-blue-700">{v}</b><div className="text-xs text-slate-500">{l}</div></div>)}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border bg-white p-4"><b>أبرز الخطط</b>{(competition.plans??[]).slice(0,5).map((p:any)=><div key={p.id} className="mt-2 text-sm">✓ {p.title}</div>)}</div>
                <div className="rounded-xl border bg-white p-4"><b>بنك الابتكار</b>{(competition.innovations??[]).slice(0,5).map((i:any)=><div key={i.id} className="mt-2 text-sm">✓ {i.title} — {i.status}</div>)}</div>
              </div>
            </div>
          )}

          {showReport && report && (
            <div className="mb-4 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><div><h3 className="text-lg font-extrabold">التقرير الذكي للمدرسة</h3><p className="text-xs text-slate-500">{report.school?.name} • {report.academic_year?.name}</p></div><button onClick={loadReport} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">تحديث</button></div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[["التقييم", (report.evaluation?.percentage??0)+"%"],["المشكلات",report.problems?.length??0],["الخطط",report.plans?.length??0],["الابتكارات",report.innovations?.length??0]].map(([l,v])=><div key={String(l)} className="rounded-xl bg-slate-50 p-4 text-center"><b className="text-xl text-blue-700">{v}</b><div className="text-xs text-slate-500">{l}</div></div>)}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border p-4"><b>المشكلات والخطط</b>{(report.plans??[]).map((p:any)=><div key={p.id} className="mt-2 text-sm">• {p.title} — {p.status}</div>)}</div>
                <div className="rounded-xl border p-4"><b>الابتكار والشراكات</b>{(report.innovations??[]).map((i:any)=><div key={i.id} className="mt-2 text-sm">• {i.title} — {i.status}</div>)}{(report.twinning??[]).map((t:any)=><div key={t.id} className="mt-2 text-sm">• توأمة: {t.partner_school_name}</div>)}</div>
              </div>
            </div>
          )}

          {showDashboard && (
            <div className="mb-4 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-extrabold">لوحة قيادة صِحّة</h3><p className="text-xs text-slate-500">ملخص رحلة المدرسة من المشكلة إلى التنفيذ.</p></div><button onClick={loadDashboard} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">تحديث</button></div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {[["المشكلات",dashboard.problems],["الخطط",dashboard.plans],["الأهداف",dashboard.objectives],["الأنشطة",dashboard.activities],["الشواهد",dashboard.evidence]].map(([label,value])=><div key={String(label)} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-2xl font-extrabold text-blue-700">{value}</div><div className="mt-1 text-xs font-bold text-slate-500">{label}</div></div>)}
              </div>
              <div className="mt-4 rounded-2xl border bg-white p-4">
                <div className="mb-3 flex items-center justify-between"><b>التقييم العام للمكونات السبعة</b><span className="font-extrabold text-blue-700">{dashboard.score} درجة • {dashboard.percentage}%</span></div>
                <div className="grid gap-2 md:grid-cols-2">
                  {dashboard.components.map((c:any)=><div key={c.id} className="rounded-xl bg-slate-50 p-3"><div className="flex justify-between text-sm font-bold"><span>{c.code} - {c.name}</span><span>{c.score} / {c.max_score}</span></div><div className="mt-2 h-2 rounded-full bg-white"><div className="h-full rounded-full bg-emerald-500" style={{width:c.percentage+"%"}} /></div><div className="mt-1 text-left text-xs text-slate-500">{c.percentage}%</div></div>)}
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-gradient-to-l from-blue-50 to-emerald-50 p-4 text-center"><div className="font-extrabold">المسار التشغيلي</div><div className="mt-2 text-sm font-bold text-slate-600">المشكلة ← الأولوية ← الخطة ← الهدف ← النشاط ← الشاهد ← النتيجة ← الأثر</div></div>
            </div>
          )}

          {showPlans && (
            <div className="mb-4 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold">الخطة الصحية</h3>
                  <p className="text-xs text-slate-500">تحويل المشكلة ذات الأولوية إلى هدف وخطة قابلة للتنفيذ.</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{plans.length} خطة</span>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <select value={selectedProblemId} onChange={e=>setSelectedProblemId(e.target.value)} className="rounded-xl border px-3 py-2">
                  <option value="">اختر المشكلة</option>
                  {problems.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <input value={planTitle} onChange={e=>setPlanTitle(e.target.value)} placeholder="عنوان الخطة" className="rounded-xl border px-3 py-2 outline-none focus:border-blue-500" />
                <input value={planGoal} onChange={e=>setPlanGoal(e.target.value)} placeholder="الهدف الرئيسي" className="rounded-xl border px-3 py-2 outline-none focus:border-blue-500" />
                <button onClick={createPlan} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white"><Plus size={17}/> إنشاء</button>
              </div>
              <div className="mt-4 grid gap-2">
                {plans.map(p=>(
                  <button key={p.id} onClick={()=>loadPlanDetails(p.id)} className={`rounded-xl p-3 text-right ${selectedPlanId===p.id ? "bg-blue-50 border border-blue-300" : "bg-slate-50"}`}>
                    <div className="font-bold">{p.title}</div>
                    <div className="text-xs text-slate-500">{p.main_goal}</div>
                  </button>
                ))}
              </div>
              {selectedPlanId && (
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border p-4">
                    <h4 className="mb-3 font-extrabold">الأهداف التفصيلية</h4>
                    <div className="flex gap-2">
                      <input value={objectiveTitle} onChange={e=>setObjectiveTitle(e.target.value)} placeholder="الهدف التفصيلي" className="min-w-0 flex-1 rounded-xl border px-3 py-2" />
                      <button onClick={createObjective} className="rounded-xl bg-emerald-600 px-4 font-bold text-white">إضافة</button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {objectives.map((o,i)=><div key={o.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{i+1}. {o.title}</b></div>)}
                    </div>
                  </div>
                  <div className="rounded-2xl border p-4">
                    <h4 className="mb-3 font-extrabold">الأنشطة التنفيذية</h4>
                    <div className="grid gap-2">
                      <input value={activityTitle} onChange={e=>setActivityTitle(e.target.value)} placeholder="اسم النشاط" className="rounded-xl border px-3 py-2" />
                      <input value={activityResponsible} onChange={e=>setActivityResponsible(e.target.value)} placeholder="المسؤول عن التنفيذ" className="rounded-xl border px-3 py-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={activityStart} onChange={e=>setActivityStart(e.target.value)} className="rounded-xl border px-3 py-2" />
                        <input type="date" value={activityEnd} onChange={e=>setActivityEnd(e.target.value)} className="rounded-xl border px-3 py-2" />
                      </div>
                      <button onClick={createActivity} className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white">إضافة النشاط</button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {activities.map(a=><div key={a.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                        <div className="flex items-center justify-between"><b>{a.title}</b><span className="text-xs text-slate-500">{a.responsible_person || "غير محدد"} • {a.completion_percentage}%</span></div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {components.map(c=><label key={c.id} className="flex items-center gap-1 text-xs">
                            <input type="checkbox" checked={(activityComponents[a.id]||[]).includes(c.id)} onChange={e=>{
                              const ids=new Set(activityComponents[a.id]||[]);
                              e.target.checked?ids.add(c.id):ids.delete(c.id);
                              linkActivityComponents(a.id,[...ids]);
                            }}/>{c.name}
                          </label>)}
                        </div>
                        <button onClick={()=>loadActivityEvidence(a.id)} className="mt-2 text-xs font-bold text-blue-700">عرض الأدلة المرتبطة</button>
                        {(activityEvidence[a.id]||[]).map(ev=><div key={ev.id} className="mt-1 text-xs text-emerald-700">✓ {ev.title}</div>)}
                      </div>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {showProblems && (
            <div className="mb-4 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold">المشكلات الصحية</h3>
                  <p className="text-xs text-slate-500">من المشكلة إلى الأولوية ثم الخطة والأثر.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{problems.length} مشكلة</span>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input value={problemTitle} onChange={e=>setProblemTitle(e.target.value)} placeholder="عنوان المشكلة الصحية" className="rounded-xl border px-3 py-2 outline-none focus:border-blue-500" />
                <input value={problemDescription} onChange={e=>setProblemDescription(e.target.value)} placeholder="وصف مختصر / دليل أولي" className="rounded-xl border px-3 py-2 outline-none focus:border-blue-500" />
                <button onClick={createProblem} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white"><Plus size={17}/> إضافة</button>
              </div>
              <div className="mt-4 grid gap-2">
                {problems.map((p)=>(
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div><div className="font-bold">{p.title}</div><div className="text-xs text-slate-500">{p.description || "لا يوجد وصف"}</div></div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{p.priority_level === "high" ? "عالية" : p.priority_level === "low" ? "منخفضة" : "متوسطة"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b bg-emerald-50 px-5 py-4">
              <div className="flex items-center gap-2 font-extrabold">
                <ClipboardList className="text-emerald-600" />
                المؤشر الأول: عناصر تقييم المكون
              </div>
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                {items.length} بند
              </span>
            </div>

            {itemsLoading ? (
              <div className="p-10 text-center text-slate-500">جاري تحميل بنود التقييم...</div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="grid gap-3 p-4 lg:grid-cols-[48px_1fr_170px_190px] lg:items-center">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 font-bold text-blue-700">
                      {item.item_number}
                    </div>

                    <div>
                      <div className="font-bold leading-7">{item.title}</div>
                      {item.description && (
                        <div className="mt-1 text-xs text-slate-500">{item.description}</div>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-slate-500">الحكم / الدرجة</label>
                      <select
                        value={judgment[item.id] || ""}
                        onChange={(e) => setJudgment((v) => ({ ...v, [item.id]: e.target.value }))}
                        className="w-full rounded-xl border bg-white px-3 py-2 outline-none focus:border-blue-500"
                      >
                        <option value="">اختر الحكم</option>
                        {judgments.map((j) => (
                          <option key={j.value} value={j.value}>{j.label}</option>
                        ))}
                      </select>
                      <div className="mt-1 text-xs text-slate-400">الحد الأقصى: {item.max_score}</div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-slate-500">الشواهد والملاحظات</label>
                      <input
                        id={`file-${item.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp4"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadEvidence(item, file);
                          e.currentTarget.value = "";
                        }}
                      />
                      <button
                        onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                        disabled={uploading[item.id]}
                        className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700 disabled:opacity-50"
                      >
                        <FileUp size={16} />
                        {uploading[item.id] ? "جاري الرفع..." : "إضافة شاهد"}
                      </button>
                      {evidenceCount[item.id] > 0 && (
                        <div className="mb-2 text-xs font-bold text-emerald-700">
                          {evidenceCount[item.id]} شاهد مرفوع
                        </div>
                      )}
                      <textarea
                        rows={2}
                        value={notes[item.id] || ""}
                        onChange={(e) => setNotes((v) => ({ ...v, [item.id]: e.target.value }))}
                        placeholder="اكتب ملاحظتك هنا..."
                        className="w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 border-t bg-slate-50 p-4">
              <button onClick={() => go(-1)} className="flex items-center gap-2 rounded-xl border bg-white px-6 py-2.5 font-bold">
                <ChevronRight size={18} /> السابق
              </button>
              <button onClick={saveCurrentComponent} className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 font-bold text-white shadow-sm">
                <Save size={18} /> حفظ وانتقال
              </button>
              {saveMessage && (
                <span className="text-sm font-bold text-emerald-700">{saveMessage}</span>
              )}
              <button onClick={() => go(1)} className="flex items-center gap-2 rounded-xl border bg-white px-6 py-2.5 font-bold">
                التالي <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border bg-white p-3 shadow-sm">
          <h3 className="px-2 py-3 text-xl font-extrabold">المكونات الرئيسية (7)</h3>
          <div className="space-y-2">
            {components.map((component, i) => {
              const Icon = icons[i] || Activity;
              const active = component.id === selected?.id;
              return (
                <button
                  key={component.id}
                  onClick={() => setSelected(component)}
                  className={`w-full rounded-2xl border p-3 text-right transition ${active ? "border-blue-500 bg-blue-600 text-white shadow-md" : "bg-slate-50 hover:bg-blue-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid h-11 w-11 place-items-center rounded-xl ${active ? "bg-white/20" : "bg-white"}`}>
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold opacity-80">C{component.code}</div>
                      <div className="truncate text-sm font-extrabold">{component.name}</div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
                        <div className={`h-full rounded-full ${active ? "bg-emerald-300" : "bg-emerald-500"}`} style={{ width: "0%" }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold">{component.official_total_score}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-2xl bg-gradient-to-l from-blue-50 to-emerald-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold">الإجمالي الرسمي</span>
              <span className="text-xl font-extrabold text-blue-700">{overallMax}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white">
              <div className="h-full w-0 rounded-full bg-emerald-500" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-[90px] rounded-xl bg-white/80 px-4 py-3">
      <div className="text-xl font-extrabold text-blue-700">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}

function ToolbarButton({ icon, text, active = false }: { icon: React.ReactNode; text: string; active?: boolean }) {
  return (
    <button className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold ${active ? "border-blue-500 bg-blue-600 text-white" : "bg-white"}`}>
      {icon}{text}
    </button>
  );
}
