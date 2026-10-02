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
            </div>
          </div>

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
