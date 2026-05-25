import { useState, useRef, useEffect } from "react";

const API_URL = "http://localhost:8000/api";

/* ─── STYLES ─── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
:root{--bg:#0b0c10;--bg2:#111318;--bg3:#181b22;--border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);--accent:#4f8ef7;--accent2:#7c6af7;--accent3:#f74f8e;--success:#3ecf8e;--warning:#f5a623;--danger:#f74f4f;--text:#f0f2f8;--text2:#8b90a0;--text3:#555a6a;--radius:12px;--radius-sm:8px;--radius-lg:18px;--fd:'Syne',sans-serif;--fb:'DM Sans',sans-serif;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--text);font-family:var(--fb);font-size:14px;line-height:1.6;overflow:hidden;height:100vh;}
.shell{display:flex;height:100vh;overflow:hidden;}
.main{flex:1;overflow-y:auto;height:100vh;background:var(--bg);transition:margin-left 0.3s;}
.pw{padding:28px 32px;max-width:1100px;margin:0 auto;animation:fadeUp 0.35s ease;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.pt{font-family:var(--fd);font-size:26px;font-weight:700;letter-spacing:-0.5px;margin-bottom:3px;}
.ps{font-size:12px;color:var(--text2);margin-bottom:24px;}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:20px 22px;}
.csm{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:15px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:15px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
@media(max-width:900px){.g4{grid-template-columns:1fr 1fr;}.g3{grid-template-columns:1fr 1fr;}.g2{grid-template-columns:1fr;}}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-sm);font-family:var(--fb);font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all 0.18s;}
.bp{background:var(--accent);color:#fff;box-shadow:0 0 18px rgba(79,142,247,0.22);}
.bp:hover{background:#6aa0ff;transform:translateY(-1px);}
.bg{background:transparent;color:var(--text2);border:1px solid var(--border2);}
.bg:hover{background:var(--bg3);color:var(--text);}
.bs{background:rgba(62,207,142,0.12);color:var(--success);border:1px solid rgba(62,207,142,0.28);}
.inp,.ta,.sel{width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);font-family:var(--fb);font-size:13px;padding:9px 13px;outline:none;transition:border-color 0.2s;}
.inp:focus,.ta:focus,.sel:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,142,247,0.1);}
.ta{resize:vertical;min-height:80px;line-height:1.6;}
.sel{appearance:none;cursor:pointer;}
.inp::placeholder,.ta::placeholder{color:var(--text3);}
.lbl{font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:5px;display:block;}
.fg{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:500;}
.bb{background:rgba(79,142,247,0.14);color:var(--accent);}
.bg2c{background:rgba(62,207,142,0.14);color:var(--success);}
.br{background:rgba(247,79,79,0.14);color:var(--danger);}
.bo{background:rgba(245,166,35,0.14);color:var(--warning);}
.bpu{background:rgba(124,106,247,0.14);color:var(--accent2);}
.bpk{background:rgba(247,79,142,0.14);color:var(--accent3);}
.div{height:1px;background:var(--border);margin:16px 0;}
.sc{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;display:flex;flex-direction:column;gap:7px;position:relative;overflow:hidden;}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.sc.blue::before{background:linear-gradient(90deg,var(--accent),transparent);}
.sc.purple::before{background:linear-gradient(90deg,var(--accent2),transparent);}
.sc.green::before{background:linear-gradient(90deg,var(--success),transparent);}
.sc.pink::before{background:linear-gradient(90deg,var(--accent3),transparent);}
.sc.orange::before{background:linear-gradient(90deg,var(--warning),transparent);}
.sv{font-family:var(--fd);font-size:24px;font-weight:700;color:var(--text);line-height:1;}
.sl{font-size:12px;color:var(--text2);}
.sch{font-size:11px;margin-top:3px;}
.sch.up{color:var(--success);}.sch.dn{color:var(--danger);}
.sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.st{font-family:var(--fd);font-size:14px;font-weight:600;color:var(--text);}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;padding:9px 13px;text-align:left;border-bottom:1px solid var(--border);}
.tbl td{padding:11px 13px;border-bottom:1px solid var(--border);font-size:13px;color:var(--text2);}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:var(--bg3);color:var(--text);}
.tag{display:inline-flex;align-items:center;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:3px 9px;font-size:12px;color:var(--text2);gap:5px;}
.tag button{background:none;border:none;cursor:pointer;color:var(--text3);font-size:14px;line-height:1;padding:0;}
.tag button:hover{color:var(--danger);}
.pt-track{height:6px;background:var(--bg3);border-radius:3px;overflow:hidden;}
.pt-fill{height:100%;border-radius:3px;transition:width 0.8s ease;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}
.av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0;}
.ado{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;}
.ado.done{background:rgba(62,207,142,0.14);color:var(--success);}
.ado.active{background:rgba(79,142,247,0.14);color:var(--accent);animation:glow 1.5s infinite;}
.ado.idle{background:var(--bg3);color:var(--text3);}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(79,142,247,0.3);}50%{box-shadow:0 0 0 5px rgba(79,142,247,0);}}
.asp{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);}
.asp:last-child{border-bottom:none;}
.spin{width:14px;height:14px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-5px);opacity:1}}

/* ─── AUTH STYLES ─── */
.auth-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden;}
.auth-blob1{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(79,142,247,0.07) 0%,transparent 70%);top:-100px;left:-100px;pointer-events:none;}
.auth-blob2{position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(124,106,247,0.06) 0%,transparent 70%);bottom:-50px;right:-50px;pointer-events:none;}
.auth-card{width:100%;max-width:420px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);padding:36px;position:relative;z-index:1;animation:fadeUp 0.4s ease;}
.auth-logo{display:flex;align-items:center;gap:12px;margin-bottom:28px;justify-content:center;}
.auth-logo-icon{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#4f8ef7,#7c6af7);display:flex;align-items:center;justify-content:center;font-size:20px;}
.auth-logo-text{font-family:var(--fd);font-size:22px;font-weight:700;color:var(--text);letter-spacing:-0.5px;}
.auth-title{font-family:var(--fd);font-size:20px;font-weight:700;color:var(--text);margin-bottom:4px;text-align:center;}
.auth-sub{font-size:12px;color:var(--text2);text-align:center;margin-bottom:24px;}
.auth-tabs{display:flex;background:var(--bg3);border-radius:var(--radius-sm);padding:3px;margin-bottom:22px;}
.auth-tab{flex:1;padding:8px;text-align:center;font-size:13px;font-weight:500;border-radius:6px;cursor:pointer;border:none;background:transparent;transition:all 0.2s;font-family:var(--fb);}
.auth-tab.active{background:var(--bg2);color:var(--accent);box-shadow:0 1px 4px rgba(0,0,0,0.3);}
.auth-tab:not(.active){color:var(--text3);}
.auth-err{background:rgba(247,79,79,0.1);border:1px solid rgba(247,79,79,0.25);border-radius:var(--radius-sm);padding:10px 13px;font-size:12px;color:var(--danger);margin-bottom:12px;}
.auth-ok{background:rgba(62,207,142,0.1);border:1px solid rgba(62,207,142,0.25);border-radius:var(--radius-sm);padding:10px 13px;font-size:12px;color:var(--success);margin-bottom:12px;}
.auth-inp-wrap{position:relative;margin-bottom:13px;}
.auth-inp-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text3);pointer-events:none;}
.auth-inp{width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius-sm);color:var(--text);font-family:var(--fb);font-size:13px;padding:10px 13px 10px 36px;outline:none;transition:border-color 0.2s;}
.auth-inp:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,142,247,0.1);}
.auth-inp::placeholder{color:var(--text3);}
.auth-btn{width:100%;padding:11px;border-radius:var(--radius-sm);border:none;background:var(--accent);color:#fff;font-family:var(--fd);font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;letter-spacing:0.3px;}
.auth-btn:hover{background:#6aa0ff;transform:translateY(-1px);box-shadow:0 4px 16px rgba(79,142,247,0.3);}
.auth-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
.auth-divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--text3);font-size:12px;}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--border);}
`;

/* ─── MOCK DATA ─── */
const employees=[
  {id:1,name:"Priya Sharma",email:"priya@org.com",dept:"Engineering",role:"Senior Dev",av:"PS",color:"#4f8ef7"},
  {id:2,name:"Rahul Verma",email:"rahul@org.com",dept:"Sales",role:"Sales Lead",av:"RV",color:"#7c6af7"},
  {id:3,name:"Ananya Patel",email:"ananya@org.com",dept:"HR",role:"HR Manager",av:"AP",color:"#3ecf8e"},
  {id:4,name:"Karan Singh",email:"karan@org.com",dept:"Engineering",role:"Dev",av:"KS",color:"#f74f8e"},
  {id:5,name:"Meera Nair",email:"meera@org.com",dept:"Marketing",role:"Designer",av:"MN",color:"#f5a623"},
  {id:6,name:"Arjun Das",email:"arjun@org.com",dept:"Finance",role:"Analyst",av:"AD",color:"#4f8ef7"},
  {id:7,name:"Sneha Gupta",email:"sneha@org.com",dept:"Engineering",role:"Dev",av:"SG",color:"#7c6af7"},
  {id:8,name:"Vikram Joshi",email:"vikram@org.com",dept:"Sales",role:"BDM",av:"VJ",color:"#3ecf8e"},
];
const depts=["All Departments","Engineering","Sales","HR","Marketing","Finance"];
const tones=["Professional","Friendly","Urgent","Congratulatory","Formal","Casual"];
const meetings=[
  {id:1,title:"Sprint Planning",time:"Today, 3:00 PM",att:["PS","KS","SG"],dept:"Engineering",status:"upcoming"},
  {id:2,title:"Sales Review",time:"Tomorrow, 11:00 AM",att:["RV","VJ"],dept:"Sales",status:"upcoming"},
  {id:3,title:"All Hands",time:"Jun 5, 10:00 AM",att:["PS","RV","AP","KS"],dept:"All",status:"scheduled"},
];
const recentEmails=[
  {id:1,subject:"Q2 Deadline Reminder",to:"All Developers (12)",sent:"2 min ago",opens:8},
  {id:2,subject:"Monthly Payslip — May 2026",to:"All Employees (248)",sent:"1 hr ago",opens:201},
  {id:3,subject:"Client Meeting Follow-up",to:"Sales Team (24)",sent:"3 hr ago",opens:19},
  {id:4,subject:"Office Closure — June 12",to:"All Employees (248)",sent:"Yesterday",opens:230},
];
const agentStatusList=[
  {name:"Email Composer Agent",status:"done",desc:"Drafted 14 emails"},
  {name:"Bulk Sender Agent",status:"active",desc:"Sending to 248 employees..."},
  {name:"Calendar Scheduler Agent",status:"done",desc:"3 meetings booked"},
  {name:"Follow-up Agent",status:"active",desc:"Monitoring 6 threads"},
  {name:"HR Broadcast Agent",status:"done",desc:"Payslips distributed"},
  {name:"Analytics Agent",status:"idle",desc:"Waiting for next trigger"},
];
const weekData=[42,78,55,91,63,88,72];
const weekDays=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const deptStats=[
  {name:"Engineering",sent:412,opens:380,rate:92,color:"#4f8ef7"},
  {name:"Sales",sent:284,opens:241,rate:85,color:"#7c6af7"},
  {name:"HR",sent:248,opens:230,rate:93,color:"#3ecf8e"},
  {name:"Marketing",sent:156,opens:124,rate:80,color:"#f74f8e"},
  {name:"Finance",sent:98,opens:79,rate:81,color:"#f5a623"},
];
const insights=[
  {icon:"📈",color:"#3ecf8e",title:"Email open rate up 6%",desc:"Engineering dept highest engagement at 92%"},
  {icon:"⚡",color:"#4f8ef7",title:"Best send time: 9–10 AM",desc:"Morning emails get 34% more opens than afternoon"},
  {icon:"⚠️",color:"#f5a623",title:"Marketing needs attention",desc:"Open rate dropped — try shorter subject lines"},
  {icon:"🎯",color:"#7c6af7",title:"Follow-ups boosted replies 28%",desc:"Automated follow-up agent is working great"},
];
const agentSteps=["Understanding intent & context","Fetching target employees","Generating personalized emails","Checking tone & quality","Sending via Gmail API","Logging to analytics"];
const hrTypes=["Announcement","Policy Update","Birthday Wish","Payslip","Leave Approval","Onboarding"];
const chatSuggestions=["Send deadline reminder to all developers","How many emails sent this week?","Schedule a team meeting for tomorrow","Which dept has lowest open rate?","Generate monthly HR report"];
const NAV=[
  {id:"dashboard",icon:"⊞",label:"Dashboard"},
  {id:"email",icon:"✉",label:"Email Agent"},
  {id:"scheduler",icon:"◫",label:"Scheduler"},
  {id:"hr",icon:"◈",label:"HR Comms"},
  {id:"analytics",icon:"▦",label:"Analytics"},
  {id:"chat",icon:"◉",label:"AI Chat"},
];

/* ─── API HELPER ─── */
const api = {
  post: async (endpoint, body) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");
    return data;
  },
  get: async (endpoint) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Request failed");
    return data;
  },
};

/* ═══════════════════════════════════════
   AUTH PAGES
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
    e.preventDefault();
    reset(); setLoading(true);
    try {
      const data = await api.post("/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      onLogin({ name: data.name, email: data.email });
    } catch (err) {
      setErr(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    reset(); setLoading(true);
    try {
      const data = await api.post("/register", { name, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      setOk("Account created! Welcome to OrgPilot 🎉");
      setTimeout(() => onLogin({ name: data.name, email: data.email }), 800);
    } catch (err) {
      setErr(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-blob1" />
      <div className="auth-blob2" />
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
            {loading ? <><div className="spin" /> {tab === "login" ? "Signing in..." : "Creating account..."}</> : tab === "login" ? "Sign In →" : "Create Account →"}
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
  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "AD";
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
   DASHBOARD
═══════════════════════════════════════ */
function Dashboard({ setRoute, user }) {
  const stats = [
    { label: "Emails Sent Today", value: "1,284", change: "+18% vs yesterday", color: "blue", icon: "✉" },
    { label: "Active Agents", value: "8", change: "All running", color: "purple", icon: "⬡" },
    { label: "Meetings Scheduled", value: "24", change: "+3 this week", color: "green", icon: "◫" },
    { label: "Avg Open Rate", value: "84%", change: "+6% vs last month", color: "pink", icon: "◉" },
  ];
  const firstName = user?.name?.split(" ")[0] || "Admin";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div className="pt">Good morning, {firstName} 👋</div>
          <div className="ps">Here's what OrgPilot has been doing for your organization today</div>
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
            <div className="sch up">↑ {s.change}</div>
          </div>
        ))}
      </div>
      <div className="g2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="sh"><div className="st">🤖 Live Agent Status</div><span className="badge bg2c">8 Online</span></div>
          {agentStatusList.map(a => (
            <div key={a.name} className="asp">
              <div className={`ado ${a.status}`}>{a.status === "done" ? "✓" : a.status === "active" ? "●" : "○"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>{a.desc}</div>
              </div>
              <span className={`badge ${a.status === "done" ? "bg2c" : a.status === "active" ? "bb" : "bo"}`}>{a.status}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="sh"><div className="st">📅 Upcoming Meetings</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {meetings.map(m => (
              <div key={m.id} className="csm" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(79,142,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>◫</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>{m.time} · {m.dept}</div>
                </div>
                <div style={{ display: "flex" }}>{m.att.slice(0, 3).map((a, i) => <div key={i} className="av" style={{ background: "rgba(79,142,247,0.14)", color: "#4f8ef7", fontSize: 9, width: 22, height: 22, marginLeft: i > 0 ? -5 : 0, border: "2px solid var(--bg2)" }}>{a}</div>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="sh"><div className="st">✉ Recent Emails</div></div>
        <table className="tbl">
          <thead><tr><th>Subject</th><th>Recipients</th><th>Sent</th><th>Opens</th><th>Status</th></tr></thead>
          <tbody>
            {recentEmails.map(e => (
              <tr key={e.id}>
                <td style={{ color: "var(--text)", fontWeight: 500 }}>{e.subject}</td>
                <td>{e.to}</td><td>{e.sent}</td>
                <td><span style={{ color: "var(--success)" }}>{e.opens}</span></td>
                <td><span className="badge bg2c">✓ sent</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   EMAIL AGENT
═══════════════════════════════════════ */
function EmailAgent() {
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

  const filtered = dept === "All Departments" ? employees : employees.filter(e => e.dept === dept);
  const addTag = e => { if (e.key === "Enter" && tagIn.trim()) { setTags([...tags, tagIn.trim()]); setTagIn(""); } };
  const removeTag = i => setTags(tags.filter((_, idx) => idx !== i));

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setSent(false); setEmail(null); setDoneSteps([]);
    for (let i = 0; i < agentSteps.length; i++) { setActiveStep(i); await new Promise(r => setTimeout(r, 650)); setDoneSteps(p => [...p, i]); }
    setActiveStep(-1);
    try {
      const recips = filtered.map(e => `${e.name} (${e.role}, ${e.dept})`).join(", ");
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: `You are OrgPilot AI email agent. Generate an org email:\n- Topic: ${topic}\n- Dept: ${dept}\n- Recipients: ${recips}\n- Tone: ${tone}\n- Context: ${extra || "None"}\n- Tags: ${tags.join(", ") || "None"}\n\nRespond ONLY with valid JSON no markdown:\n{"subject":"...","body":"full email body with proper paragraphs...","recipient_count":${filtered.length},"estimated_open_rate":"XX%"}` }] }) });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "{}";
      setEmail(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      setEmail({ subject: `${topic} — Update`, body: `Dear Team,\n\nThis is regarding: ${topic}.\n\nPlease review and act accordingly.\n\nBest regards,\nOrgPilot AI`, recipient_count: filtered.length, estimated_open_rate: "82%" });
    }
    setLoading(false);
  };

  const sendEmail = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true); setLoading(false);
  };

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
              <div className="fg"><label className="lbl">Department</label><select className="sel" value={dept} onChange={e => setDept(e.target.value)}>{depts.map(d => <option key={d}>{d}</option>)}</select></div>
              <div className="fg"><label className="lbl">Tone</label><select className="sel" value={tone} onChange={e => setTone(e.target.value)}>{tones.map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            <div className="fg"><label className="lbl">Additional Context</label><input className="inp" placeholder="e.g. Include dashboard link, mention project XYZ" value={extra} onChange={e => setExtra(e.target.value)} /></div>
            <div className="fg">
              <label className="lbl">Tags</label>
              <input className="inp" placeholder="Type and press Enter" value={tagIn} onChange={e => setTagIn(e.target.value)} onKeyDown={addTag} />
              {tags.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>{tags.map((t, i) => <div key={i} className="tag">{t}<button onClick={() => removeTag(i)}>×</button></div>)}</div>}
            </div>
            <button className="btn bp" onClick={generate} disabled={loading || !topic.trim()} style={{ width: "100%", justifyContent: "center", opacity: !topic.trim() ? 0.5 : 1 }}>
              {loading ? <><div className="spin" />Generating...</> : "⚡ Generate with AI"}
            </button>
          </div>
          <div className="card">
            <div className="sh"><div className="st">👥 Recipients</div><span className="badge bb">{filtered.length} employees</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 180, overflowY: "auto" }}>
              {filtered.map(e => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="av" style={{ background: e.color + "22", color: e.color, fontSize: 10 }}>{e.av}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{e.name}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{e.email}</div></div>
                  <span className="badge bpu" style={{ fontSize: 10 }}>{e.dept}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="st" style={{ marginBottom: 12 }}>🤖 Agent Pipeline</div>
            {agentSteps.map((step, i) => (
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
                <div style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.22)", borderRadius: "var(--radius-sm)", padding: "11px", color: "var(--success)", fontSize: 13, textAlign: "center" }}>✓ Email sent to {email.recipient_count} employees!</div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn bg" style={{ flex: 1, justifyContent: "center" }}>✎ Edit</button>
                  <button className="btn bp" style={{ flex: 2, justifyContent: "center" }} onClick={sendEmail} disabled={loading}>
                    {loading ? <><div className="spin" />Sending...</> : `🚀 Send to ${email.recipient_count}`}
                  </button>
                </div>
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
function Scheduler() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selEmps, setSelEmps] = useState([]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [agenda, setAgenda] = useState("");
  const [scheduled, setScheduled] = useState(false);

  const toggleEmp = id => setSelEmps(p => p.includes(id) ? p.filter(e => e !== id) : [...p, id]);

  const genAgenda = async () => {
    if (!title.trim()) return; setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 400, messages: [{ role: "user", content: `Generate a concise meeting agenda for "${title}". Context: ${context || "Team meeting"}. Plain text, numbered items, max 5. Start with "1."` }] }) });
      const data = await res.json();
      setAgenda(data.content?.map(c => c.text || "").join("") || "");
    } catch { setAgenda("1. Welcome & attendance\n2. Review action items\n3. Main discussion\n4. Q&A\n5. Next steps"); }
    setLoading(false);
  };

  const schedule = async () => { setLoading(true); await new Promise(r => setTimeout(r, 1100)); setScheduled(true); setLoading(false); };

  return (
    <div>
      <div className="pt">◫ Meeting Scheduler</div>
      <div className="ps">AI finds best time slots and sends calendar invites automatically</div>
      <div className="g2">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="st" style={{ marginBottom: 14 }}>📅 Schedule a Meeting</div>
            <div className="fg"><label className="lbl">Meeting Title</label><input className="inp" placeholder="e.g. Sprint Planning..." value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div className="g2">
              <div className="fg"><label className="lbl">Date</label><input className="inp" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="fg"><label className="lbl">Time</label><input className="inp" type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
            </div>
            <div className="fg"><label className="lbl">Meeting Context</label><textarea className="ta" placeholder="What will be discussed?" value={context} onChange={e => setContext(e.target.value)} style={{ minHeight: 65 }} /></div>
            <button className="btn bg" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={genAgenda} disabled={loading || !title.trim()}>
              {loading ? <><div className="spin" />Generating agenda...</> : "✨ AI Generate Agenda"}
            </button>
            {agenda && <div style={{ background: "var(--bg3)", borderRadius: "var(--radius-sm)", padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 7, letterSpacing: "1px" }}>AI GENERATED AGENDA</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{agenda}</div>
            </div>}
            {scheduled ? <div style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.22)", borderRadius: "var(--radius-sm)", padding: "11px", color: "var(--success)", fontSize: 13, textAlign: "center" }}>✓ Scheduled! Invites sent to {selEmps.length || "all"} attendees.</div>
              : <button className="btn bp" style={{ width: "100%", justifyContent: "center" }} onClick={schedule} disabled={loading || !title.trim()}>🗓 Schedule & Send Invites</button>}
          </div>
          <div className="card">
            <div className="st" style={{ marginBottom: 12 }}>Upcoming Meetings</div>
            {meetings.map(m => (
              <div key={m.id} className="csm" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(79,142,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>◫</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{m.title}</div><div style={{ fontSize: 11, color: "var(--text2)" }}>{m.time}</div></div>
                <span className={`badge ${m.status === "upcoming" ? "bg2c" : "bb"}`}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="sh"><div className="st">👥 Select Attendees</div><span className="badge bb">{selEmps.length} selected</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {employees.map(e => {
              const sel = selEmps.includes(e.id);
              return (
                <div key={e.id} onClick={() => toggleEmp(e.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: "var(--radius-sm)", background: sel ? "rgba(79,142,247,0.08)" : "var(--bg3)", border: sel ? "1px solid rgba(79,142,247,0.25)" : "1px solid var(--border)", cursor: "pointer", transition: "all 0.14s" }}>
                  <div className="av" style={{ background: e.color + "22", color: e.color, fontSize: 10 }}>{e.av}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{e.name}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{e.role} · {e.dept}</div></div>
                  <div style={{ width: 17, height: 17, borderRadius: 4, background: sel ? "var(--accent)" : "transparent", border: sel ? "none" : "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", flexShrink: 0 }}>{sel ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
          <button className="btn bg" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => setSelEmps(selEmps.length === employees.length ? [] : employees.map(e => e.id))}>
            {selEmps.length === employees.length ? "Deselect all" : "Select all"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   HR COMMS
═══════════════════════════════════════ */
function HRComms() {
  const [type, setType] = useState("Announcement");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState("");
  const [sent, setSent] = useState(false);
  const announcements = [
    { id: 1, title: "New WFH Policy", type: "Policy", date: "May 24", reach: 248, reads: 210 },
    { id: 2, title: "Q2 Performance Bonuses", type: "HR", date: "May 20", reach: 248, reads: 245 },
    { id: 3, title: "Office Renovation Update", type: "Facility", date: "May 18", reach: 248, reads: 189 },
  ];

  const generate = async () => {
    if (!content.trim()) return; setLoading(true); setSent(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 500, messages: [{ role: "user", content: `You are OrgPilot HR Agent. Generate a ${type} message.\nTopic: ${content}\nWrite professionally in 3-4 sentences. No subject line. Sign as "OrgPilot HR Agent".` }] }) });
      const data = await res.json();
      setGenerated(data.content?.map(c => c.text || "").join("") || "");
    } catch { setGenerated(`Dear Team,\n\nWe have an important ${type.toLowerCase()} regarding ${content}. Please review and contact HR for queries.\n\nBest,\nOrgPilot HR Agent`); }
    setLoading(false);
  };

  const send = async () => { setLoading(true); await new Promise(r => setTimeout(r, 900)); setSent(true); setLoading(false); };

  return (
    <div>
      <div className="pt">◈ HR Communications</div>
      <div className="ps">Automate all HR announcements, payslips, onboarding, and employee communications</div>
      <div className="g2">
        <div className="card">
          <div className="st" style={{ marginBottom: 14 }}>📢 New HR Communication</div>
          <div className="fg">
            <label className="lbl">Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {hrTypes.map(t => <button key={t} onClick={() => setType(t)} style={{ padding: "5px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "DM Sans,sans-serif", background: type === t ? "rgba(79,142,247,0.14)" : "var(--bg3)", border: type === t ? "1px solid rgba(79,142,247,0.35)" : "1px solid var(--border)", color: type === t ? "var(--accent)" : "var(--text2)", transition: "all 0.14s" }}>{t}</button>)}
            </div>
          </div>
          <div className="fg"><label className="lbl">Message Details</label><textarea className="ta" placeholder="Describe the announcement details..." value={content} onChange={e => setContent(e.target.value)} /></div>
          <button className="btn bp" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={generate} disabled={loading || !content.trim()}>
            {loading ? <><div className="spin" />Generating...</> : "✨ Generate HR Message"}
          </button>
          {generated && <div>
            <div style={{ background: "var(--bg3)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 7, letterSpacing: "1px" }}>AI GENERATED MESSAGE</div>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{generated}</div>
            </div>
            {sent ? <div style={{ background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.22)", borderRadius: "var(--radius-sm)", padding: "11px", color: "var(--success)", fontSize: 13, textAlign: "center" }}>✓ Sent to all employees!</div>
              : <button className="btn bs" style={{ width: "100%", justifyContent: "center" }} onClick={send} disabled={loading}>📤 Send to All Employees</button>}
          </div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="sh"><div className="st">🎂 Birthdays Today</div><span className="badge bpk">Auto-sending</span></div>
            {employees.slice(0, 2).map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <div className="av" style={{ background: e.color + "22", color: e.color }}>{e.av}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{e.name}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{e.dept}</div></div>
                <span className="badge bg2c">✓ Wish sent</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="st" style={{ marginBottom: 12 }}>📋 Recent Announcements</div>
            {announcements.map(a => (
              <div key={a.id} className="csm" style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{a.title}</div>
                  <span className="badge bb">{a.type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{a.date} · {a.reach} recipients</div>
                  <div style={{ fontSize: 11, color: "var(--success)" }}>{a.reads} reads</div>
                </div>
                <div className="pt-track" style={{ marginTop: 7 }}><div className="pt-fill" style={{ width: `${(a.reads / a.reach) * 100}%`, background: "linear-gradient(90deg,var(--success),var(--accent))" }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ANALYTICS
═══════════════════════════════════════ */
function Analytics() {
  const maxW = Math.max(...weekData);
  return (
    <div>
      <div className="pt">▦ Analytics</div>
      <div className="ps">Deep insights into your organization's communication performance</div>
      <div className="g4" style={{ marginBottom: 18 }}>
        {[
          { label: "Total Emails Sent", value: "12,840", change: "+18%", color: "blue" },
          { label: "Avg Open Rate", value: "84%", change: "+6%", color: "green" },
          { label: "Meetings Held", value: "94", change: "+12%", color: "purple" },
          { label: "Response Rate", value: "67%", change: "+28%", color: "pink" },
        ].map(s => (
          <div key={s.label} className={`sc ${s.color}`}>
            <div className="sv">{s.value}</div>
            <div className="sl">{s.label}</div>
            <div className="sch up">↑ {s.change} this month</div>
          </div>
        ))}
      </div>
      <div className="g2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="st" style={{ marginBottom: 14 }}>📈 Emails Sent — This Week</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 110, marginBottom: 7 }}>
            {weekData.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ fontSize: 10, color: "var(--text2)" }}>{v}</div>
                <div style={{ width: "100%", height: `${(v / maxW) * 90}px`, background: i === 3 ? "linear-gradient(180deg,#4f8ef7,#7c6af7)" : "rgba(79,142,247,0.28)", borderRadius: "4px 4px 0 0" }} />
                <div style={{ fontSize: 10, color: "var(--text3)" }}>{weekDays[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>Peak: <span style={{ color: "var(--accent)" }}>Thursday (91)</span></div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>Total: <span style={{ color: "var(--text)" }}>489 this week</span></div>
          </div>
        </div>
        <div className="card">
          <div className="st" style={{ marginBottom: 12 }}>🤖 AI Business Insights</div>
          {insights.map((ins, i) => (
            <div key={i} className="csm" style={{ display: "flex", gap: 11, alignItems: "flex-start", marginBottom: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, background: ins.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{ins.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{ins.title}</div>
                <div style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.5 }}>{ins.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="st" style={{ marginBottom: 14 }}>🏢 Department Performance</div>
        <table className="tbl">
          <thead><tr><th>Department</th><th>Sent</th><th>Opens</th><th>Open Rate</th><th>Performance</th></tr></thead>
          <tbody>
            {deptStats.map(d => (
              <tr key={d.name}>
                <td><div style={{ display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} /><span style={{ color: "var(--text)", fontWeight: 500 }}>{d.name}</span></div></td>
                <td>{d.sent}</td><td>{d.opens}</td>
                <td><span style={{ color: d.rate >= 90 ? "var(--success)" : d.rate >= 85 ? "var(--accent)" : "var(--warning)" }}>{d.rate}%</span></td>
                <td style={{ minWidth: 120 }}><div className="pt-track"><div className="pt-fill" style={{ width: `${d.rate}%`, background: d.color }} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   AI CHAT
═══════════════════════════════════════ */
const SYSTEM = `You are OrgPilot, an intelligent AI communication agent for organizations. Help managers:
- Draft and send bulk emails to employees
- Schedule meetings and calendar invites
- Handle HR communications (announcements, payslips, etc.)
- Analyze communication analytics and provide business intelligence

