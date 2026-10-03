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
  const [itemEvidence, setItemEvidence] = useState<Record<string, any[]>>({});
  const [showEvidenceFor, setShowEvidenceFor] = useState<string | null>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [showProblems, setShowProblems] = useState(false);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [twinning, setTwinning] = useState<any[]>([]);
  const [showPartnerships, setShowPartnerships] = useState(false);
  const [communityRelationType, setCommunityRelationType] = useState<"community"|"twinning">("community");
  const [communityName, setCommunityName] = useState("");
  const [communityType, setCommunityType] = useState("");
  const [communityObjective, setCommunityObjective] = useState("");
  const [communityActivities, setCommunityActivities] = useState("");
  const [partnershipName, setPartnershipName] = useState("");
  const [partnershipType, setPartnershipType] = useState("");
  const [partnershipObjective, setPartnershipObjective] = useState("");
  const [twinningSchoolName, setTwinningSchoolName] = useState("");
  const [twinningObjective, setTwinningObjective] = useState("");
  const [twinningActivities, setTwinningActivities] = useState("");
  const [twinningAI, setTwinningAI] = useState<any>(null);
  const [analyzingTwinning, setAnalyzingTwinning] = useState(false);
  const [innovations, setInnovations] = useState<any[]>([]);
  const [showInnovations, setShowInnovations] = useState(false);
  const [innovationTitle, setInnovationTitle] = useState("");
  const [innovationIdea, setInnovationIdea] = useState("");
  const [innovationProblemId, setInnovationProblemId] = useState("");
  const [innovationAI, setInnovationAI] = useState<any>(null);
  const [analyzingInnovation, setAnalyzingInnovation] = useState(false);
  const [problemTitle, setProblemTitle] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [priorityScore, setPriorityScore] = useState<Record<string, string>>({});
  const [priorityJustification, setPriorityJustification] = useState<Record<string, string>>({});
  const [savingPriority, setSavingPriority] = useState<Record<string, boolean>>({});
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
  const [activityObjectiveId, setActivityObjectiveId] = useState("");
  const [selectedObjectiveForActivity, setSelectedObjectiveForActivity] = useState("");

  const [activityComponents, setActivityComponents] = useState<Record<string,string[]>>({});
  const [openActivityComponents, setOpenActivityComponents] = useState<string | null>(null);
  const [openActivityEvidence, setOpenActivityEvidence] = useState<string | null>(null);
  const [planAI, setPlanAI] = useState<any>(null);
  const [analyzingPlan, setAnalyzingPlan] = useState(false);
  const [activityEvidence, setActivityEvidence] = useState<Record<string,any[]>>({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboard, setDashboard] = useState({ problems: 0, plans: 0, objectives: 0, activities: 0, evidence: 0, score: 0, percentage: 0, components: [] as any[] });
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [showCompetition, setShowCompetition] = useState(false);
  const [showEvidenceHub, setShowEvidenceHub] = useState(false);
  const [allEvidence, setAllEvidence] = useState<any[]>([]);
  const [evidenceTarget, setEvidenceTarget] = useState<Record<string,string>>({});
  const [evidenceTargetId, setEvidenceTargetId] = useState<Record<string,string>>({});
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [showAI, setShowAI] = useState(false);
  const [competition, setCompetition] = useState<any>(null);
  const [competitionAI, setCompetitionAI] = useState<any>(null);
  const [analyzingCompetition, setAnalyzingCompetition] = useState(false);
  const [authContext, setAuthContext] = useState<any>({can_manage:false, role_names:[]});
  const SCHOOL_ID = "d088a83c-9619-4bc2-9c7e-02d9e5631617";
  const YEAR_ID = "49fbf490-53ec-4044-9b76-d856e9533ee3";

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
    loadAuthContext().catch(() => {});
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
      .then(async (json) => {
        const loadedItems: Item[] = json.items ?? [];
        setItems(loadedItems);

        // استرجاع عدد الشواهد المحفوظة فعليًا من قاعدة البيانات بعد إعادة فتح الصفحة
        const counts = await Promise.all(
          loadedItems.map(async (item) => {
            try {
              const evidenceResponse = await fetch(API + "/api/evidence/item/" + item.id);
              if (!evidenceResponse.ok) return [item.id, 0] as const;
              const evidenceJson = await evidenceResponse.json();
              return [item.id, (evidenceJson.data ?? []).length] as const;
            } catch {
              return [item.id, 0] as const;
            }
          })
        );
        setEvidenceCount(Object.fromEntries(counts));
      })
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
    setError("");
    try {
      const r = await fetch(`${API}/api/health-plans/activities/${activityId}/components`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({component_ids:componentIds})
      });
      const json = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(json.detail || "تعذر حفظ المجالات المرتبطة");
      setActivityComponents(v=>({...v,[activityId]:componentIds}));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ المجالات المرتبطة");
    }
  }

  async function loadActivityEvidence(activityId: string) {
    try {
      const r=await fetch(`${API}/api/evidence/activity/${activityId}`);
      const json=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر تحميل أدلة النشاط");
      setActivityEvidence(v=>({...v,[activityId]:json.data??[]}));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل أدلة النشاط");
    }
  }

  async function openActivityEvidencePicker(activityId: string) {
    setError("");
    const opening = openActivityEvidence !== activityId;
    setOpenActivityEvidence(opening ? activityId : null);
    if (!opening) return;
    try {
      await Promise.all([loadActivityEvidence(activityId), loadEvidenceHub()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الأدلة");
    }
  }

  async function linkEvidenceToActivity(activityId: string, evidenceId: string) {
    setError("");
    try {
      const r = await fetch(API + "/api/evidence/link", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({evidence_id:evidenceId, activity_id:activityId})
      });
      const json = await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر ربط الشاهد بالنشاط");
      await loadActivityEvidence(activityId);
      setSaveMessage("تم ربط الشاهد بالنشاط");
      setTimeout(()=>setSaveMessage(""),2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر ربط الشاهد بالنشاط");
    }
  }

  async function loadPlanDetails(planId: string) {
    setSelectedPlanId(planId);
    setError("");
    try {
      const [oResponse, aResponse] = await Promise.all([
        fetch(`${API}/api/health-plans/${planId}/objectives`),
        fetch(`${API}/api/health-plans/${planId}/activities`),
      ]);
      const o = await oResponse.json().catch(() => ({}));
      const a = await aResponse.json().catch(() => ({}));
      if (!oResponse.ok) throw new Error(o.detail || "تعذر تحميل أهداف الخطة");
      if (!aResponse.ok) throw new Error(a.detail || "تعذر تحميل أنشطة الخطة");

      const loadedActivities = a.data ?? [];
      setObjectives(o.data ?? []);
      setActivities(loadedActivities);

      const componentEntries = await Promise.all(
        loadedActivities.map(async (activity: any) => {
          try {
            const response = await fetch(`${API}/api/health-plans/activities/${activity.id}/components`);
            const json = await response.json();
            return [activity.id, json.data ?? []] as const;
          } catch {
            return [activity.id, []] as const;
          }
        })
      );
      const evidenceEntries = await Promise.all(
        loadedActivities.map(async (activity: any) => {
          try {
            const response = await fetch(`${API}/api/evidence/activity/${activity.id}`);
            const json = await response.json();
            return [activity.id, json.data ?? []] as const;
          } catch {
            return [activity.id, []] as const;
          }
        })
      );
      setActivityComponents(Object.fromEntries(componentEntries));
      setActivityEvidence(Object.fromEntries(evidenceEntries));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل تفاصيل الخطة");
    }
  }
  useEffect(() => {
    if (objectives.length === 1) {
      setActivityObjectiveId(prev => prev || objectives[0].id);
      setSelectedObjectiveForActivity(prev => prev || objectives[0].id);
    } else if (objectives.length !== 1 && !objectives.some((o:any)=>o.id === activityObjectiveId)) {
      setActivityObjectiveId("");
    }
  }, [objectives]);

  async function updateActivityObjective(activityId: string, objectiveId: string) {
    setError("");
    try {
      const r = await fetch(`${API}/api/health-plans/activities/${activityId}`, {
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({objective_id: objectiveId || null}),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.detail || "تعذر ربط النشاط بالهدف");
      setActivities(current => current.map(a => a.id === activityId ? {...a, objective_id: objectiveId || null} : a));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر ربط النشاط بالهدف");
    }
  }

  async function createObjective() {
    if (!selectedPlanId || !objectiveTitle.trim()) return;
    setError("");
    try {
      const r = await fetch(`${API}/api/health-plans/${selectedPlanId}/objectives`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({health_plan_id:selectedPlanId,title:objectiveTitle}),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.detail || "تعذر حفظ الهدف");
      const newObjectiveId = json.data?.id || "";
      setObjectiveTitle("");
      if (newObjectiveId) {
        const orphanActivities = activities.filter(a => !a.objective_id);
        if (orphanActivities.length && objectives.length === 0) {
          await Promise.all(orphanActivities.map(a => updateActivityObjective(a.id, newObjectiveId)));
        }
        setActivityObjectiveId(newObjectiveId);
      }
      await loadPlanDetails(selectedPlanId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ الهدف");
    }
  }

  async function createActivity() {
    if (!selectedPlanId || !activityTitle.trim()) return;
    const objectiveId = selectedObjectiveForActivity || (objectives.length === 1 ? objectives[0].id : "");
    if (!objectiveId) {
      setError(objectives.length === 0 ? "أضف هدفًا تفصيليًا أولًا ثم اربط النشاط به." : "اختر الهدف التفصيلي الذي يرتبط به النشاط.");
      return;
    }
    setError("");
    try {
      const r = await fetch(`${API}/api/health-plans/${selectedPlanId}/activities`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          health_plan_id:selectedPlanId,
          objective_id:objectiveId,
          title:activityTitle,
          responsible_person:activityResponsible || null,
          start_date:activityStart || null,
          end_date:activityEnd || null,
          status:"planned"
        }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.detail || "تعذر حفظ النشاط");
      if (json.data) {
        setActivities((current) => [...current, json.data]);
        setActivityComponents((current) => ({...current, [json.data.id]: []}));
      }
      setActivityTitle("");
      setActivityResponsible("");
      setActivityStart("");
      setActivityEnd("");
      setActivityObjectiveId("");
      setSelectedObjectiveForActivity(objectiveId);
      await loadPlanDetails(selectedPlanId);
      setSaveMessage("تم إضافة النشاط بنجاح");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ النشاط");
    }
  }
  async function analyzeSelectedPlan() {
    if (!selectedPlanId) return;
    setAnalyzingPlan(true);
    setError("");
    try {
      const r = await fetch(API + "/api/ai/plan-analysis", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({plan_id:selectedPlanId})
      });
      const json=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر تحليل الخطة");
      setPlanAI(json.analysis);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر تحليل الخطة");
    } finally {
      setAnalyzingPlan(false);
    }
  }

  async function loadAI() {
    const r=await fetch(API + "/api/ai/school-summary",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({school_id:SCHOOL_ID,academic_year_id:YEAR_ID,focus:"ملخص حالة المدرسة"})});
    const json=await r.json();
    if(!r.ok){setError(json.detail||"تعذر تشغيل المساعد الذكي");return;}
    setAiSummary(json.summary);
  }

  async function linkHubEvidence(evidenceId: string) {
    const type=evidenceTarget[evidenceId], id=evidenceTargetId[evidenceId];
    if (!type || !id) return;
    const body:any={evidence_id:evidenceId}; body[type]=id;
    const r=await fetch(API + "/api/evidence/link",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const json=await r.json();
    if(!r.ok){setError(json.detail||"تعذر ربط الشاهد");return;}
    setSaveMessage("تم ربط الشاهد بنجاح");
    setTimeout(()=>setSaveMessage(""),2500);
  }

  async function loadEvidenceHub() {
    const r=await fetch(API + "/api/evidence/school/" + SCHOOL_ID + "/year/" + YEAR_ID);
    const json=await r.json();
    if (!r.ok) { setError(json.detail || "تعذر تحميل مستودع الأدلة"); return; }
    setAllEvidence(json.data ?? []);
  }

  async function loadCompetition() {
    const r=await fetch(API + "/api/competition/school/" + SCHOOL_ID + "/year/" + YEAR_ID);
    const json=await r.json();
    if (!r.ok) { setError(json.detail || "تعذر تحميل وضع المسابقة"); return; }
    setCompetition(json.competition);
  }

  async function loadAuthContext() {
    try {
      const r = await fetch(API + "/api/auth/context?school_id=" + SCHOOL_ID);
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.detail || "تعذر تحميل صلاحيات المستخدم");
      setAuthContext(json);
    } catch (e) {
      setAuthContext({can_manage:false, role_names:[]});
    }
  }

  async function analyzeCompetitionReadiness() {
    setAnalyzingCompetition(true);
    setError("");
    try {
      const r = await fetch(API + "/api/ai/competition-readiness", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({school_id:SCHOOL_ID, academic_year_id:YEAR_ID})
      });
      const json = await r.json().catch(()=>({}));
      if (!r.ok) throw new Error(json.detail || "تعذر تحليل جاهزية الملف");
      setCompetitionAI(json.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحليل جاهزية الملف");
    } finally {
      setAnalyzingCompetition(false);
    }
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


  async function deletePlan(planId: string, title: string) {
    if (!window.confirm(`هل أنت متأكد من حذف الخطة الصحية «${title}»؟\nسيتم حذف أهدافها وأنشطتها المرتبطة بها، ولا يمكن التراجع عن الحذف.`)) return;
    setError("");
    try {
      const r = await fetch(`${API}/api/health-plans/${planId}`, { method: "DELETE" });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.detail || "تعذر حذف الخطة الصحية");
      if (selectedPlanId === planId) {
        setSelectedPlanId("");
        setObjectives([]);
        setActivities([]);
      }
      await loadPlans();
      await loadProblems();
      setSaveMessage("تم حذف الخطة الصحية");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حذف الخطة الصحية");
    }
  }

  async function loadPartnerships() {
    try {
      const r = await fetch(API + "/api/partnerships/school/" + SCHOOL_ID + "/year/" + YEAR_ID);
      const json = await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر تحميل الشراكات والتوأمة");
      setPartnerships(json.partnerships ?? []);
      setTwinning(json.twinning ?? []);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الشراكات والتوأمة");
    }
  }

  async function createPartnership() {
    if(!partnershipName.trim() || !partnershipObjective.trim()) {
      setError("أدخل اسم جهة الشراكة والهدف.");
      return;
    }
    try {
      const partnerResponse = await fetch(API + "/api/partnerships/partners", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:partnershipName, partner_type:partnershipType || null})
      });
      const partnerJson = await partnerResponse.json().catch(()=>({}));
      if(!partnerResponse.ok) throw new Error(partnerJson.detail || "تعذر حفظ جهة الشراكة");
      const partnerId=partnerJson.data?.id;
      if(!partnerId) throw new Error("تعذر الحصول على معرّف جهة الشراكة");
      const r = await fetch(API + "/api/partnerships/school", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          school_id:SCHOOL_ID,
          partner_id:partnerId,
          academic_year_id:YEAR_ID,
          partnership_type:partnershipType || null,
          objective:partnershipObjective
        })
      });
      const json=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر حفظ الشراكة");
      setPartnershipName(""); setPartnershipType(""); setPartnershipObjective("");
      await loadPartnerships();
      setSaveMessage("تم حفظ الشراكة");
      setTimeout(()=>setSaveMessage(""),2500);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ الشراكة");
    }
  }

  async function createTwinning() {
    if(!twinningSchoolName.trim() || !twinningObjective.trim()) {
      setError("أدخل اسم المدرسة الشريكة وهدف التوأمة.");
      return;
    }
    try {
      const r=await fetch(API + "/api/partnerships/twinning", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          school_id:SCHOOL_ID,
          academic_year_id:YEAR_ID,
          partner_school_name:twinningSchoolName,
          objective:twinningObjective,
          activities:twinningActivities || null,
          status:"planned"
        })
      });
      const json=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر حفظ التوأمة");
      setTwinningSchoolName(""); setTwinningObjective(""); setTwinningActivities("");
      await loadPartnerships();
      setSaveMessage("تم حفظ التوأمة");
      setTimeout(()=>setSaveMessage(""),2500);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ التوأمة");
    }
  }

  async function analyzeTwinning(twinningId:string) {
    setAnalyzingTwinning(true);
    setError("");
    try {
      const r=await fetch(API + "/api/ai/twinning-analysis", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({twinning_id:twinningId})
      });
      const json=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر تحليل التوأمة");
      setTwinningAI(json.analysis);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر تحليل التوأمة");
    } finally {
      setAnalyzingTwinning(false);
    }
  }

  async function saveCommunityRelation() {
    if (communityRelationType === "community") {
      setPartnershipName(communityName);
      setPartnershipType(communityType);
      setPartnershipObjective(communityObjective);
      await new Promise(resolve => setTimeout(resolve, 0));
      try {
        const partnerResponse = await fetch(API + "/api/partnerships/partners", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({name:communityName, partner_type:communityType || null})
        });
        const partnerJson = await partnerResponse.json().catch(()=>({}));
        if(!partnerResponse.ok) throw new Error(partnerJson.detail || "تعذر حفظ جهة الشراكة");
        const partnerId = partnerJson.data?.id;
        if(!partnerId) throw new Error("تعذر الحصول على معرّف جهة الشراكة");
        const r = await fetch(API + "/api/partnerships/school", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({school_id:SCHOOL_ID,partner_id:partnerId,academic_year_id:YEAR_ID,partnership_type:communityType || null,objective:communityObjective})
        });
        const json = await r.json().catch(()=>({}));
        if(!r.ok) throw new Error(json.detail || "تعذر حفظ الشراكة");
        setCommunityName(""); setCommunityType(""); setCommunityObjective("");
        await loadPartnerships();
        setSaveMessage("تم حفظ الشراكة المجتمعية");
        setTimeout(()=>setSaveMessage(""),2500);
      } catch(e) {
        setError(e instanceof Error ? e.message : "تعذر حفظ الشراكة المجتمعية");
      }
      return;
    }

    if (!communityName.trim() || !communityObjective.trim()) {
      setError("أدخل اسم المدرسة الشريكة وهدف التوأمة.");
      return;
    }
    try {
      const r = await fetch(API + "/api/partnerships/twinning", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          school_id:SCHOOL_ID,
          academic_year_id:YEAR_ID,
          partner_school_name:communityName,
          objective:communityObjective,
          activities:communityActivities || null,
          status:"planned"
        })
      });
      const json = await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر حفظ التوأمة");
      setCommunityName(""); setCommunityObjective(""); setCommunityActivities("");
      await loadPartnerships();
      setSaveMessage("تم حفظ التوأمة");
      setTimeout(()=>setSaveMessage(""),2500);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ التوأمة");
    }
  }

  async function loadInnovations() {
    try {
      const r = await fetch(API + "/api/innovations/school/" + SCHOOL_ID + "/year/" + YEAR_ID);
      const json = await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر تحميل بنك الابتكار");
      setInnovations(json.data ?? []);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل بنك الابتكار");
    }
  }

  async function createInnovation() {
    if (!innovationTitle.trim() || !innovationIdea.trim()) {
      setError("اكتب اسم الفكرة ووصفها المختصر.");
      return;
    }
    try {
      const r = await fetch(API + "/api/innovations/", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          school_id:SCHOOL_ID,
          academic_year_id:YEAR_ID,
          problem_id:innovationProblemId || null,
          title:innovationTitle,
          idea:innovationIdea,
          status:"idea"
        })
      });
      const json=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر حفظ الفكرة");
      setInnovationTitle("");
      setInnovationIdea("");
      await loadInnovations();
      setSaveMessage("تم حفظ الفكرة في بنك الابتكار");
      setTimeout(()=>setSaveMessage(""),2500);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ الفكرة");
    }
  }

  async function analyzeInnovation(innovationId: string) {
    setAnalyzingInnovation(true);
    setError("");
    try {
      const r = await fetch(API + "/api/ai/innovation-analysis", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({innovation_id:innovationId})
      });
      const json=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(json.detail || "تعذر تحليل الفكرة");
      setInnovationAI(json.analysis);
    } catch(e) {
      setError(e instanceof Error ? e.message : "تعذر تحليل الفكرة");
    } finally {
      setAnalyzingInnovation(false);
    }
  }

  async function loadProblems() {
    const r = await fetch(`${API}/api/health-problems/school/${SCHOOL_ID}/year/${YEAR_ID}`);
    const json = await r.json();
    const data = json.data ?? [];
    setProblems(data);
    const scores: Record<string, string> = {};
    const rationales: Record<string, string> = {};
    for (const problem of data) {
      if (problem.priority_score !== null && problem.priority_score !== undefined) {
        scores[problem.id] = String(problem.priority_score);
      }
      if (problem.priority_rationale) {
        rationales[problem.id] = problem.priority_rationale;
      }
    }
    setPriorityScore(scores);
    setPriorityJustification(rationales);
  }

  async function saveProblemPriority(problemId: string) {
    const score = Number(priorityScore[problemId] ?? "");
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      setError("درجة الأولوية يجب أن تكون بين 0 و100");
      return;
    }
    setSavingPriority((v) => ({ ...v, [problemId]: true }));
    setError("");
    try {
      const r = await fetch(API + "/api/health-problems/priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ health_problem_id: problemId, priority_score: score, justification: priorityJustification[problemId] || null }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.detail || "تعذر حفظ الأولوية");
      await loadProblems();
      setSaveMessage("تم حفظ أولوية المشكلة");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ الأولوية");
    } finally {
      setSavingPriority((v) => ({ ...v, [problemId]: false }));
    }
  }

  async function deleteProblem(problemId: string, title: string) {
    if (!window.confirm(`هل أنت متأكد من حذف المشكلة الصحية «${title}»؟\nسيتم حذف المشكلة وأولويتها فقط، ولا يمكن التراجع عن الحذف.`)) return;
    setError("");
    try {
      const r = await fetch(`${API}/api/health-problems/${problemId}`, { method: "DELETE" });
      const json = await r.json();
      if (!r.ok) throw new Error(json.detail || "تعذر حذف المشكلة");
      await loadProblems();
      setSaveMessage("تم حذف المشكلة الصحية");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حذف المشكلة");
    }
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

  async function deleteEvidence(ev: any, itemId: string) {
    if (!window.confirm("هل أنت متأكد من حذف هذا الشاهد؟ لا يمكن التراجع عن الحذف.")) return;
    try {
      const response = await fetch(API + "/api/evidence/" + ev.id, { method: "DELETE" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.detail || "تعذر حذف الشاهد");
      await loadItemEvidence(itemId);
      setSaveMessage("تم حذف الشاهد بنجاح");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حذف الشاهد");
    }
  }

  async function loadItemEvidence(itemId: string) {
    try {
      const response = await fetch(API + "/api/evidence/item/" + itemId);
      const json = await response.json();
      if (!response.ok) throw new Error(json.detail || "تعذر جلب الشواهد");
      const data = json.data ?? [];
      setItemEvidence((v) => ({ ...v, [itemId]: data }));
      setEvidenceCount((v) => ({ ...v, [itemId]: data.length }));
      setShowEvidenceFor(itemId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر جلب الشواهد");
    }
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

      await loadItemEvidence(item.id);
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
              <div className="text-xs text-slate-500">{authContext.role_names?.[0] || "عضو الفريق"} • 2026 / 2027</div>
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
                  {selected ? `${selected.code} - ${selected.name}` : "التقييم"}
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
              <button onClick={()=>{setShowCompetition(!showCompetition); if(!showCompetition) loadCompetition();}} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><ShieldCheck size={17}/> وضع المسابقة</button>
              <button onClick={()=>{setShowEvidenceHub(!showEvidenceHub); if(!showEvidenceHub) loadEvidenceHub();}} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><FileUp size={17}/> الأدلة</button>
              <button onClick={()=>{setShowAI(!showAI); if(!showAI) loadAI();}} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><HeartPulse size={17}/> المساعد الذكي</button><button
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
              <button onClick={()=>{setShowInnovations(!showInnovations); if (!showInnovations) loadInnovations();}} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><Activity size={17}/> بنك الابتكار</button>
              <button onClick={()=>{setShowPartnerships(!showPartnerships); if (!showPartnerships) loadPartnerships();}} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-bold"><Users size={17}/> الشراكات والتوأمة</button>

            </div>
          </div>

          {showAI && aiSummary && (
            <div className="mb-4 rounded-2xl border-2 border-violet-200 bg-gradient-to-l from-violet-50 to-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-extrabold">مساعد صِحّة الذكي</h3><p className="text-xs text-slate-500">تحليل مبني على البيانات المسجلة في المنصة.</p></div><button onClick={loadAI} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white">تحليل جديد</button></div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl bg-white p-3 text-center"><b>{aiSummary.evaluation?.percentage??0}%</b><div className="text-xs text-slate-500">التقييم</div></div>
                <div className="rounded-xl bg-white p-3 text-center"><b>{aiSummary.problems_count}</b><div className="text-xs text-slate-500">المشكلات</div></div>
                <div className="rounded-xl bg-white p-3 text-center"><b>{aiSummary.plans_count}</b><div className="text-xs text-slate-500">الخطط</div></div>
                <div className="rounded-xl bg-white p-3 text-center"><b>{aiSummary.innovations_count}</b><div className="text-xs text-slate-500">الابتكارات</div></div>
              </div>
              <div className="mt-4 rounded-xl border bg-white p-4"><b>أسئلة التحسين</b>{(aiSummary.questions??[]).map((q:string,i:number)=><div key={i} className="mt-2 text-sm">• {q}</div>)}</div>
              <div className="mt-3 text-xs text-slate-500">{aiSummary.note}</div>
            </div>
          )}

          {showEvidenceHub && (
            <div className="mb-4 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-extrabold">مستودع الأدلة والشواهد</h3><p className="text-xs text-slate-500">جميع الشواهد المرفوعة في مكان واحد.</p></div><button onClick={loadEvidenceHub} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">تحديث</button></div>
              <div className="mb-3 rounded-xl bg-slate-50 p-3 text-sm font-bold">إجمالي الشواهد: {allEvidence.length}</div>
              <div className="grid gap-2">
                {allEvidence.map((ev:any)=><div key={ev.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div><div className="font-bold">{ev.title}</div><div className="text-xs text-slate-500">{ev.original_file_name || "ملف"} • {ev.mime_type || "غير محدد"}</div></div>
                  <div className="flex flex-wrap items-center gap-2">
                    {ev.signed_url && <a href={ev.signed_url} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">فتح الشاهد</a>}
                    <select value={evidenceTarget[ev.id]||""} onChange={e=>setEvidenceTarget(v=>({...v,[ev.id]:e.target.value}))} className="rounded-lg border px-2 py-1 text-xs">
                      <option value="">ربط بـ...</option><option value="problem_id">مشكلة</option><option value="health_plan_id">خطة</option><option value="objective_id">هدف</option><option value="activity_id">نشاط</option><option value="result_id">نتيجة</option><option value="impact_measurement_id">أثر</option>
                    </select>
                    <input value={evidenceTargetId[ev.id]||""} onChange={e=>setEvidenceTargetId(v=>({...v,[ev.id]:e.target.value}))} placeholder="معرّف العنصر" className="w-32 rounded-lg border px-2 py-1 text-xs"/>
                    <button onClick={()=>linkHubEvidence(ev.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white">ربط</button>
                  </div>
                </div>)}
                {!allEvidence.length && <div className="p-6 text-center text-sm text-slate-500">لا توجد شواهد مرفوعة بعد.</div>}
              </div>
            </div>
          )}

          {showCompetition && competition && (
            <div className="mb-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-l from-blue-50 via-white to-emerald-50 p-5 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-[#102a56]">وضع المسابقة</h3>
                  <p className="mt-1 text-xs text-slate-500">لوحة جاهزية ملف المدرسة: التقييم، الشواهد، الخطط، التنفيذ، الابتكار والشراكات.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={loadCompetition} className="rounded-xl border bg-white px-4 py-2 text-xs font-bold text-slate-700">تحديث البيانات</button>
                  <button onClick={analyzeCompetitionReadiness} disabled={analyzingCompetition} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                    {analyzingCompetition ? "جاري تحليل الجاهزية..." : "تحليل الجاهزية بالذكاء الاصطناعي"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-blue-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-500">مؤشر جاهزية الملف <span className="font-normal">(داخلي للمنصة)</span></div>
                    <div className="mt-1 text-3xl font-extrabold text-blue-700">{competition.metrics?.overall_readiness ?? 0}%</div>
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                      <span>اكتمال الملف</span>
                      <span>{competition.metrics?.overall_readiness ?? 0}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: Math.min(Number(competition.metrics?.overall_readiness ?? 0), 100) + "%" }} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-600">
                  الدرجة الرسمية للتقييم منفصلة عن مؤشر الجاهزية. المؤشر هنا يقرأ اكتمال الملف التشغيلي والوثائقي فقط.
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["اكتمال التقييم", competition.metrics?.evaluation_completion ?? 0, (competition.evaluation?.completed_items ?? 0) + " / " + (competition.evaluation?.total_items ?? 0) + " بند"],
                  ["تغطية الشواهد", competition.metrics?.evidence_coverage ?? 0, (competition.counts?.evidence ?? 0) + " شاهد موثق"],
                  ["اكتمال الخطط", competition.metrics?.plan_completion ?? 0, (competition.counts?.plans ?? 0) + " خطة"],
                  ["تنفيذ الأنشطة", competition.metrics?.execution ?? 0, (competition.counts?.activities ?? 0) + " نشاط"],
                  ["توثيق الأنشطة", competition.metrics?.activity_documentation ?? 0, "أنشطة مرتبطة بشواهد"],
                  ["الابتكار والشراكة", competition.metrics?.innovation_partnership ?? 0, (competition.counts?.innovations ?? 0) + " ابتكار • " + ((competition.counts?.partnerships ?? 0) + (competition.counts?.twinning ?? 0)) + " شراكة/توأمة"],
                ].map(([label, value, note]) => (
                  <div key={String(label)} className="rounded-2xl border bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-extrabold text-slate-700">{label}</span>
                      <span className="text-lg font-extrabold text-blue-700">{value}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: String(Math.min(Number(value ?? 0), 100)) + "%" }} />
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">{note}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <b>الصورة التشغيلية</b>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">{competition.counts?.problems ?? 0} مشكلة</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {(competition.problems ?? []).slice(0, 5).map((p:any) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                        <span className="font-bold">{p.title}</span>
                        <span className="text-xs text-slate-500">{p.priority_level === "high" ? "أولوية عالية" : p.priority_level === "low" ? "أولوية منخفضة" : "أولوية متوسطة"}</span>
                      </div>
                    ))}
                    {!competition.problems?.length && <div className="py-4 text-center text-xs text-slate-400">لا توجد مشكلات مسجلة بعد.</div>}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <b>أبرز الخطط</b>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">{competition.counts?.plans ?? 0} خطة</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {(competition.plans ?? []).slice(0, 5).map((p:any) => (
                      <div key={p.id} className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold">{p.title}</span>
                          <span className="text-blue-700 font-extrabold">{p.completion ?? 0}%</span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {p.objectives_count ?? 0} أهداف • {p.activities_count ?? 0} أنشطة • {p.documented_activities ?? 0} موثق
                        </div>
                      </div>
                    ))}
                    {!competition.plans?.length && <div className="py-4 text-center text-xs text-slate-400">لا توجد خطط مسجلة بعد.</div>}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <b>الابتكار والشراكة المجتمعية</b>
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">{(competition.counts?.innovations ?? 0) + (competition.counts?.partnerships ?? 0) + (competition.counts?.twinning ?? 0)} سجل</span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {(competition.innovations ?? []).slice(0, 4).map((i:any) => (
                    <div key={i.id} className="rounded-xl bg-violet-50/60 px-3 py-2">
                      <div className="font-bold">{i.title}</div>
                      <div className="text-xs text-slate-500">ابتكار صحي</div>
                    </div>
                  ))}
                  {(competition.partnerships ?? []).slice(0, 4).map((p:any) => (
                    <div key={p.id} className="rounded-xl bg-emerald-50 px-3 py-2">
                      <div className="font-bold">{p.partners?.name ?? "شراكة مجتمعية"}</div>
                      <div className="text-xs text-slate-500">{p.objective || "هدف الشراكة غير مدخل"}</div>
                    </div>
                  ))}
                  {(competition.twinning ?? []).slice(0, 4).map((t:any) => (
                    <div key={t.id} className="rounded-xl bg-blue-50 px-3 py-2">
                      <div className="font-bold">{t.partner_school_name}</div>
                      <div className="text-xs text-slate-500">{t.objective || "هدف التوأمة غير مدخل"}</div>
                    </div>
                  ))}
                  {!competition.innovations?.length && !competition.partnerships?.length && !competition.twinning?.length && (
                    <div className="md:col-span-2 py-4 text-center text-xs text-slate-400">لا توجد ابتكارات أو شراكات موثقة بعد.</div>
                  )}
                </div>
              </div>

              {competitionAI && (
                <div className="mt-4 rounded-2xl border-2 border-violet-200 bg-violet-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-violet-900">قراءة ذكية لجاهزية الملف</h4>
                      <p className="mt-1 text-xs text-slate-600">تحليل وصفي مبني على البيانات والشواهد المسجلة فقط.</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-4">
                    <div className="text-sm font-extrabold text-violet-800">الخلاصة</div>
                    <div className="mt-1 text-sm leading-7 text-slate-700">{competitionAI.summary}</div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-white p-4">
                      <div className="text-sm font-extrabold text-emerald-700">نقاط القوة</div>
                      {(competitionAI.strengths ?? []).map((x:string,i:number)=><div key={i} className="mt-2 text-xs leading-6">• {x}</div>)}
                    </div>
                    <div className="rounded-xl bg-white p-4">
                      <div className="text-sm font-extrabold text-amber-700">الفجوات</div>
                      {(competitionAI.gaps ?? []).map((x:string,i:number)=><div key={i} className="mt-2 text-xs leading-6">• {x}</div>)}
                    </div>
                    <div className="rounded-xl bg-white p-4">
                      <div className="text-sm font-extrabold text-red-700">فجوات الأدلة</div>
                      {(competitionAI.evidence_gaps ?? []).map((x:string,i:number)=><div key={i} className="mt-2 text-xs leading-6">• {x}</div>)}
                    </div>
                    <div className="rounded-xl bg-white p-4">
                      <div className="text-sm font-extrabold text-blue-700">فجوات الخطط والتنفيذ</div>
                      {(competitionAI.plan_gaps ?? []).map((x:string,i:number)=><div key={i} className="mt-2 text-xs leading-6">• {x}</div>)}
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl bg-white p-4">
                    <div className="mb-2 text-sm font-extrabold text-slate-800">الإجراءات ذات الأولوية</div>
                    {(competitionAI.immediate_actions ?? []).map((x:string,i:number)=><div key={i} className="mt-2 text-xs font-bold text-slate-700">{i+1}. {x}</div>)}
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="mb-2 font-extrabold text-[#102a56]">ملاحظات القراءة</div>
                {(competition.notes ?? []).map((note:string, index:number) => (
                  <div key={index} className="mt-1 text-xs leading-6 text-slate-600">• {note}</div>
                ))}
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
                  <div key={p.id} className={`rounded-xl p-3 ${selectedPlanId===p.id ? "bg-blue-50 border border-blue-300" : "bg-slate-50"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={()=>loadPlanDetails(p.id)} className="min-w-0 flex-1 text-right">
                        <div className="font-bold">{p.title}</div>
                        <div className="text-xs text-slate-500">{p.main_goal}</div>
                      </button>
                      {authContext.can_manage && <button
                        onClick={()=>deletePlan(p.id,p.title)}
                        className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                      >
                        حذف
                      </button>}
                    </div>
                  </div>
                ))}
              </div>
              {selectedPlanId && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-slate-800">الخطة التنفيذية</h4>
                      <p className="mt-1 text-xs text-slate-500">يظهر كل نشاط في صف واحد مرتبطًا بالهدف والمنفذين والتاريخ والمجالات والشواهد.</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{activities.length} نشاط</span>
                  </div>

                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h5 className="font-extrabold text-slate-800">1. الأهداف التفصيلية</h5>
                        <p className="mt-1 text-xs text-slate-500">أضف الهدف أولًا، ثم اختر الهدف المراد تنفيذ الأنشطة المرتبطة به.</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{objectives.length} هدف</span>
                    </div>
                    <div className="flex gap-2">
                      <input value={objectiveTitle} onChange={e=>setObjectiveTitle(e.target.value)} placeholder="الهدف التفصيلي" className="min-w-0 flex-1 rounded-xl border bg-white px-3 py-2" />
                      <button onClick={createObjective} className="rounded-xl bg-emerald-600 px-4 font-bold text-white">إضافة الهدف</button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {objectives.map((o:any,i:number)=>(
                        <button
                          key={o.id}
                          type="button"
                          onClick={()=>setSelectedObjectiveForActivity(o.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-right transition ${selectedObjectiveForActivity===o.id ? "border-blue-300 bg-blue-50 ring-1 ring-blue-100" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                        >
                          <span className="font-bold text-slate-800">{i+1}. {o.title}</span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${selectedObjectiveForActivity===o.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {selectedObjectiveForActivity===o.id ? "الهدف المحدد للنشاط" : "اختيار الهدف"}
                          </span>
                        </button>
                      ))}
                      {!objectives.length && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-400">أضف هدفًا تفصيليًا أولًا.</div>}
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h5 className="font-extrabold text-blue-900">2. إضافة الأنشطة والفعاليات</h5>
                        <p className="mt-1 text-xs text-slate-500">الأنشطة التالية ستُحفظ تحت الهدف المحدد أعلاه.</p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                        الهدف الحالي: {objectives.find((o:any)=>o.id===selectedObjectiveForActivity)?.title || "لم يتم اختيار هدف"}
                      </div>
                    </div>
                    <div className="grid gap-2 lg:grid-cols-[1.1fr_1fr_1fr_1fr_115px]">
                      <input
                        value={activityTitle}
                        onChange={e=>setActivityTitle(e.target.value)}
                        placeholder="اسم النشاط / الفعالية"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                      />
                      <input
                        value={activityResponsible}
                        onChange={e=>setActivityResponsible(e.target.value)}
                        placeholder="المنفذون"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                      />
                      <input type="date" aria-label="تاريخ التنفيذ" title="تاريخ التنفيذ" value={activityStart} onChange={e=>setActivityStart(e.target.value)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                      <input type="date" aria-label="تاريخ الانتهاء" title="تاريخ الانتهاء" value={activityEnd} onChange={e=>setActivityEnd(e.target.value)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5" />
                      <button onClick={createActivity} className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700">
                        إضافة
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[1180px] border-collapse text-right">
                      <thead className="bg-slate-100">
                        <tr className="text-xs font-extrabold text-slate-700">
                          <th className="border-b px-3 py-3">الأهداف التفصيلية</th>
                          <th className="border-b px-3 py-3">الأنشطة</th>
                          <th className="border-b px-3 py-3">المنفذون</th>
                          <th className="border-b px-3 py-3">تاريخ التنفيذ</th>
                          <th className="border-b px-3 py-3">المجالات المرتبطة</th>
                          <th className="border-b px-3 py-3">الأدلة المختارة</th>
                          <th className="border-b px-3 py-3 text-center">الإنجاز</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {activities.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                              لا توجد أنشطة محفوظة لهذه الخطة.
                            </td>
                          </tr>
                        ) : activities.map((a:any) => {
                          const evidence = activityEvidence[a.id] || [];
                          const linkedComponents = activityComponents[a.id] || [];
                          const objective = objectives.find((o:any)=>o.id === a.objective_id);
                          const formatDate = (value: string | null | undefined) =>
                            value ? new Date(value + "T00:00:00").toLocaleDateString("ar-OM") : "غير محدد";

                          return (
                            <tr key={a.id} className="align-top hover:bg-slate-50/70">
                              <td className="px-3 py-4">
                                <div className="min-w-[220px]">
                                  <select
                                    value={a.objective_id || ""}
                                    onChange={e=>updateActivityObjective(a.id,e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                                  >
                                    <option value="">اختر الهدف التفصيلي</option>
                                    {objectives.map((o:any)=><option key={o.id} value={o.id}>{o.title}</option>)}
                                  </select>
                                  {!a.objective_id && <div className="mt-1 text-[10px] font-bold text-amber-600">يجب ربط النشاط بهدف</div>}
                                </div>
                              </td>
                              <td className="px-3 py-4">
                                <div className="min-w-[160px] font-extrabold text-blue-700">{a.title}</div>
                              </td>
                              <td className="px-3 py-4">
                                <div className="min-w-[130px] font-bold text-slate-700">{a.responsible_person || "غير محدد"}</div>
                              </td>
                              <td className="px-3 py-4">
                                <div className="min-w-[150px] text-sm font-bold text-slate-700">
                                  {formatDate(a.start_date)}
                                  <span className="mx-1 text-blue-500">→</span>
                                  {formatDate(a.end_date)}
                                </div>
                              </td>
                              <td className="relative px-3 py-4">
                                <div className="min-w-[250px]">
                                  <button
                                    type="button"
                                    onClick={()=>setOpenActivityComponents(v=>v===a.id ? null : a.id)}
                                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-right text-sm font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                  >
                                    <span className={linkedComponents.length ? "text-blue-700" : "text-slate-400"}>
                                      {linkedComponents.length
                                        ? `${linkedComponents.length} مجال محدد`
                                        : "اختر المجالات المرتبطة"}
                                    </span>
                                    <span className="text-slate-400">▼</span>
                                  </button>
                                  {openActivityComponents === a.id && (
                                    <div className="absolute right-3 top-[calc(100%-4px)] z-30 w-[320px] max-w-[calc(100vw-40px)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                                      <div className="mb-2 text-xs font-extrabold text-slate-600">اختر مجالًا أو أكثر</div>
                                      <div className="max-h-64 space-y-1 overflow-y-auto">
                                        {components.map(c=>{
                                          const active = linkedComponents.includes(c.id);
                                          return (
                                            <label key={c.id} className="flex cursor-pointer items-start gap-2 rounded-xl px-2 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50">
                                              <input
                                                type="checkbox"
                                                checked={active}
                                                onChange={()=>{
                                                  const ids = new Set(linkedComponents);
                                                  active ? ids.delete(c.id) : ids.add(c.id);
                                                  linkActivityComponents(a.id,[...ids]);
                                                }}
                                                className="mt-0.5 h-4 w-4 accent-blue-600"
                                              />
                                              <span>{c.name}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={()=>setOpenActivityComponents(null)}
                                        className="mt-2 w-full rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                                      >
                                        تم
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {linkedComponents.map((id:string)=>{
                                    const c = components.find(x=>x.id===id);
                                    return c ? <span key={id} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{c.name}</span> : null;
                                  })}
                                </div>
                              </td>
                              <td className="px-3 py-4">
                                <div className="min-w-[220px]">
                                  <button
                                    type="button"
                                    onClick={()=>openActivityEvidencePicker(a.id)}
                                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-right text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                  >
                                    <span>{evidence.length ? `✓ ${evidence.length} شاهد مرتبط` : "اختيار الأدلة"}</span>
                                    <span>▼</span>
                                  </button>
                                  <div className="mt-2 space-y-1.5">
                                    {evidence.length ? evidence.map((ev:any)=>(
                                      <div key={ev.id} className="truncate rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-600" title={ev.title}>
                                        ✓ {ev.title}
                                      </div>
                                    )) : <div className="text-[10px] text-slate-400">لا توجد أدلة مرتبطة</div>}
                                  </div>
                                  {openActivityEvidence === a.id && (
                                    <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                                      <div className="mb-2 text-xs font-extrabold text-slate-700">اختر الشواهد من مستودع الأدلة</div>
                                      <div className="max-h-56 space-y-1 overflow-y-auto">
                                        {allEvidence.length ? allEvidence.map((ev:any)=>{
                                          const linked = evidence.some((x:any)=>x.id===ev.id);
                                          return (
                                            <label key={ev.id} className="flex items-start gap-2 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-700 hover:bg-emerald-50">
                                              <input
                                                type="checkbox"
                                                checked={linked}
                                                disabled={linked}
                                                onChange={()=>linkEvidenceToActivity(a.id,ev.id)}
                                                className="mt-0.5 h-4 w-4 accent-emerald-600"
                                              />
                                              <span className="min-w-0 flex-1">{ev.title || ev.original_file_name}</span>
                                              {linked && <span className="shrink-0 text-emerald-600">مرتبط</span>}
                                            </label>
                                          );
                                        }) : <div className="py-4 text-center text-[11px] text-slate-400">لا توجد شواهد في المستودع.</div>}
                                      </div>
                                      <button type="button" onClick={()=>setOpenActivityEvidence(null)} className="mt-2 w-full rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">تم</button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-4 text-center">
                                <div className="min-w-[70px] font-extrabold text-blue-700">{a.completion_percentage ?? 0}%</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {selectedPlanId && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={()=>loadPlanDetails(selectedPlanId)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        تحديث بيانات الجدول
                      </button>
                    </div>
                  )}

                  <div className="mt-5 rounded-2xl border-2 border-violet-200 bg-gradient-to-l from-violet-50 to-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-violet-900">3. التحليل الذكي للخطة</h4>
                        <p className="mt-1 text-xs text-slate-600">حلّل الخطة والأنشطة والأدلة المسجلة، واستخلص النتائج والأثر ومجالات التحسين دون إدخال يدوي إضافي.</p>
                      </div>
                      <button
                        type="button"
                        onClick={analyzeSelectedPlan}
                        disabled={analyzingPlan}
                        className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {analyzingPlan ? "جاري التحليل..." : "تحليل الخطة بالذكاء الاصطناعي"}
                      </button>
                    </div>

                    {planAI && (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-xl bg-white p-4">
                          <div className="mb-1 text-xs font-extrabold text-violet-700">الخلاصة</div>
                          <div className="text-sm font-bold leading-7 text-slate-700">{planAI.summary || "لا توجد خلاصة كافية من البيانات الحالية."}</div>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-2">
                          <div className="rounded-xl bg-white p-4">
                            <div className="mb-2 text-xs font-extrabold text-slate-700">تحليل الأهداف</div>
                            <div className="space-y-2">
                              {(planAI.objective_analysis || []).map((x:any,i:number)=>(
                                <div key={i} className="rounded-lg bg-slate-50 p-3 text-xs">
                                  <div className="font-bold text-slate-800">{x.objective}</div>
                                  <div className="mt-1 text-slate-600">{x.note}</div>
                                </div>
                              ))}
                              {!(planAI.objective_analysis || []).length && <div className="text-xs text-slate-400">لا توجد أهداف كافية للتحليل.</div>}
                            </div>
                          </div>

                          <div className="rounded-xl bg-white p-4">
                            <div className="mb-2 text-xs font-extrabold text-slate-700">تحليل الأدلة</div>
                            <div className="space-y-2">
                              {(planAI.evidence_analysis || []).map((x:any,i:number)=>(
                                <div key={i} className="rounded-lg bg-slate-50 p-3 text-xs">
                                  <div className="font-bold text-slate-800">{x.activity}</div>
                                  <div className="mt-1 text-slate-600">عدد الشواهد: {x.evidence_count ?? 0} — {x.assessment}</div>
                                </div>
                              ))}
                              {!(planAI.evidence_analysis || []).length && <div className="text-xs text-slate-400">لا توجد شواهد مرتبطة بالأنشطة حتى الآن.</div>}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white p-4">
                          <div className="mb-2 text-xs font-extrabold text-slate-700">النتائج المستخلصة</div>
                          <div className="space-y-2">
                            {(planAI.inferred_results || []).map((x:any,i:number)=>(
                              <div key={i} className="rounded-lg bg-slate-50 p-3 text-xs">
                                <div className="font-bold text-slate-800">{x.statement}</div>
                                <div className="mt-1 text-slate-600">الأساس: {x.basis} — درجة الثقة: {x.confidence}</div>
                              </div>
                            ))}
                            {!(planAI.inferred_results || []).length && <div className="text-xs text-slate-400">لا توجد نتائج يمكن استخلاصها من الأدلة الحالية.</div>}
                          </div>
                        </div>

                        <div className="rounded-xl bg-white p-4">
                          <div className="mb-1 text-xs font-extrabold text-emerald-700">الأثر</div>
                          <div className="text-sm font-bold leading-7 text-slate-700">{planAI.impact_assessment || "لا تكفي البيانات الحالية للحكم على الأثر."}</div>
                        </div>

                        <div className="rounded-xl bg-white p-4">
                          <div className="mb-2 text-xs font-extrabold text-slate-700">إجراءات التحسين المقترحة</div>
                          <div className="space-y-2">
                            {(planAI.improvement_actions || []).map((x:string,i:number)=><div key={i} className="rounded-lg bg-amber-50 p-3 text-xs font-bold text-slate-700">• {x}</div>)}
                            {!(planAI.improvement_actions || []).length && <div className="text-xs text-slate-400">لا توجد إجراءات مقترحة إضافية من البيانات الحالية.</div>}
                          </div>
                        </div>

                        <div className="text-[11px] font-bold text-violet-700">التحليل مبني على البيانات والشواهد المسجلة فقط، ولا يستبدل حكم فريق المدرسة.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {showPartnerships && (
            <div className="mb-4 rounded-2xl border-2 border-cyan-200 bg-gradient-to-l from-cyan-50 to-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-cyan-900">الشراكة المجتمعية</h3>
                  <p className="text-xs text-slate-600">الشراكة والتوأمة في سجل واحد، مع اختلاف النوع فقط. يسجل الفريق الأساسيات، ويمكن للذكاء الاصطناعي تحليل القيمة والأثر لاحقًا.</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-cyan-700">{partnerships.length + twinning.length} شراكة مجتمعية</span>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white p-4">
                <div className="grid gap-2 lg:grid-cols-[180px_1fr_1fr_1.4fr_1fr_auto]">
                  <select value={communityRelationType} onChange={e=>setCommunityRelationType(e.target.value as "community"|"twinning")} className="rounded-xl border px-3 py-2.5">
                    <option value="community">شراكة مجتمعية</option>
                    <option value="twinning">توأمة مدرسية</option>
                  </select>
                  <input value={communityName} onChange={e=>setCommunityName(e.target.value)} placeholder={communityRelationType==="twinning" ? "اسم المدرسة الشريكة" : "اسم جهة الشراكة"} className="rounded-xl border px-3 py-2.5" />
                  {communityRelationType==="community" ? (
                    <input value={communityType} onChange={e=>setCommunityType(e.target.value)} placeholder="نوع الشراكة (اختياري)" className="rounded-xl border px-3 py-2.5" />
                  ) : (
                    <input value={communityActivities} onChange={e=>setCommunityActivities(e.target.value)} placeholder="الأنشطة المشتركة (اختياري)" className="rounded-xl border px-3 py-2.5" />
                  )}
                  <input value={communityObjective} onChange={e=>setCommunityObjective(e.target.value)} placeholder={communityRelationType==="twinning" ? "هدف التوأمة" : "هدف الشراكة"} className="rounded-xl border px-3 py-2.5" />
                  <div className="rounded-xl bg-cyan-50 px-3 py-2.5 text-xs font-bold text-cyan-800">
                    {communityRelationType==="twinning" ? "مدرسة ↔ مدرسة" : "المدرسة ↔ جهة مجتمعية"}
                  </div>
                  <button onClick={saveCommunityRelation} className="rounded-xl bg-cyan-600 px-5 py-2.5 font-bold text-white">
                    إضافة
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[900px] border-collapse text-right">
                  <thead className="bg-slate-100">
                    <tr className="text-xs font-extrabold text-slate-700">
                      <th className="border-b px-3 py-3">النوع</th>
                      <th className="border-b px-3 py-3">الجهة / المدرسة الشريكة</th>
                      <th className="border-b px-3 py-3">هدف الشراكة</th>
                      <th className="border-b px-3 py-3">الأنشطة / مجالات التعاون</th>
                      <th className="border-b px-3 py-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ...partnerships.map((p:any)=>({
                        id:"p-"+p.id,type:"شراكة مجتمعية",name:p.partners?.name || "جهة شريكة",
                        objective:p.objective || "—",activities:p.joint_activities || "—",
                        status:p.status || "active"
                      })),
                      ...twinning.map((t:any)=>({
                        id:"t-"+t.id,type:"توأمة مدرسية",name:t.partner_school_name,
                        objective:t.objective || "—",activities:t.activities || "—",
                        status:t.status || "planned"
                      }))
                    ].map((row:any)=>(
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">{row.type}</span>
                        </td>
                        <td className="px-3 py-3 font-extrabold text-slate-800">{row.name}</td>
                        <td className="px-3 py-3 text-sm font-bold text-slate-700">{row.objective}</td>
                        <td className="px-3 py-3 text-sm text-slate-600">{row.activities}</td>
                        <td className="px-3 py-3 text-xs font-bold text-slate-500">{row.status}</td>
                      </tr>
                    ))}
                    {!partnerships.length && !twinning.length && (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400">لا توجد شراكات مجتمعية مسجلة بعد.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showInnovations && (
            <div className="mb-4 rounded-2xl border-2 border-amber-200 bg-gradient-to-l from-amber-50 to-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-amber-900">بنك الابتكار الصحي</h3>
                  <p className="text-xs text-slate-600">يسجل الفريق الفكرة فقط، ويقوم الذكاء الاصطناعي بتحليل الأثر والتوسع والاستدامة.</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700">{innovations.length} فكرة</span>
              </div>
              <div className="grid gap-2 lg:grid-cols-[1fr_1.4fr_1fr_auto]">
                <input value={innovationTitle} onChange={e=>setInnovationTitle(e.target.value)} placeholder="اسم الفكرة / الابتكار" className="rounded-xl border bg-white px-3 py-2.5" />
                <input value={innovationIdea} onChange={e=>setInnovationIdea(e.target.value)} placeholder="وصف مختصر للفكرة" className="rounded-xl border bg-white px-3 py-2.5" />
                <select value={innovationProblemId} onChange={e=>setInnovationProblemId(e.target.value)} className="rounded-xl border bg-white px-3 py-2.5">
                  <option value="">ربط بالمشكلة الصحية (اختياري)</option>
                  {problems.map((p:any)=><option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <button onClick={createInnovation} className="rounded-xl bg-amber-600 px-5 py-2.5 font-bold text-white">حفظ الفكرة</button>
              </div>
              <div className="mt-4 space-y-2">
                {innovations.map((i:any)=>(
                  <div key={i.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-slate-800">{i.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{i.idea}</div>
                      </div>
                      <button onClick={()=>analyzeInnovation(i.id)} disabled={analyzingInnovation} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                        {analyzingInnovation ? "جاري التحليل..." : "تحليل ذكي"}
                      </button>
                    </div>
                  </div>
                ))}
                {!innovations.length && <div className="py-5 text-center text-xs text-slate-400">لا توجد أفكار مسجلة بعد.</div>}
              </div>
              {innovationAI && (
                <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl bg-white p-3"><div className="text-xs font-extrabold text-violet-700">الملخص</div><div className="mt-1 text-sm font-bold leading-7">{innovationAI.summary}</div></div>
                    <div className="rounded-xl bg-white p-3"><div className="text-xs font-extrabold text-violet-700">الأثر المتوقع</div><div className="mt-1 text-sm font-bold leading-7">{innovationAI.impact}</div></div>
                    <div className="rounded-xl bg-white p-3"><div className="text-xs font-extrabold text-violet-700">إمكانات التوسع</div><div className="mt-1 text-sm font-bold leading-7">{innovationAI.scalability}</div></div>
                    <div className="rounded-xl bg-white p-3"><div className="text-xs font-extrabold text-violet-700">الاستدامة</div><div className="mt-1 text-sm font-bold leading-7">{innovationAI.sustainability}</div></div>
                  </div>
                  <div className="mt-3 rounded-xl bg-white p-3">
                    <div className="mb-2 text-xs font-extrabold text-slate-700">خطوات مقترحة</div>
                    {(innovationAI.actions || []).map((x:string,i:number)=><div key={i} className="mt-1 text-xs font-bold text-slate-700">• {x}</div>)}
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
                  <div key={p.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0"><div className="font-bold">{p.title}</div><div className="text-xs text-slate-500">{p.description || "لا يوجد وصف"}</div></div>
                        {authContext.can_manage && <button onClick={()=>deleteProblem(p.id, p.title)} className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">حذف</button>}
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.priority_level === "high" ? "bg-red-50 text-red-700" : p.priority_level === "low" ? "bg-slate-100 text-slate-700" : "bg-amber-50 text-amber-700"}`}>
                        {p.priority_level === "high" ? "أولوية عالية" : p.priority_level === "low" ? "أولوية منخفضة" : "أولوية متوسطة"}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-[180px_1fr_auto]">
                      <input type="number" min="0" max="100" value={priorityScore[p.id] ?? ""} onChange={(e)=>setPriorityScore(v=>({...v,[p.id]:e.target.value}))} placeholder="درجة الأولوية 0-100" className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500" />
                      <input value={priorityJustification[p.id] ?? ""} onChange={(e)=>setPriorityJustification(v=>({...v,[p.id]:e.target.value}))} placeholder="مبررات تحديد الأولوية" className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-500" />
                      <button onClick={()=>saveProblemPriority(p.id)} disabled={savingPriority[p.id]} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                        {savingPriority[p.id] ? "جاري الحفظ..." : "حفظ الأولوية"}
                      </button>
                    </div>
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
                        <div className="mb-2">
                          <button
                            type="button"
                            onClick={() => loadItemEvidence(item.id)}
                            className="text-xs font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                          >
                            {evidenceCount[item.id]} شاهد مرفوع — اضغط للعرض
                          </button>
                          {showEvidenceFor === item.id && (
                            <div className="mt-2 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                              {(itemEvidence[item.id] ?? []).map((ev) => (
                                <div key={ev.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs">
                                  <div className="min-w-0">
                                    <div className="truncate font-bold text-slate-700">{ev.original_file_name || ev.title}</div>
                                    <div className="text-slate-400">{ev.created_at ? new Date(ev.created_at).toLocaleString("ar-OM") : ""}</div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    {ev.signed_url ? (
                                      <a
                                        href={ev.signed_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white"
                                      >
                                        فتح الشاهد
                                      </a>
                                    ) : (
                                      <span className="text-slate-400">الرابط غير متاح</span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => deleteEvidence(ev, item.id)}
                                      className="rounded-lg bg-red-50 px-3 py-1.5 font-bold text-red-700 hover:bg-red-100"
                                    >
                                      حذف
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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
          <h3 className="px-2 py-3 text-xl font-extrabold">مركز المنصة</h3>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button onClick={()=>{setShowDashboard(true);loadDashboard();}} className="rounded-xl bg-blue-50 p-2 text-xs font-bold text-blue-700">الرئيسية</button>
            <button onClick={()=>{setShowReport(true);loadReport();}} className="rounded-xl bg-emerald-50 p-2 text-xs font-bold text-emerald-700">التقارير</button>
            <button onClick={()=>{setShowProblems(true);loadProblems();}} className="rounded-xl bg-amber-50 p-2 text-xs font-bold text-amber-700">المشكلات</button>
            <button onClick={()=>{setShowPlans(true);loadPlans();loadProblems();}} className="rounded-xl bg-violet-50 p-2 text-xs font-bold text-violet-700">الخطط</button>
            <button onClick={()=>{setShowCompetition(true);loadCompetition();}} className="col-span-2 rounded-xl bg-blue-600 p-2 text-xs font-bold text-white">وضع المسابقة</button>
            <button onClick={()=>{setShowEvidenceHub(true);loadEvidenceHub();}} className="col-span-2 rounded-xl bg-slate-800 p-2 text-xs font-bold text-white">مستودع الأدلة</button>
          </div>
          <h3 className="px-2 py-3 text-lg font-extrabold">المكونات الرئيسية (7)</h3>
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
