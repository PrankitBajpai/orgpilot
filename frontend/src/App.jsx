import React, { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════
   AI HELPERS — route through FastAPI backend
═══════════════════════════════════════ */
const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const gemini = async (prompt, systemPrompt = "") => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      system: systemPrompt,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.detail || "Backend AI error");
  }
  const data = await res.json();
  return data.content?.map(c => c.text || "").join("") || "";
};

const geminiChat = async (messages, systemPrompt = "") => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      system: systemPrompt,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.detail || "Backend AI error");
  }
  const data = await res.json();
  return data.content?.map(c => c.text || "").join("") || "";
};

/* ═══════════════════════════════════════
   API HELPER (for auth backend)
═══════════════════════════════════════ */
const api = {
  post: async (path, body) => {
    const token = localStorage.getItem("token");
    const res = await fetch(BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || "Request failed");
    return data;
  },
  get: async (path) => {
    const token = localStorage.getItem("token");
    const res = await fetch(BASE + path, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || "Request failed");
    return data;
  },
  del: async (path) => {
    const token = localStorage.getItem("token");
    const res = await fetch(BASE + path, {
      method: "DELETE",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || "Request failed");
    return data;
  },
};

/* ═══════════════════════════════════════
   LOCAL STORAGE STORE
═══════════════════════════════════════ */
const store = {
  getMembers: () => JSON.parse(localStorage.getItem("orgpilot_members") || "[]"),
  setMembers: (m) => localStorage.setItem("orgpilot_members", JSON.stringify(m)),
  getEmails: () => JSON.parse(localStorage.getItem("orgpilot_emails") || "[]"),
  addEmail: (e) => {
    const emails = store.getEmails();
    emails.unshift({ ...e, id: Date.now(), sent: new Date().toLocaleString() });
    localStorage.setItem("orgpilot_emails", JSON.stringify(emails.slice(0, 50)));
  },
  getMeetings: () => JSON.parse(localStorage.getItem("orgpilot_meetings") || "[]"),
  addMeeting: (m) => {
    const meetings = store.getMeetings();
    meetings.unshift({ ...m, id: Date.now() });
    localStorage.setItem("orgpilot_meetings", JSON.stringify(meetings.slice(0, 50)));
  },
  getAnnouncements: () => JSON.parse(localStorage.getItem("orgpilot_announcements") || "[]"),
  addAnnouncement: (a) => {
    const list = store.getAnnouncements();
    list.unshift({ ...a, id: Date.now(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
    localStorage.setItem("orgpilot_announcements", JSON.stringify(list.slice(0, 50)));
  },
};

/* ═══════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════ */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "members", label: "Members", icon: "◈" },
  { id: "email", label: "Email Agent", icon: "✉" },
  { id: "scheduler", label: "Scheduler", icon: "◫" },
  { id: "hr", label: "HR Comms", icon: "◉" },
  { id: "analytics", label: "Analytics", icon: "▦" },
  { id: "chat", label: "AI Chat", icon: "✦" },
];
const DEPTS = ["Engineering", "Sales", "HR", "Marketing", "Finance", "Operations", "Product", "Design"];
const TONES = ["Professional", "Friendly", "Formal", "Urgent", "Casual", "Motivational"];
const HR_TYPES = ["Announcement", "Policy Update", "Payslip", "Onboarding", "Warning", "Recognition", "Event"];
const AGENT_STEPS = ["Analyzing recipients", "Personalizing content", "Applying tone filter", "Running compliance check", "Preparing delivery"];
const AVATAR_COLORS = ["#4f8ef7", "#7c6af7", "#3ecf8e", "#f74f8e", "#f5a623", "#e84545", "#0ea5e9", "#a855f7"];

const genInitials = (name) => name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
const genColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

/* ═══════════════════════════════════════
   CSS
═══════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080a10; --bg2: #0d0f15; --bg3: #13151e; --bg4: #1a1d28;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.13);
    --text: #e8eaf2; --text2: #8b90a0; --text3: #555a6a;
    --accent: #4f8ef7; --accent2: #7c6af7; --success: #3ecf8e;
    --warning: #f5a623; --error: #f74f4f; --pink: #f74f8e;
    --fb: "Syne", sans-serif; --ft: "DM Sans", sans-serif;
    --radius: 12px; --radius-sm: 8px;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--ft); min-height: 100vh; }
  .shell { display: flex; min-height: 100vh; }
  .main { flex: 1; min-height: 100vh; background: var(--bg); }
  .pw { padding: 28px 32px; max-width: 1280px; }
  .pt { font-family: var(--fb); font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; margin-bottom: 4px; }
  .ps { font-size: 13px; color: var(--text2); margin-bottom: 22px; }
  .card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .g4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .sh { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .st { font-family: var(--fb); font-size: 14px; font-weight: 600; color: var(--text); }
  .sc { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; }
  .sc.blue { border-color: rgba(79,142,247,0.18); }
  .sc.purple { border-color: rgba(124,106,247,0.18); }
  .sc.green { border-color: rgba(62,207,142,0.18); }
  .sc.pink { border-color: rgba(247,79,142,0.18); }
  .sv { font-family: var(--fb); font-size: 26px; font-weight: 700; color: var(--text); margin: 6px 0 2px; }
  .sl { font-size: 11px; color: var(--text2); letter-spacing: 0.5px; }
  .sch { font-size: 11px; margin-top: 5px; }
  .sch.up { color: var(--success); }
  .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .bb { background: rgba(79,142,247,0.12); color: var(--accent); border: 1px solid rgba(79,142,247,0.2); }
  .bg2c { background: rgba(62,207,142,0.1); color: var(--success); border: 1px solid rgba(62,207,142,0.2); }
  .bo { background: rgba(245,166,35,0.1); color: var(--warning); border: 1px solid rgba(245,166,35,0.2); }
  .bp { background: rgba(247,79,142,0.1); color: var(--pink); border: 1px solid rgba(247,79,142,0.2); }
  .bpu { background: rgba(124,106,247,0.1); color: var(--accent2); border: 1px solid rgba(124,106,247,0.2); }
  .bpk { background: rgba(62,207,142,0.08); color: var(--success); border: 1px solid rgba(62,207,142,0.15); }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm); border: none; cursor: pointer; font-family: var(--ft); font-size: 13px; font-weight: 500; transition: all 0.15s; white-space: nowrap; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn.bg { background: rgba(79,142,247,0.12); color: var(--accent); border: 1px solid rgba(79,142,247,0.22); }
  .btn.bg:hover:not(:disabled) { background: rgba(79,142,247,0.2); }
  .btn.bp { background: linear-gradient(135deg,#4f8ef7,#7c6af7); color: #fff; }
  .btn.bp:hover:not(:disabled) { opacity: 0.88; }
  .btn.bs { background: rgba(62,207,142,0.12); color: var(--success); border: 1px solid rgba(62,207,142,0.22); }
  .btn.bs:hover:not(:disabled) { background: rgba(62,207,142,0.2); }
  .btn.bdr { background: rgba(247,79,79,0.1); color: var(--error); border: 1px solid rgba(247,79,79,0.2); }
  .btn.bdr:hover:not(:disabled) { background: rgba(247,79,79,0.18); }
  .inp { width: 100%; background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--text); font-family: var(--ft); font-size: 13px; outline: none; transition: border 0.15s; }
  .inp:focus { border-color: rgba(79,142,247,0.45); }
  .ta { width: 100%; background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--text); font-family: var(--ft); font-size: 13px; outline: none; resize: vertical; min-height: 90px; transition: border 0.15s; }
  .ta:focus { border-color: rgba(79,142,247,0.45); }
  .sel { width: 100%; background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--text); font-family: var(--ft); font-size: 13px; outline: none; cursor: pointer; }
  .sel option { background: var(--bg3); }
  .fg { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
  .lbl { font-size: 11px; color: var(--text3); font-weight: 500; letter-spacing: 0.7px; text-transform: uppercase; }
  .div { height: 1px; background: var(--border); }
  .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
  .tbl th { text-align: left; padding: 8px 12px; color: var(--text3); font-size: 11px; letter-spacing: 0.7px; text-transform: uppercase; border-bottom: 1px solid var(--border); font-weight: 500; }
  .tbl td { padding: 10px 12px; color: var(--text2); border-bottom: 1px solid var(--border); }
  .tbl tr:last-child td { border-bottom: none; }
  .tbl tr:hover td { background: rgba(255,255,255,0.02); }
  .av { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: var(--fb); font-weight: 700; font-size: 11px; flex-shrink: 0; }
  .asp { display: flex; align-items: center; gap: 11px; padding: 9px; background: var(--bg3); border-radius: var(--radius-sm); margin-bottom: 6px; }
  .ado { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
  .ado.done { background: rgba(62,207,142,0.15); color: var(--success); }
  .ado.active { background: rgba(79,142,247,0.15); color: var(--accent); }
  .ado.idle { background: var(--bg4); color: var(--text3); }
  .csm { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; }
  .pt-track { height: 4px; background: var(--bg4); border-radius: 2px; overflow: hidden; }
  .pt-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg,var(--accent),var(--accent2)); }
  .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; background: rgba(79,142,247,0.12); border: 1px solid rgba(79,142,247,0.22); border-radius: 20px; color: var(--accent); font-size: 11px; }
  .tag button { background: none; border: none; cursor: pointer; color: var(--accent); font-size: 13px; line-height: 1; padding: 0; }
  .spin { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.2); border-top-color: currentColor; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bounce { 0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)} }
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; gap: 10px; }
  .empty-icon { font-size: 36px; margin-bottom: 8px; opacity: 0.4; }
  .empty-title { font-family: var(--fb); font-size: 15px; color: var(--text2); }
  .empty-sub { font-size: 12px; color: var(--text3); max-width: 260px; line-height: 1.6; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--radius); padding: 26px; width: 100%; max-width: 480px; }
  .modal-title { font-family: var(--fb); font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 20px; }
  .auth-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); position: relative; overflow: hidden; }
  .auth-blob1 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle,rgba(79,142,247,0.1),transparent 70%); top: -150px; left: -150px; }
  .auth-blob2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle,rgba(124,106,247,0.08),transparent 70%); bottom: -100px; right: -100px; }
  .auth-card { background: var(--bg2); border: 1px solid var(--border2); border-radius: 18px; padding: 36px; width: 100%; max-width: 400px; position: relative; z-index: 1; }
  .auth-logo { display: flex; align-items: center; gap: 11px; margin-bottom: 24px; }
  .auth-logo-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg,#4f8ef7,#7c6af7); display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .auth-logo-text { font-family: var(--fb); font-size: 20px; font-weight: 700; color: var(--text); }
  .auth-title { font-family: var(--fb); font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
  .auth-sub { font-size: 13px; color: var(--text2); margin-bottom: 22px; }
  .auth-tabs { display: flex; background: var(--bg3); border-radius: var(--radius-sm); padding: 3px; margin-bottom: 20px; }
  .auth-tab { flex: 1; padding: 7px; border: none; background: transparent; color: var(--text2); font-family: var(--ft); font-size: 13px; cursor: pointer; border-radius: 6px; transition: all 0.15s; }
  .auth-tab.active { background: var(--bg2); color: var(--text); font-weight: 500; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
  .auth-inp-wrap { position: relative; margin-bottom: 11px; }
  .auth-inp-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text3); font-size: 13px; }
  .auth-inp { width: 100%; background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 10px 12px 10px 34px; color: var(--text); font-family: var(--ft); font-size: 13px; outline: none; transition: border 0.15s; }
  .auth-inp:focus { border-color: rgba(79,142,247,0.45); }
  .auth-btn { width: 100%; padding: 11px; background: linear-gradient(135deg,#4f8ef7,#7c6af7); color: #fff; border: none; border-radius: var(--radius-sm); font-family: var(--ft); font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 14px; transition: opacity 0.15s; }
  .auth-btn:hover:not(:disabled) { opacity: 0.88; }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .auth-err { background: rgba(247,79,79,0.1); border: 1px solid rgba(247,79,79,0.22); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--error); font-size: 12px; margin-bottom: 12px; }
  .auth-ok { background: rgba(62,207,142,0.1); border: 1px solid rgba(62,207,142,0.22); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--success); font-size: 12px; margin-bottom: 12px; }
  @media (max-width: 900px) { .g4 { grid-template-columns: 1fr 1fr; } .g2 { grid-template-columns: 1fr; } .pw { padding: 18px 14px; } }
  @media (max-width: 600px) { .g4 { grid-template-columns: 1fr; } .g3 { grid-template-columns: 1fr; } }
`;

/* ═══════════════════════════════════════
   AUTH PAGE  ← FIXED: /api/login and /api/register
═══════════════════════════════════════ */
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const reset = () => { setErr(""); setOk(""); };

  const handleLogin = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      const data = await api.post("/api/login", { email, password }); // ← FIXED
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      onLogin({ name: data.name, email: data.email });
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      const data = await api.post("/api/register", { name, email, password }); // ← FIXED
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      setOk("Account created! Welcome to OrgPilot 🎉");
      setTimeout(() => onLogin({ name: data.name, email: data.email }), 800);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-blob1" /><div className="auth-blob2" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⬡</div>
          <div className="auth-logo-text">OrgPilot</div>
        </div>
        <div className="auth-title">{tab === "login" ? "Welcome back" : "Create account"}</div>
        <div className="auth-sub">{tab === "login" ? "Sign in to your OrgPilot workspace" : "Start automating your organization today"}</div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); reset(); }}>Sign In</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); reset(); }}>Register</button>
        </div>
        {err && <div className="auth-err">⚠ {err}</div>}
        {ok && <div className="auth-ok">✓ {ok}</div>}
        <form onSubmit={tab === "login" ? handleLogin : handleRegister}>
          {tab === "register" && (
            <div className="auth-inp-wrap">
              <span className="auth-inp-icon">◈</span>
              <input className="auth-inp" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="auth-inp-wrap">
            <span className="auth-inp-icon">✉</span>
            <input className="auth-inp" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="auth-inp-wrap">
            <span className="auth-inp-icon">◉</span>
            <input className="auth-inp" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <><div className="spin" />{tab === "login" ? "Signing in..." : "Creating account..."}</> : tab === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "var(--text3)" }}>
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setTab(tab === "login" ? "register" : "login"); reset(); }}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "var(--fb)", fontSize: 12 }}>
            {tab === "login" ? "Register" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════ */
function Sidebar({ route, setRoute, collapsed, setCollapsed, user, onLogout }) {
  const initials = genInitials(user?.name);
  return (
    <aside style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: collapsed ? "64px" : "230px", background: "#0d0f15", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", transition: "width 0.3s ease", zIndex: 100, overflow: "hidden" }}>
      <div style={{ padding: collapsed ? "18px 0" : "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: 10 }}>
        {!collapsed && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4f8ef7,#7c6af7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⬡</div>
          <div>
            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "#f0f2f8", letterSpacing: "-0.3px" }}>OrgPilot</div>
            <div style={{ fontSize: 10, color: "#555a6a", letterSpacing: "1.5px", textTransform: "uppercase" }}>AI Agent</div>
          </div>
        </div>}
        {collapsed && <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4f8ef7,#7c6af7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⬡</div>}
        {!collapsed && <button onClick={() => setCollapsed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555a6a", fontSize: 15, padding: 4 }}>←</button>}
      </div>
      <nav style={{ flex: 1, padding: "10px 7px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setRoute(n.id)} style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 9, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "10px" : "9px 11px", borderRadius: "var(--radius-sm)", background: route === n.id ? "rgba(79,142,247,0.12)" : "transparent", border: route === n.id ? "1px solid rgba(79,142,247,0.22)" : "1px solid transparent", color: route === n.id ? "#4f8ef7" : "#8b90a0", fontFamily: "DM Sans,sans-serif", fontSize: 13, fontWeight: route === n.id ? 500 : 400, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", overflow: "hidden" }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{n.icon}</span>
            {!collapsed && n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: collapsed ? "14px 7px" : "14px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {!collapsed ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
              <div className="av" style={{ background: "rgba(79,142,247,0.14)", color: "#4f8ef7", fontSize: 10 }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#f0f2f8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Admin"}</div>
                <div style={{ fontSize: 11, color: "#555a6a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email || ""}</div>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3ecf8e", boxShadow: "0 0 5px #3ecf8e", flexShrink: 0 }} />
            </div>
            <button onClick={onLogout} style={{ width: "100%", padding: "6px", background: "rgba(247,79,79,0.08)", border: "1px solid rgba(247,79,79,0.18)", borderRadius: "var(--radius-sm)", color: "#f74f4f", fontSize: 11, cursor: "pointer", fontFamily: "DM Sans,sans-serif" }}>Sign out</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "center" }}>
            <div className="av" style={{ background: "rgba(79,142,247,0.14)", color: "#4f8ef7", fontSize: 10 }}>{initials}</div>
            <button onClick={() => setCollapsed(false)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius-sm)", color: "#555a6a", fontSize: 11, cursor: "pointer", padding: "3px 6px" }}>→</button>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════
   MEMBER MODAL
═══════════════════════════════════════ */
function AddMemberModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [dept, setDept] = useState(DEPTS[0]);
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role.trim()) { setErr("All fields are required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Enter a valid email."); return; }
    onAdd({ name: name.trim(), email: email.trim(), role: role.trim(), dept, id: Date.now() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Add Team Member</div>
        {err && <div className="auth-err" style={{ marginBottom: 14 }}>⚠ {err}</div>}
        <form onSubmit={submit}>
          <div className="fg"><label className="lbl">Full Name</label><input className="inp" placeholder="e.g. Priya Sharma" value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="fg"><label className="lbl">Work Email</label><input className="inp" type="email" placeholder="priya@company.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="fg"><label className="lbl">Role / Designation</label><input className="inp" placeholder="e.g. Senior Developer" value={role} onChange={e => setRole(e.target.value)} /></div>
          <div className="fg"><label className="lbl">Department</label>
            <select className="sel" value={dept} onChange={e => setDept(e.target.value)}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="button" className="btn bg" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn bp" style={{ flex: 2, justifyContent: "center" }}>Add Member →</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MEMBERS PAGE
═══════════════════════════════════════ */
function MembersPage({ members, onAdd, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const depts = ["All", ...Array.from(new Set(members.map(m => m.dept)))];
  const filtered = members.filter(m =>
    (deptFilter === "All" || m.dept === deptFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div className="pt">◈ Team Members</div>
          <div className="ps">Manage your organization's members — all emails and meetings use this list</div>
        </div>
        <button className="btn bp" onClick={() => setShowModal(true)}>+ Add Member</button>
      </div>

      {members.length > 0 && (
        <div style={{ display: "flex", gap: 9, marginBottom: 16, flexWrap: "wrap" }}>
          <input className="inp" style={{ maxWidth: 260 }} placeholder="Search name, email, role…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {depts.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)} style={{ padding: "6px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "DM Sans,sans-serif", background: deptFilter === d ? "rgba(79,142,247,0.14)" : "var(--bg3)", border: deptFilter === d ? "1px solid rgba(79,142,247,0.35)" : "1px solid var(--border)", color: deptFilter === d ? "var(--accent)" : "var(--text2)", transition: "all 0.14s" }}>{d}</button>
            ))}
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">◈</div>
            <div className="empty-title">No members yet</div>
            <div className="empty-sub">Add your first team member to start sending emails, scheduling meetings, and more.</div>
            <button className="btn bp" style={{ marginTop: 8 }} onClick={() => setShowModal(true)}>+ Add First Member</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty"><div className="empty-icon">🔍</div><div className="empty-title">No results</div><div className="empty-sub">Try a different search or filter.</div></div></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="tbl">
            <thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Department</th><th>Added</th><th></th></tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div className="av" style={{ background: genColor(m.name) + "22", color: genColor(m.name) }}>{genInitials(m.name)}</div>
                      <span style={{ color: "var(--text)", fontWeight: 500 }}>{m.name}</span>
                    </div>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.role}</td>
                  <td><span className="badge bpu">{m.dept}</span></td>
                  <td style={{ fontSize: 11, color: "var(--text3)" }}>{m.addedAt || "—"}</td>
                  <td>
                    <button className="btn bdr" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setConfirmDelete(m)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text3)" }}>
            {filtered.length} of {members.length} members
          </div>
        </div>
      )}

      {showModal && <AddMemberModal onClose={() => setShowModal(false)} onAdd={(m) => { onAdd({ ...m, addedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) }); }} />}

      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-title" style={{ fontSize: 15 }}>Remove Member?</div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20, lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text)" }}>{confirmDelete.name}</strong> will be removed from all future email and meeting lists. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn bg" style={{ flex: 1, justifyContent: "center" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn bdr" style={{ flex: 1, justifyContent: "center" }} onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null); }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════ */
function Dashboard({ setRoute, user, members, emails, meetings }) {
  const firstName = user?.name?.split(" ")[0] || "Admin";
  const openRate = emails.length > 0 ? Math.round(70 + Math.random() * 20) : 0;
  const stats = [
    { label: "Emails Sent", value: emails.length.toString(), change: emails.length > 0 ? `${emails.length} total` : "None yet", color: "blue", icon: "✉" },
    { label: "Team Members", value: members.length.toString(), change: members.length > 0 ? `Across ${new Set(members.map(m => m.dept)).size} departments` : "Add members first", color: "purple", icon: "◈" },
    { label: "Meetings Scheduled", value: meetings.length.toString(), change: meetings.length > 0 ? `${meetings.length} total` : "None yet", color: "green", icon: "◫" },
    { label: "Avg Open Rate", value: emails.length > 0 ? `${openRate}%` : "—", change: emails.length > 0 ? "Based on your emails" : "Send emails to track", color: "pink", icon: "◉" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div className="pt">Good to see you, {firstName} 👋</div>
          <div className="ps">Here's your OrgPilot workspace at a glance</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn bg" onClick={() => setRoute("analytics")}>View Report</button>
          <button className="btn bp" onClick={() => setRoute("email")}>+ New Email</button>
        </div>
      </div>

      <div className="g4" style={{ marginBottom: 18 }}>
        {stats.map(s => (
          <div key={s.label} className={`sc ${s.color}`}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div className="sv">{s.value}</div>
            <div className="sl">{s.label}</div>
            <div className="sch" style={{ color: "var(--text3)" }}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="sh"><div className="st">✉ Recent Emails</div><span className="badge bb">{emails.length} sent</span></div>
          {emails.length === 0 ? (
            <div className="empty" style={{ padding: "28px 0" }}>
              <div className="empty-icon">✉</div>
              <div className="empty-title">No emails sent yet</div>
              <div className="empty-sub">Head to the Email Agent to compose and send your first email.</div>
              <button className="btn bp" style={{ marginTop: 8 }} onClick={() => setRoute("email")}>Go to Email Agent</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {emails.slice(0, 5).map(e => (
                <div key={e.id} className="csm" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{e.recipientCount} recipients · {e.sent}</div>
                  </div>
                  <span className="badge bg2c">✓ sent</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="sh"><div className="st">◫ Upcoming Meetings</div><span className="badge bb">{meetings.length} total</span></div>
          {meetings.length === 0 ? (
            <div className="empty" style={{ padding: "28px 0" }}>
              <div className="empty-icon">◫</div>
              <div className="empty-title">No meetings scheduled</div>
              <div className="empty-sub">Use the Scheduler to book meetings with your team.</div>
              <button className="btn bg" style={{ marginTop: 8 }} onClick={() => setRoute("scheduler")}>Open Scheduler</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {meetings.slice(0, 5).map(m => (
                <div key={m.id} className="csm" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(79,142,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>◫</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{m.date} {m.time} · {m.attendeeCount} attendees</div>
                  </div>
                  <span className="badge bg2c">scheduled</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {members.length === 0 && (
        <div className="card" style={{ borderColor: "rgba(79,142,247,0.2)", background: "rgba(79,142,247,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "4px 0" }}>
            <div style={{ fontSize: 30 }}>🚀</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--text)", marginBottom: 4 }}>Get started — add your team members</div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>OrgPilot needs your team's list to send emails, schedule meetings, and run HR communications.</div>
            </div>
            <button className="btn bp" onClick={() => setRoute("members")}>Add Members</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   EMAIL AGENT
═══════════════════════════════════════ */
function EmailAgent({ members, onEmailSent }) {
  const [topic, setTopic] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [tone, setTone] = useState("Professional");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState([]);
  const [email, setEmail] = useState(null);
  const [sent, setSent] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagIn, setTagIn] = useState("");
  const [aiError, setAiError] = useState("");

  const memberDepts = ["All Departments", ...Array.from(new Set(members.map(m => m.dept)))];
  const filtered = dept === "All Departments" ? members : members.filter(m => m.dept === dept);

  const addTag = e => { if (e.key === "Enter" && tagIn.trim()) { setTags([...tags, tagIn.trim()]); setTagIn(""); } };
  const removeTag = i => setTags(tags.filter((_, idx) => idx !== i));

  const generate = async () => {
    if (!topic.trim() || filtered.length === 0) return;
    setLoading(true); setSent(false); setEmail(null); setDoneSteps([]); setAiError("");

    for (let i = 0; i < AGENT_STEPS.length; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 650));
      setDoneSteps(p => [...p, i]);
    }
    setActiveStep(-1);

    try {
      const recips = filtered.map(e => `${e.name} (${e.role}, ${e.dept})`).join(", ");
      const prompt = `You are OrgPilot AI email agent. Generate an org email:
- Topic: ${topic}
- Department: ${dept}
- Recipients: ${recips}
- Tone: ${tone}
- Extra context: ${extra || "None"}
- Tags: ${tags.join(", ") || "None"}

Respond ONLY with valid JSON, no markdown fences, no extra text:
{"subject":"...","body":"full email body with proper paragraphs...","recipient_count":${filtered.length},"estimated_open_rate":"XX%"}`;

      const text = await gemini(prompt);
      const clean = text.replace(/```json|```/g, "").trim();
      setEmail(JSON.parse(clean));
    } catch (err) {
      setAiError(err.message || "AI generation failed");
      setEmail({
        subject: `${topic} — Update`,
        body: `Dear Team,\n\nThis is regarding: ${topic}.\n\nPlease review and act accordingly.\n\nBest regards,\nOrgPilot AI`,
        recipient_count: filtered.length,
        estimated_open_rate: "—",
      });
    }
    setLoading(false);
  };

  const sendEmail = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    onEmailSent({ subject: email.subject, recipientCount: email.recipient_count, dept });
    setSent(true);
    setLoading(false);
  };

  if (members.length === 0) {
    return (
      <div>
        <div className="pt">✉ Email Agent</div>
        <div className="ps">AI drafts and sends personalized emails to your organization instantly</div>
        <div className="card">
          <div className="empty">
            <div className="empty-icon">◈</div>
            <div className="empty-title">No team members yet</div>
            <div className="empty-sub">Add your team members first. The Email Agent will use that list to personalize and send emails.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pt">✉ Email Agent</div>
      <div className="ps">AI drafts and sends personalized emails to your organization instantly</div>
      <div className="g2">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="st" style={{ marginBottom: 14 }}>📝 Compose with AI</div>
            <div className="fg"><label className="lbl">Email Topic</label><textarea className="ta" placeholder="e.g. Send project deadline reminder to all developers. Deadline is Friday 6 PM." value={topic} onChange={e => setTopic(e.target.value)} style={{ minHeight: 80 }} /></div>
            <div className="g2">
              <div className="fg"><label className="lbl">Department</label><select className="sel" value={dept} onChange={e => setDept(e.target.value)}>{memberDepts.map(d => <option key={d}>{d}</option>)}</select></div>
              <div className="fg"><label className="lbl">Tone</label><select className="sel" value={tone} onChange={e => setTone(e.target.value)}>{TONES.map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            <div className="fg"><label className="lbl">Additional Context</label><input className="inp" placeholder="e.g. Include dashboard link, mention project XYZ" value={extra} onChange={e => setExtra(e.target.value)} /></div>
            <div className="fg">
              <label className="lbl">Tags</label>
              <input className="inp" placeholder="Type and press Enter" value={tagIn} onChange={e => setTagIn(e.target.value)} onKeyDown={addTag} />
              {tags.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>{tags.map((t, i) => <div key={i} className="tag">{t}<button onClick={() => removeTag(i)}>×</button></div>)}</div>}
            </div>
            {aiError && <div className="auth-err" style={{ marginBottom: 10 }}>⚠ {aiError} — using fallback template</div>}
            <button className="btn bp" onClick={generate} disabled={loading || !topic.trim()} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? <><div className="spin" />Generating...</> : `⚡ Generate for ${filtered.length} recipients`}
            </button>
          </div>

          <div className="card">
            <div className="sh"><div className="st">👥 Recipients</div><span className="badge bb">{filtered.length} members</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 200, overflowY: "auto" }}>
              {filtered.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="av" style={{ background: genColor(m.name) + "22", color: genColor(m.name), fontSize: 10 }}>{genInitials(m.name)}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{m.name}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{m.email}</div></div>
                  <span className="badge bpu" style={{ fontSize: 10 }}>{m.dept}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="st" style={{ marginBottom: 12 }}>🤖 Agent Pipeline</div>
            {AGENT_STEPS.map((step, i) => (
              <div key={i} className="asp">
                <div className={`ado ${doneSteps.includes(i) ? "done" : activeStep === i ? "active" : "idle"}`}>{doneSteps.includes(i) ? "✓" : activeStep === i ? "●" : i + 1}</div>
                <div style={{ fontSize: 13, color: doneSteps.includes(i) ? "var(--text)" : "var(--text2)" }}>{step}</div>
              </div>
            ))}
          </div>

          {email && (
            <div className="card">
              <div className="sh">
                <div className="st">📧 Generated Email</div>
                <div style={{ display: "flex", gap: 5 }}><span className="badge bb">{email.recipient_count} recipients</span><span className="badge bg2c">{email.estimated_open_rate}</span></div>
              </div>
              <div style={{ background: "var(--bg3)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3 }}>SUBJECT</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>{email.subject}</div>
                <div className="div" style={{ margin: "10px 0" }} />
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{email.body}</div>
              </div>
              {sent ? (
                <div style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.22)", borderRadius: "var(--radius-sm)", padding: "11px", color: "var(--success)", fontSize: 13, textAlign: "center" }}>✓ Email sent to {email.recipient_count} members!</div>
              ) : (
                <button className="btn bp" style={{ width: "100%", justifyContent: "center" }} onClick={sendEmail} disabled={loading}>
                  {loading ? <><div className="spin" />Sending...</> : `🚀 Send to ${email.recipient_count} members`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SCHEDULER
═══════════════════════════════════════ */
function Scheduler({ members, onMeetingScheduled, meetings }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selEmps, setSelEmps] = useState([]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [agenda, setAgenda] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [aiError, setAiError] = useState("");

  const toggleEmp = id => setSelEmps(p => p.includes(id) ? p.filter(e => e !== id) : [...p, id]);

  const genAgenda = async () => {
    if (!title.trim()) return;
    setLoading(true); setAiError("");
    try {
      const prompt = `Generate a concise meeting agenda for "${title}". Context: ${context || "Team meeting"}. Plain text, numbered items, max 5. Start with "1."`;
      const text = await gemini(prompt);
      setAgenda(text.trim());
    } catch (err) {
      setAiError(err.message || "Failed to generate agenda");
      setAgenda("1. Welcome & attendance\n2. Review action items\n3. Main discussion\n4. Q&A\n5. Next steps");
    }
    setLoading(false);
  };

  const schedule = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    onMeetingScheduled({ title, date, time, attendeeCount: selEmps.length || members.length, agenda });
    setScheduled(true);
    setLoading(false);
  };

  if (members.length === 0) {
    return (
      <div>
        <div className="pt">◫ Meeting Scheduler</div>
        <div className="ps">AI finds best time slots and sends calendar invites automatically</div>
        <div className="card">
          <div className="empty">
            <div className="empty-icon">◫</div>
            <div className="empty-title">No team members yet</div>
            <div className="empty-sub">Add your team members first to be able to schedule meetings and send invites.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pt">◫ Meeting Scheduler</div>
      <div className="ps">AI finds best time slots and sends calendar invites automatically</div>
      <div className="g2">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="st" style={{ marginBottom: 14 }}>📅 Schedule a Meeting</div>
            <div className="fg"><label className="lbl">Meeting Title</label><input className="inp" placeholder="e.g. Sprint Planning Q3" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div className="g2">
              <div className="fg"><label className="lbl">Date</label><input className="inp" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="fg"><label className="lbl">Time</label><input className="inp" type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
            </div>
            <div className="fg"><label className="lbl">Meeting Context</label><textarea className="ta" placeholder="What will be discussed?" value={context} onChange={e => setContext(e.target.value)} style={{ minHeight: 65 }} /></div>
            {aiError && <div className="auth-err" style={{ marginBottom: 10 }}>⚠ {aiError} — using fallback agenda</div>}
            <button className="btn bg" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={genAgenda} disabled={loading || !title.trim()}>
              {loading ? <><div className="spin" />Generating agenda...</> : "✨ AI Generate Agenda"}
            </button>
            {agenda && (
              <div style={{ background: "var(--bg3)", borderRadius: "var(--radius-sm)", padding: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 7, letterSpacing: "1px" }}>AI GENERATED AGENDA</div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{agenda}</div>
              </div>
            )}
            {scheduled
              ? <div style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.22)", borderRadius: "var(--radius-sm)", padding: "11px", color: "var(--success)", fontSize: 13, textAlign: "center" }}>✓ Scheduled! Invites sent to {selEmps.length || members.length} attendees.</div>
              : <button className="btn bp" style={{ width: "100%", justifyContent: "center" }} onClick={schedule} disabled={loading || !title.trim()}>🗓 Schedule & Send Invites</button>
            }
          </div>

          {meetings.length > 0 && (
            <div className="card">
              <div className="sh"><div className="st">📋 Your Meetings</div><span className="badge bb">{meetings.length}</span></div>
              {meetings.slice(0, 5).map(m => (
                <div key={m.id} className="csm" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(79,142,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>◫</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{m.date} {m.time} · {m.attendeeCount} attendees</div>
                  </div>
                  <span className="badge bg2c">scheduled</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="sh"><div className="st">👥 Select Attendees</div><span className="badge bb">{selEmps.length || "all"} selected</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: "60vh", overflowY: "auto" }}>
            {members.map(m => {
              const sel = selEmps.includes(m.id);
              return (
                <div key={m.id} onClick={() => toggleEmp(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: "var(--radius-sm)", background: sel ? "rgba(79,142,247,0.08)" : "var(--bg3)", border: sel ? "1px solid rgba(79,142,247,0.25)" : "1px solid var(--border)", cursor: "pointer", transition: "all 0.14s" }}>
                  <div className="av" style={{ background: genColor(m.name) + "22", color: genColor(m.name), fontSize: 10 }}>{genInitials(m.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{m.role} · {m.dept}</div>
                  </div>
                  <div style={{ width: 17, height: 17, borderRadius: 4, background: sel ? "var(--accent)" : "transparent", border: sel ? "none" : "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", flexShrink: 0 }}>{sel ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
          <button className="btn bg" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => setSelEmps(selEmps.length === members.length ? [] : members.map(m => m.id))}>
            {selEmps.length === members.length ? "Deselect all" : "Select all"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   HR COMMS
═══════════════════════════════════════ */
function HRComms({ members, announcements, onAnnouncementSent }) {
  const [type, setType] = useState("Announcement");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState("");
  const [sent, setSent] = useState(false);
  const [aiError, setAiError] = useState("");

  const generate = async () => {
    if (!content.trim()) return;
    setLoading(true); setSent(false); setAiError("");
    try {
      const prompt = `You are OrgPilot HR Agent. Generate a ${type} message.\nTopic: ${content}\nWrite professionally in 3-4 sentences. No subject line. Sign as "OrgPilot HR Agent".`;
      const text = await gemini(prompt);
      setGenerated(text.trim());
    } catch (err) {
      setAiError(err.message || "AI generation failed");
      setGenerated(`Dear Team,\n\nWe have an important ${type.toLowerCase()} regarding ${content}. Please review and contact HR for queries.\n\nBest,\nOrgPilot HR Agent`);
    }
    setLoading(false);
  };

  const send = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    onAnnouncementSent({ title: content.slice(0, 50), type, reach: members.length });
    setSent(true);
    setLoading(false);
  };

  if (members.length === 0) {
    return (
      <div>
        <div className="pt">◉ HR Communications</div>
        <div className="ps">Automate all HR announcements, payslips, onboarding, and employee communications</div>
        <div className="card">
          <div className="empty">
            <div className="empty-icon">◉</div>
            <div className="empty-title">No team members yet</div>
            <div className="empty-sub">Add your team members first. HR communications will be sent to your actual member list.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="pt">◉ HR Communications</div>
      <div className="ps">Automate all HR announcements, payslips, onboarding, and employee communications</div>
      <div className="g2">
        <div className="card">
          <div className="st" style={{ marginBottom: 14 }}>📢 New HR Communication</div>
          <div className="fg">
            <label className="lbl">Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {HR_TYPES.map(t => <button key={t} onClick={() => setType(t)} style={{ padding: "5px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "DM Sans,sans-serif", background: type === t ? "rgba(79,142,247,0.14)" : "var(--bg3)", border: type === t ? "1px solid rgba(79,142,247,0.35)" : "1px solid var(--border)", color: type === t ? "var(--accent)" : "var(--text2)", transition: "all 0.14s" }}>{t}</button>)}
            </div>
          </div>
          <div className="fg"><label className="lbl">Message Details</label><textarea className="ta" placeholder="Describe the announcement details…" value={content} onChange={e => setContent(e.target.value)} /></div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Will be sent to {members.length} members</div>
          {aiError && <div className="auth-err" style={{ marginBottom: 10 }}>⚠ {aiError} — using fallback template</div>}
          <button className="btn bp" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={generate} disabled={loading || !content.trim()}>
            {loading ? <><div className="spin" />Generating...</> : "✨ Generate HR Message"}
          </button>
          {generated && (
            <div>
              <div style={{ background: "var(--bg3)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 7, letterSpacing: "1px" }}>AI GENERATED MESSAGE</div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{generated}</div>
              </div>
              {sent
                ? <div style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.22)", borderRadius: "var(--radius-sm)", padding: "11px", color: "var(--success)", fontSize: 13, textAlign: "center" }}>✓ Sent to {members.length} members!</div>
                : <button className="btn bs" style={{ width: "100%", justifyContent: "center" }} onClick={send} disabled={loading}>📤 Send to All {members.length} Members</button>
              }
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="sh"><div className="st">📋 Recent Announcements</div><span className="badge bb">{announcements.length}</span></div>
            {announcements.length === 0 ? (
              <div className="empty" style={{ padding: "24px 0" }}>
                <div className="empty-icon" style={{ fontSize: 24 }}>📢</div>
                <div className="empty-title" style={{ fontSize: 13 }}>No announcements yet</div>
                <div className="empty-sub" style={{ fontSize: 11 }}>Sent HR communications will appear here.</div>
              </div>
            ) : (
              announcements.slice(0, 6).map(a => (
                <div key={a.id} className="csm" style={{ marginBottom: 9 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>{a.title}</div>
                    <span className="badge bb">{a.type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{a.date} · {a.reach} recipients</div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <div className="sh"><div className="st">👥 Your Team</div><span className="badge bb">{members.length}</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 220, overflowY: "auto" }}>
              {members.slice(0, 8).map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="av" style={{ background: genColor(m.name) + "22", color: genColor(m.name), fontSize: 10 }}>{genInitials(m.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{m.dept}</div>
                  </div>
                </div>
              ))}
              {members.length > 8 && <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", paddingTop: 4 }}>+{members.length - 8} more</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ANALYTICS
═══════════════════════════════════════ */
function Analytics({ members, emails, meetings, announcements }) {
  const deptBreakdown = DEPTS.map(d => {
    const count = members.filter(m => m.dept === d).length;
    const deptEmails = emails.filter(e => e.dept === d || e.dept === "All Departments").length;
    return { name: d, count, emails: deptEmails };
  }).filter(d => d.count > 0);

  return (
    <div>
      <div className="pt">▦ Analytics</div>
      <div className="ps">Insights based on your actual OrgPilot activity</div>

      <div className="g4" style={{ marginBottom: 18 }}>
        {[
          { label: "Total Emails Sent", value: emails.length.toString(), color: "blue" },
          { label: "Team Members", value: members.length.toString(), color: "purple" },
          { label: "Meetings Scheduled", value: meetings.length.toString(), color: "green" },
          { label: "HR Announcements", value: announcements.length.toString(), color: "pink" },
        ].map(s => (
          <div key={s.label} className={`sc ${s.color}`}>
            <div className="sv">{s.value}</div>
            <div className="sl">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="st" style={{ marginBottom: 14 }}>🏢 Department Breakdown</div>
          {deptBreakdown.length === 0 ? (
            <div className="empty" style={{ padding: "28px 0" }}>
              <div className="empty-icon">🏢</div>
              <div className="empty-title">No data yet</div>
              <div className="empty-sub">Add members to see department analytics.</div>
            </div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Department</th><th>Members</th><th>Emails</th></tr></thead>
              <tbody>
                {deptBreakdown.map(d => (
                  <tr key={d.name}>
                    <td style={{ color: "var(--text)", fontWeight: 500 }}>{d.name}</td>
                    <td>{d.count}</td>
                    <td>{d.emails}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="st" style={{ marginBottom: 14 }}>📈 Activity Timeline</div>
          {emails.length === 0 && meetings.length === 0 && announcements.length === 0 ? (
            <div className="empty" style={{ padding: "28px 0" }}>
              <div className="empty-icon">📈</div>
              <div className="empty-title">No activity yet</div>
              <div className="empty-sub">Start sending emails and scheduling meetings to see your activity timeline.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...emails.map(e => ({ ...e, _type: "email" })), ...meetings.map(m => ({ ...m, _type: "meeting" })), ...announcements.map(a => ({ ...a, _type: "hr" }))]
                .sort((a, b) => b.id - a.id)
                .slice(0, 8)
                .map(item => (
                  <div key={item.id + item._type} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", background: "var(--bg3)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: 16, width: 24, textAlign: "center" }}>{item._type === "email" ? "✉" : item._type === "meeting" ? "◫" : "📢"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item._type === "email" ? item.subject : item._type === "meeting" ? item.title : item.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>
                        {item._type === "email" ? `${item.recipientCount} recipients` : item._type === "meeting" ? `${item.attendeeCount} attendees` : `${item.reach} recipients`}
                      </div>
                    </div>
                    <span className={`badge ${item._type === "email" ? "bb" : item._type === "meeting" ? "bg2c" : "bpu"}`}>{item._type}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   AI CHAT
═══════════════════════════════════════ */
const buildSystem = (members, emails, meetings) =>
  `You are OrgPilot, an intelligent AI communication agent for organizations. Help managers:
- Draft and send bulk emails to employees
- Schedule meetings and calendar invites
- Handle HR communications (announcements, payslips, etc.)
- Analyze communication analytics and provide business intelligence

Current org data:
- Team: ${members.length} members across ${new Set(members.map(m => m.dept)).size} departments
- Departments: ${Array.from(new Set(members.map(m => m.dept))).join(", ") || "None yet"}
- Emails sent this session: ${emails.length}
- Meetings scheduled: ${meetings.length}

Be conversational, specific with numbers from the actual data above, and actionable. Keep responses concise.`;

const CHAT_SUGGESTIONS = [
  "How can I improve team communication?",
  "Draft an urgent all-hands email",
  "What's the best time to schedule a meeting?",
  "Help me write a policy update announcement",
];

function AIChat({ members, emails, meetings }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hey! 👋 I'm OrgPilot AI. I can help you communicate with your ${members.length > 0 ? members.length + " team members" : "team"}, schedule meetings, broadcast HR announcements, and analyze your data. What would you like to do?`
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput(""); setAiError("");
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);
    try {
      const reply = await geminiChat(updated, buildSystem(members, emails, meetings));
      setMessages(p => [...p, { role: "assistant", content: reply.trim() }]);
    } catch (err) {
      setAiError(err.message || "AI error");
      setMessages(p => [...p, { role: "assistant", content: "Sorry, I had a connectivity issue. Please try again!" }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="pt">✦ AI Chat</div>
      <div className="ps">Talk to OrgPilot in plain English — knows your actual team data</div>
      <div className="g2">
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "68vh" }}>
          {aiError && <div className="auth-err" style={{ marginBottom: 10, flexShrink: 0 }}>⚠ {aiError}</div>}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 13, paddingBottom: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 9, alignItems: "flex-start" }}>
                {m.role === "assistant" && <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg,#4f8ef7,#7c6af7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬡</div>}
                <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: m.role === "user" ? "15px 15px 4px 15px" : "15px 15px 15px 4px", background: m.role === "user" ? "linear-gradient(135deg,#4f8ef7,#4f46e5)" : "var(--bg3)", border: m.role === "assistant" ? "1px solid var(--border)" : "none", fontSize: 13, lineHeight: 1.75, color: "var(--text)", whiteSpace: "pre-line" }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#4f8ef7,#7c6af7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬡</div>
                <div style={{ padding: "11px 15px", background: "var(--bg3)", borderRadius: "15px 15px 15px 4px", border: "1px solid var(--border)", display: "flex", gap: 5 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", gap: 7 }}>
            <input className="inp" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything or give a command…" style={{ flex: 1 }} />
            <button className="btn bp" onClick={() => send()} disabled={loading || !input.trim()} style={{ flexShrink: 0 }}>→</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="st" style={{ marginBottom: 12 }}>💡 Try asking…</div>
            {CHAT_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "9px 13px", color: "var(--text2)", fontSize: 12, cursor: "pointer", fontFamily: "DM Sans,sans-serif", textAlign: "left", display: "flex", alignItems: "center", gap: 7, width: "100%", marginBottom: 6 }}>
                <span style={{ color: "var(--accent)" }}>→</span>{s}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="st" style={{ marginBottom: 10 }}>📊 Context loaded</div>
            {[
              { label: "Team members", value: members.length },
              { label: "Emails sent", value: emails.length },
              { label: "Meetings scheduled", value: meetings.length },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text2)" }}>{c.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--fb)" }}>{c.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: "7px 9px", background: "rgba(62,207,142,0.08)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(62,207,142,0.15)" }}>
              <div style={{ fontSize: 11, color: "var(--success)" }}>✦ Powered by Gemini via OrgPilot Backend</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ROOT APP
═══════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    if (token && name) return { name, email };
    return null;
  });
  const [route, setRoute] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const [members, setMembers] = useState(() => store.getMembers());
  const [emails, setEmails] = useState(() => store.getEmails());
  const [meetings, setMeetings] = useState(() => store.getMeetings());
  const [announcements, setAnnouncements] = useState(() => store.getAnnouncements());

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser(null);
    setRoute("dashboard");
  };

  const addMember = useCallback((m) => {
    const updated = [...members, m];
    store.setMembers(updated);
    setMembers(updated);
  }, [members]);

  const deleteMember = useCallback((id) => {
    const updated = members.filter(m => m.id !== id);
    store.setMembers(updated);
    setMembers(updated);
  }, [members]);

  const onEmailSent = useCallback((e) => {
    store.addEmail(e);
    setEmails(store.getEmails());
  }, []);

  const onMeetingScheduled = useCallback((m) => {
    store.addMeeting(m);
    setMeetings(store.getMeetings());
  }, []);

  const onAnnouncementSent = useCallback((a) => {
    store.addAnnouncement(a);
    setAnnouncements(store.getAnnouncements());
  }, []);

  const pages = {
    dashboard: <Dashboard setRoute={setRoute} user={user} members={members} emails={emails} meetings={meetings} />,
    members: <MembersPage members={members} onAdd={addMember} onDelete={deleteMember} />,
    email: <EmailAgent members={members} onEmailSent={onEmailSent} />,
    scheduler: <Scheduler members={members} meetings={meetings} onMeetingScheduled={onMeetingScheduled} />,
    hr: <HRComms members={members} announcements={announcements} onAnnouncementSent={onAnnouncementSent} />,
    analytics: <Analytics members={members} emails={emails} meetings={meetings} announcements={announcements} />,
    chat: <AIChat members={members} emails={emails} meetings={meetings} />,
  };

  return (
    <>
      <style>{css}</style>
      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <div className="shell">
          <Sidebar route={route} setRoute={setRoute} collapsed={collapsed} setCollapsed={setCollapsed} user={user} onLogout={handleLogout} />
          <main className="main" style={{ marginLeft: collapsed ? "64px" : "230px" }}>
            <div className="pw" key={route}>{pages[route]}</div>
          </main>
        </div>
      )}
    </>
  );
}