Org data: 248 employees, Departments: Engineering(45), Sales(38), HR(12), Marketing(28), Finance(18). 
This month: 12,840 emails sent, 84% avg open rate, 94 meetings scheduled. 
Engineering top performer (92% open rate). Marketing needs attention (80% open rate).

Be conversational, specific with numbers, and actionable. Keep responses concise.`;

function AIChat() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hey! 👋 I'm OrgPilot AI. I can help you send bulk emails, schedule meetings, broadcast HR announcements, and analyze your communication data. What would you like to do?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, system: SYSTEM, messages: updated.map(m => ({ role: m.role, content: m.content })) }) });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("") || "I'm here to help!";
      setMessages(p => [...p, { role: "assistant", content: reply }]);
    } catch { setMessages(p => [...p, { role: "assistant", content: "Sorry, connectivity issue. Please try again!" }]); }
    setLoading(false);
  };

  return (
    <div>
      <div className="pt">◉ AI Chat</div>
      <div className="ps">Talk to OrgPilot in plain English — it handles everything automatically</div>
      <div className="g2">
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "68vh" }}>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 13, paddingBottom: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 9, alignItems: "flex-start" }}>
                {m.role === "assistant" && <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg,#4f8ef7,#7c6af7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬡</div>}
                <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: m.role === "user" ? "15px 15px 4px 15px" : "15px 15px 15px 4px", background: m.role === "user" ? "linear-gradient(135deg,#4f8ef7,#4f46e5)" : "var(--bg3)", border: m.role === "assistant" ? "1px solid var(--border)" : "none", fontSize: 13, lineHeight: 1.75, color: "var(--text)", whiteSpace: "pre-line" }}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#4f8ef7,#7c6af7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⬡</div>
              <div style={{ padding: "11px 15px", background: "var(--bg3)", borderRadius: "15px 15px 15px 4px", border: "1px solid var(--border)", display: "flex", gap: 5 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>}
            <div ref={endRef} />
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", gap: 7 }}>
            <input className="inp" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything or give a command..." style={{ flex: 1 }} />
            <button className="btn bp" onClick={() => send()} disabled={loading || !input.trim()} style={{ flexShrink: 0 }}>→</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="st" style={{ marginBottom: 12 }}>💡 Try asking...</div>
            {chatSuggestions.map(s => (
              <button key={s} onClick={() => send(s)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "9px 13px", color: "var(--text2)", fontSize: 12, cursor: "pointer", fontFamily: "DM Sans,sans-serif", textAlign: "left", display: "flex", alignItems: "center", gap: 7, width: "100%", marginBottom: 6 }}>
                <span style={{ color: "var(--accent)" }}>→</span>{s}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="st" style={{ marginBottom: 12 }}>🤖 Capabilities</div>
            {[
              { icon: "✉", label: "Compose & send bulk emails", color: "#4f8ef7" },
              { icon: "◫", label: "Schedule meetings & invites", color: "#7c6af7" },
              { icon: "◈", label: "Broadcast HR announcements", color: "#3ecf8e" },
              { icon: "▦", label: "Analyze communication data", color: "#f74f8e" },
              { icon: "🔔", label: "Auto follow-up on no reply", color: "#f5a623" },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: c.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ROOT APP — AUTH GUARD
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

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser(null);
    setRoute("dashboard");
  };

  const pages = {
    dashboard: <Dashboard setRoute={setRoute} user={user} />,
    email: <EmailAgent />,
    scheduler: <Scheduler />,
    hr: <HRComms />,
    analytics: <Analytics />,
    chat: <AIChat />,
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