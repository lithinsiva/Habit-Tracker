import { useState, useEffect, useRef } from "react";

const DEFAULT_HABITS = [
  { id: "run",      name: "Morning run",           category: "health"   },
  { id: "water",    name: "Drink 8 glasses water",  category: "health"   },
  { id: "read",     name: "Read 20 pages",          category: "learning" },
  { id: "meditate", name: "10 min meditation",      category: "mind"     },
  { id: "journal",  name: "Journal entry",          category: "mind"     },
  { id: "workout",  name: "Workout / gym",          category: "health"   },
  { id: "budget",   name: "Review budget",          category: "finance"  },
  { id: "screen",   name: "No screen before bed",   category: "prod"     },
];

const CATEGORIES = ["health", "learning", "mind", "finance", "prod", "social", "other"];

const CAT_COLORS = {
  health:   { bg: "#052e16", text: "#4ade80", border: "#166534" },
  learning: { bg: "#172554", text: "#60a5fa", border: "#1e40af" },
  mind:     { bg: "#2e1065", text: "#c084fc", border: "#6b21a8" },
  finance:  { bg: "#022c22", text: "#34d399", border: "#065f46" },
  prod:     { bg: "#2c1a06", text: "#fb923c", border: "#92400e" },
  social:   { bg: "#2d1a3a", text: "#f472b6", border: "#86198f" },
  other:    { bg: "#1c1c1c", text: "#a3a3a3", border: "#404040" },
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const FULL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function uid() { return Math.random().toString(36).slice(2, 9); }
function getTodayKey() { return new Date().toISOString().slice(0, 10); }
function getWeekKey() {
  const d = new Date(), mon = new Date(d);
  mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return mon.toISOString().slice(0, 10);
}
function getMondayOfWeek() {
  const d = new Date(), mon = new Date(d);
  mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return mon;
}
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4m1.5 0l-.7 7.5a.5.5 0 01-.5.5H4.7a.5.5 0 01-.5-.5L3.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const EditPenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M9.5 2l2.5 2.5-7 7H2.5V9l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const DragIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="5" cy="3.5" r="1" fill="currentColor"/>
    <circle cx="9" cy="3.5" r="1" fill="currentColor"/>
    <circle cx="5" cy="7" r="1" fill="currentColor"/>
    <circle cx="9" cy="7" r="1" fill="currentColor"/>
    <circle cx="5" cy="10.5" r="1" fill="currentColor"/>
    <circle cx="9" cy="10.5" r="1" fill="currentColor"/>
  </svg>
);
const NotionIcon = () => (
  <svg width="15" height="15" viewBox="0 0 100 100" fill="currentColor">
    <path d="M6 10.5c1.7 1.4 2.3 1.3 5.5 1.1l29.8-1.8c.6 0 .1-.6-.1-.7l-5-3.6c-1-.7-2.3-1.5-4.8-1.3L3.8 6.1C2.9 6.2 2.7 6.7 3.1 7.3L6 10.5z"/>
    <path d="M7.3 18.3v43.3c0 2.3 1.2 3.2 3.7 3.1l40.2-2.3c2.5-.1 2.8-1.5 2.8-3.2V16.3c0-1.7-.7-2.6-2.2-2.5l-42 2.4c-1.7.1-2.5 1-2.5 2.1z" opacity=".3"/>
    <path d="M49.7 16.5L12 18.9v41.4l40.2-2.3V16.3c0-.5-.2-.8-.5-.8z" opacity=".15"/>
    <path d="M15.5 22.5l26-1.7v5.8l-8.1.5v24.5l-9.8.6V27.2l-8.1.5v-5.2z"/>
    <path d="M67 20.5l26 .8v5.5l-8-.3v24.2l-9.7-.3V26l-8.3-.3v-5.2z"/>
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

function EditModal({ habit, onSave, onClose }) {
  const [name, setName] = useState(habit?.name ?? "");
  const [category, setCategory] = useState(habit?.category ?? "health");
  const inputRef = useRef(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);
  const isNew = !habit?.id;
  const valid = name.trim().length > 0;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 420, background: "#111", borderRadius: "20px 20px 0 0",
        border: "0.5px solid #222", padding: "20px 20px 40px", animation: "slideUp 0.22s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ width: 34, height: 4, background: "#2a2a2a", borderRadius: 4, margin: "0 auto 22px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#f5f5f0" }}>{isNew ? "New habit" : "Edit habit"}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5a5a54", cursor: "pointer", padding: 4, display: "flex" }}><XIcon /></button>
        </div>

        <label style={{ fontSize: 10, color: "#4a4a44", fontFamily: "DM Mono", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Habit name</label>
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && valid && onSave({ name: name.trim(), category })}
          placeholder="e.g. Morning stretch"
          style={{
            width: "100%", padding: "13px 14px", background: "#0e0e0e", border: "0.5px solid #2a2a2a",
            borderRadius: 12, color: "#f5f5f0", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
            outline: "none", marginBottom: 22,
          }}
        />

        <label style={{ fontSize: 10, color: "#4a4a44", fontFamily: "DM Mono", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 10 }}>Category</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
          {CATEGORIES.map(cat => {
            const c = CAT_COLORS[cat];
            const sel = category === cat;
            return (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                background: sel ? c.bg : "transparent",
                color: sel ? c.text : "#4a4a44",
                border: sel ? `1.5px solid ${c.border}` : "0.5px solid #1f1f1f",
                transition: "all 0.12s",
              }}>{cat}</button>
            );
          })}
        </div>

        <button onClick={() => valid && onSave({ name: name.trim(), category })} style={{
          width: "100%", padding: 15, borderRadius: 13, border: "none",
          cursor: valid ? "pointer" : "not-allowed",
          background: valid ? "#f5f5f0" : "#1a1a1a",
          color: valid ? "#0a0a0a" : "#3a3a3a",
          fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
        }}>
          {isNew ? "Add habit" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function DeleteConfirm({ habit, onConfirm, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "0 20px" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 360, background: "#111", borderRadius: 18, border: "0.5px solid #222",
        padding: "28px 24px", animation: "popIn 0.18s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "#f5f5f0" }}>Delete habit?</div>
        <div style={{ fontSize: 14, color: "#6b6b65", marginBottom: 24, lineHeight: 1.55 }}>
          "<span style={{ color: "#e5e5e0" }}>{habit.name}</span>" will be removed from your tracker.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 13, borderRadius: 12, border: "0.5px solid #2a2a2a", background: "transparent", color: "#a3a3a3", fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "#ef4444", color: "white", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [habits, setHabits]             = useState(() => load("hbt_habits", DEFAULT_HABITS));
  const [view, setView]                 = useState("today");
  const [todayChecked, setTodayChecked] = useState(() => load("hbt_today_" + getTodayKey(), {}));
  const [weekData, setWeekData]         = useState(() => load("hbt_week_"  + getWeekKey(),  {}));
  const [selectedDay, setSelectedDay]   = useState((new Date().getDay() + 6) % 7);
  const [syncing, setSyncing]           = useState(false);
  const [syncMsg, setSyncMsg]           = useState("");
  const [justChecked, setJustChecked]   = useState(null);
  const [editMode, setEditMode]         = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [dragIdx, setDragIdx]           = useState(null);
  const [dragOverIdx, setDragOverIdx]   = useState(null);

  const todayKey  = getTodayKey();
  const weekKey   = getWeekKey();
  const dayIndex  = (new Date().getDay() + 6) % 7;
  const todayName = FULL_DAYS[new Date().getDay()];
  const dateStr   = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  useEffect(() => { save("hbt_habits", habits); }, [habits]);

  useEffect(() => {
    save("hbt_today_" + todayKey, todayChecked);
    const updated = { ...weekData, [todayKey]: Object.keys(todayChecked).filter(k => todayChecked[k]) };
    setWeekData(updated);
    save("hbt_week_" + weekKey, updated);
  }, [todayChecked]);

  const toggle = (id) => {
    if (editMode) return;
    setTodayChecked(prev => { const n = { ...prev, [id]: !prev[id] }; if (!n[id]) delete n[id]; return n; });
    setJustChecked(id); setTimeout(() => setJustChecked(null), 600);
  };

  const doneCount = habits.filter(h => todayChecked[h.id]).length;
  const remaining = habits.length - doneCount;
  const pct       = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

  const monday   = getMondayOfWeek();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d.toISOString().slice(0, 10);
  });

  const totalDone  = Object.values(weekData).reduce((s, a) => s + (a?.length ?? 0), 0);
  const activeDays = Object.values(weekData).filter(a => a?.length > 0).length;
  const avgPct     = activeDays > 0 ? Math.round((totalDone / (activeDays * Math.max(habits.length, 1))) * 100) : 0;
  const selectedDoneIds = weekData[weekDays[selectedDay]] ?? [];

  const saveHabit = ({ name, category }) => {
    if (editingHabit?.id) {
      setHabits(prev => prev.map(h => h.id === editingHabit.id ? { ...h, name, category } : h));
    } else {
      setHabits(prev => [...prev, { id: uid(), name, category }]);
    }
    setEditingHabit(null);
  };

  const deleteHabit = () => {
    setHabits(prev => prev.filter(h => h.id !== deletingHabit.id));
    setTodayChecked(prev => { const n = { ...prev }; delete n[deletingHabit.id]; return n; });
    setDeletingHabit(null);
  };

  const onDragStart = i => setDragIdx(i);
  const onDragOver  = (e, i) => { e.preventDefault(); setDragOverIdx(i); };
  const onDrop      = i => {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOverIdx(null); return; }
    const arr = [...habits];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, moved);
    setHabits(arr);
    setDragIdx(null); setDragOverIdx(null);
  };

  async function syncToNotion() {
    const doneIds = habits.filter(h => todayChecked[h.id]).map(h => h.id);
    if (!doneIds.length) { setSyncMsg("Check off some habits first!"); setTimeout(() => setSyncMsg(""), 3000); return; }
    setSyncing(true); setSyncMsg("");
    const doneNames = doneIds.map(id => habits.find(h => h.id === id)?.name ?? id);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 1000,
        system: "Update a Notion Weekly Reviews page. Respond with a single JSON object only.",
        messages: [{ role: "user", content: `Today is ${todayName}. Habits done: ${doneNames.join(", ")}. Total: ${habits.length}. Completed: ${doneIds.length}. Skipped: ${habits.length - doneIds.length}. Completion: ${pct}%.` }],
        mcp_servers: [{ type: "url", url: "https://mcp.notion.com/mcp", name: "notion" }],
      })
    });
    await res.json();
    setSyncing(false);
    setSyncMsg(`Synced! ${doneNames.length} habits logged for ${todayName}.`);
    setTimeout(() => setSyncMsg(""), 5000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f0", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{display:none}
        input:focus{outline:none!important;border-color:#3a3a3a!important;box-shadow:0 0 0 3px rgba(255,255,255,0.04)}
        input::placeholder{color:#2a2a2a}
        .hrow{transition:background 0.1s}
        .hrow:active:not(.em){opacity:0.75}
        .ca{animation:pop 0.3s cubic-bezier(0.34,1.56,0.64,1)}
        @keyframes pop{0%{transform:scale(0.8)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes popIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .fi{animation:fadeIn 0.2s ease forwards}
        .pf{transition:width 0.4s cubic-bezier(0.4,0,0.2,1)}
        .tb{transition:all 0.15s}.tb:active{transform:scale(0.97)}
        .dp{transition:all 0.15s;cursor:pointer}.dp:active{transform:scale(0.95)}
        .ib{transition:all 0.15s;opacity:0.5}.ib:hover{opacity:1!important}.ib:active{transform:scale(0.88)}
        .ab{transition:all 0.2s}.ab:hover{opacity:0.85}.ab:active{transform:scale(0.98)}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>

        {/* Header */}
        <div style={{ paddingTop: 48, paddingBottom: 22, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1.1 }}>Habit tracker</div>
            <div style={{ fontSize: 13, color: "#6b6b65", marginTop: 6 }}>{dateStr}</div>
          </div>
          {view === "today" && (
            <button onClick={() => setEditMode(e => !e)} style={{
              marginTop: 8, padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
              fontFamily: "'DM Sans',sans-serif", cursor: "pointer", border: "0.5px solid",
              borderColor: editMode ? "#4ade80" : "#2a2a2a",
              background: editMode ? "#052e16" : "transparent",
              color: editMode ? "#4ade80" : "#6b6b65",
              transition: "all 0.2s",
            }}>
              {editMode ? "Done" : "Edit"}
            </button>
          )}
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", background: "#141414", borderRadius: 14, padding: 4, marginBottom: 22, border: "0.5px solid #1f1f1f" }}>
          {[["today","Today"],["week","Weekly report"]].map(([v, label]) => (
            <button key={v} className="tb" onClick={() => { setView(v); setEditMode(false); }} style={{
              flex: 1, padding: "11px 0", borderRadius: 11, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans',sans-serif",
              background: view === v ? "#f5f5f0" : "transparent",
              color: view === v ? "#0a0a0a" : "#6b6b65",
            }}>{label}</button>
          ))}
        </div>

        {/* ── TODAY ── */}
        {view === "today" && (
          <div className="fi">
            {/* Banner */}
            {editMode ? (
              <div style={{ background: "#0d1f0d", border: "0.5px solid #166534", borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
                <p style={{ fontSize: 13, color: "#4ade80", lineHeight: 1.55 }}>Drag to reorder · tap <EditPenIcon/> to rename · tap <TrashIcon/> to delete</p>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12, background: "#111", border: "0.5px solid #1f1f1f", borderRadius: 14, padding: "12px 16px", marginBottom: 18, alignItems: "flex-start" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 10, color: "#5a5a54", fontFamily: "DM Mono" }}>i</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b6b65", lineHeight: 1.55 }}>Check off habits below. They auto-reset tomorrow.</p>
              </div>
            )}

            {/* Stats (hidden in edit mode) */}
            {!editMode && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[["Done today", doneCount], ["Remaining", remaining], ["Completion", pct + "%"]].map(([label, val]) => (
                    <div key={label} style={{ background: "#111", border: "0.5px solid #1f1f1f", borderRadius: 14, padding: "12px 12px" }}>
                      <div style={{ fontSize: 10, color: "#4a4a44", marginBottom: 7, fontFamily: "DM Mono", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px" }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ height: 4, background: "#1a1a1a", borderRadius: 10, marginBottom: 20, overflow: "hidden" }}>
                  <div className="pf" style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#4ade80,#22c55e)", borderRadius: 10 }} />
                </div>
              </>
            )}

            {/* Habit list */}
            <div style={{ background: "#0e0e0e", border: "0.5px solid #1a1a1a", borderRadius: 18, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ padding: "12px 18px 10px", borderBottom: "0.5px solid #141414" }}>
                <span style={{ fontSize: 10, color: "#3a3a34", fontFamily: "DM Mono", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {editMode ? `${habits.length} habits` : `Daily habits — ${todayName}`}
                </span>
              </div>

              {habits.map((h, idx) => {
                const done    = !!todayChecked[h.id];
                const cat     = CAT_COLORS[h.category] ?? CAT_COLORS.other;
                const isAnim  = justChecked === h.id;
                const isDOver = dragOverIdx === idx && dragIdx !== idx;

                return (
                  <div
                    key={h.id}
                    className={`hrow${editMode ? " em" : ""}`}
                    draggable={editMode}
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={e => onDragOver(e, idx)}
                    onDrop={() => onDrop(idx)}
                    onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                    onClick={() => !editMode && toggle(h.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                      borderBottom: idx < habits.length - 1 ? "0.5px solid #141414" : "none",
                      borderTop: isDOver ? "2px solid #4ade80" : "2px solid transparent",
                      cursor: editMode ? "grab" : "pointer", userSelect: "none",
                      background: dragIdx === idx ? "#151515" : "transparent",
                    }}
                  >
                    {/* Left icon */}
                    {editMode ? (
                      <span style={{ color: "#2a2a2a", display: "flex", flexShrink: 0 }}><DragIcon /></span>
                    ) : (
                      <div className={isAnim ? "ca" : ""} style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: done ? "none" : "1.5px solid #2a2a2a",
                        background: done ? "#22c55e" : "transparent",
                        transition: "all 0.2s",
                      }}>
                        {done && <CheckIcon />}
                      </div>
                    )}

                    {/* Name */}
                    <span style={{ flex: 1, fontSize: 15, color: (!editMode && done) ? "#3a3a34" : "#e5e5e0", textDecoration: (!editMode && done) ? "line-through" : "none", transition: "all 0.2s" }}>
                      {h.name}
                    </span>

                    {/* Category */}
                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: cat.bg, color: cat.text, border: `0.5px solid ${cat.border}`, fontWeight: 500, flexShrink: 0 }}>
                      {h.category}
                    </span>

                    {/* Edit/Delete buttons */}
                    {editMode && (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 2 }}>
                        <button className="ib" onClick={e => { e.stopPropagation(); setEditingHabit(h); }} style={{
                          width: 30, height: 30, borderRadius: 8, border: "0.5px solid #2a2a2a",
                          background: "transparent", color: "#8a8a84", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        }}><EditPenIcon /></button>
                        <button className="ib" onClick={e => { e.stopPropagation(); setDeletingHabit(h); }} style={{
                          width: 30, height: 30, borderRadius: 8, border: "0.5px solid #3a1818",
                          background: "transparent", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        }}><TrashIcon /></button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add new habit */}
              {editMode && (
                <button onClick={() => setEditingHabit({})} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  background: "transparent", border: "none", borderTop: "0.5px solid #141414",
                  cursor: "pointer", color: "#4ade80", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500,
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px dashed #166534", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PlusIcon />
                  </div>
                  Add new habit
                </button>
              )}
            </div>

            {/* Sync button */}
            {!editMode && (
              <>
                <button className="ab" onClick={syncing ? undefined : syncToNotion} style={{
                  width: "100%", padding: 15, borderRadius: 14, border: "0.5px solid #2a2a2a",
                  background: syncing ? "#1a1a1a" : "#f5f5f0", color: syncing ? "#4a4a44" : "#0a0a0a",
                  fontSize: 15, fontWeight: 500, cursor: syncing ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                  {syncing
                    ? <><span style={{ display: "inline-block", width: 15, height: 15, border: "2px solid #3a3a3a", borderTopColor: "#6b6b65", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Syncing...</>
                    : <><NotionIcon /> Push to Notion weekly report &nbsp;↗</>}
                </button>
                {syncMsg && <p style={{ textAlign: "center", fontSize: 13, color: syncMsg.startsWith("Synced") ? "#4ade80" : "#f87171", marginTop: 10 }}>{syncMsg}</p>}
              </>
            )}
          </div>
        )}

        {/* ── WEEKLY ── */}
        {view === "week" && (
          <div className="fi">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 22 }}>
              {[["Days tracked", activeDays], ["Total done", totalDone], ["Avg rate", avgPct + "%"]].map(([label, val]) => (
                <div key={label} style={{ background: "#111", border: "0.5px solid #1f1f1f", borderRadius: 14, padding: "12px 12px" }}>
                  <div style={{ fontSize: 10, color: "#4a4a44", marginBottom: 7, fontFamily: "DM Mono", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px" }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {DAYS.map((d, i) => {
                const dk = weekDays[i], hasDone = (weekData[dk]?.length ?? 0) > 0, isToday = i === dayIndex, isSel = i === selectedDay;
                return (
                  <button key={d} className="dp" onClick={() => setSelectedDay(i)} style={{
                    padding: "6px 13px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                    fontFamily: "'DM Sans',sans-serif", border: "0.5px solid",
                    borderColor: isSel ? "#f5f5f0" : hasDone ? "#166534" : "#1f1f1f",
                    background: isSel ? "#f5f5f0" : hasDone ? "#052e16" : "transparent",
                    color: isSel ? "#0a0a0a" : hasDone ? "#4ade80" : "#4a4a44",
                    position: "relative",
                  }}>
                    {d}
                    {isToday && !isSel && <span style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: "#4ade80" }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ background: "#0e0e0e", border: "0.5px solid #1a1a1a", borderRadius: 18, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ padding: "12px 18px 10px", borderBottom: "0.5px solid #141414" }}>
                <span style={{ fontSize: 10, color: "#3a3a34", fontFamily: "DM Mono", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {DAYS[selectedDay]} — habits completed
                </span>
              </div>
              {selectedDoneIds.length === 0
                ? <div style={{ padding: "26px 18px", color: "#3a3a34", fontSize: 14, fontStyle: "italic" }}>No habits logged for {DAYS[selectedDay]}</div>
                : selectedDoneIds.map((id, idx) => {
                    const h = habits.find(x => x.id === id); if (!h) return null;
                    const cat = CAT_COLORS[h.category] ?? CAT_COLORS.other;
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: idx < selectedDoneIds.length - 1 ? "0.5px solid #141414" : "none" }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckIcon /></div>
                        <span style={{ flex: 1, fontSize: 15 }}>{h.name}</span>
                        <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: cat.bg, color: cat.text, border: `0.5px solid ${cat.border}`, fontWeight: 500 }}>{h.category}</span>
                      </div>
                    );
                  })}
            </div>

            <div style={{ background: "#0e0e0e", border: "0.5px solid #1a1a1a", borderRadius: 18, padding: "16px 16px 14px" }}>
              <div style={{ fontSize: 10, color: "#3a3a34", fontFamily: "DM Mono", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Weekly progress</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60 }}>
                {DAYS.map((d, i) => {
                  const dk = weekDays[i], count = weekData[dk]?.length ?? 0;
                  const barH = Math.max(4, Math.round((count / Math.max(habits.length, 1)) * 56));
                  const isToday = i === dayIndex;
                  return (
                    <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <div style={{ width: "100%", height: barH, borderRadius: 4, background: isToday ? "#22c55e" : count > 0 ? "#166534" : "#1a1a1a", transition: "height 0.3s" }} />
                      <span style={{ fontSize: 9, color: isToday ? "#4ade80" : "#3a3a34", fontFamily: "DM Mono" }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {editingHabit !== null && <EditModal habit={editingHabit} onSave={saveHabit} onClose={() => setEditingHabit(null)} />}
      {deletingHabit && <DeleteConfirm habit={deletingHabit} onConfirm={deleteHabit} onClose={() => setDeletingHabit(null)} />}
    </div>
  );
}
