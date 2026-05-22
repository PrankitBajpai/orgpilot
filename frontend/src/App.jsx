import React, { useState } from "react";
import {
  Upload,
  Receipt,
  IndianRupee,
  TrendingUp,
  FileText,
  Bot,
  AlertTriangle,
  Search,
  Download,
  Sparkles,
  BarChart3,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import "./index.css";

const categoryData = [
  { name: "Stock", value: 42000 },
  { name: "Utilities", value: 8500 },
  { name: "Rent", value: 15000 },
  { name: "Logistics", value: 6200 },
  { name: "Maintenance", value: 4300 },
];

const weeklyData = [
  { week: "Week 1", spend: 12000 },
  { week: "Week 2", spend: 18500 },
  { week: "Week 3", spend: 9100 },
  { week: "Week 4", spend: 26700 },
];

const recentReceipts = [
  {
    vendor: "Sharma Electronics",
    date: "23 May 2026",
    category: "Stock",
    amount: "₹2,780",
    gst: "₹430",
  },
  {
    vendor: "Delhivery Courier",
    date: "22 May 2026",
    category: "Logistics",
    amount: "₹1,450",
    gst: "₹221",
  },
  {
    vendor: "Office Rent",
    date: "20 May 2026",
    category: "Rent",
    amount: "₹15,000",
    gst: "₹0",
  },
];

const insights = [
  {
    type: "Urgent",
    title: "Stock expenses increased 34%",
    desc: "Your stock purchase is rising quickly. Check whether sales are growing or you are over-purchasing.",
    color: "border-red-400 bg-red-50",
  },
  {
    type: "Opportunity",
    title: "Buy LED bulbs in bulk",
    desc: "You purchased LED bulbs 4 times this month. Bulk purchase can reduce cost by around 12–18%.",
    color: "border-yellow-400 bg-yellow-50",
  },
  {
    type: "Positive",
    title: "Utility cost reduced",
    desc: "Your electricity and internet expenses are 8% lower compared to last month.",
    color: "border-green-400 bg-green-50",
  },
];

function StatCard({ title, value, icon: Icon, sub }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
          <Icon size={22} />
        </div>
        <span className="text-xs font-medium text-green-600">{sub}</span>
      </div>
      <h3 className="mt-5 text-sm text-slate-500">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </motion.div>
  );
}

export default function App() {
  const [question, setQuestion] = useState("");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed hidden lg:flex h-screen w-72 flex-col bg-slate-950 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-400 flex items-center justify-center text-slate-950">
            <Receipt />
          </div>
          <div>
            <h1 className="text-xl font-bold">ReceiptBrain</h1>
            <p className="text-xs text-slate-400">AI Business Copilot</p>
          </div>
        </div>

        <nav className="mt-10 space-y-3">
          {[
            ["Dashboard", BarChart3],
            ["Upload Receipt", Upload],
            ["GST Reports", FileText],
            ["AI Insights", Sparkles],
            ["Ask AI", MessageCircle],
          ].map(([item, Icon]) => (
            <button
              key={item}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <Icon size={18} />
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl bg-white/10 p-4">
          <p className="text-sm font-semibold">Agent Status</p>
          <p className="mt-1 text-xs text-slate-400">
            OCR, GST, RAG, BI and anomaly agents active.
          </p>
        </div>
      </aside>

      <main className="lg:ml-72 p-5 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-600">
              Small Business AI Dashboard
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Welcome back, Prankit
            </h2>
            <p className="text-slate-500 mt-1">
              Track receipts, GST, expenses and business growth insights.
            </p>
          </div>

          <button className="rounded-2xl bg-slate-950 text-white px-5 py-3 flex items-center gap-2 shadow">
            <Download size={18} />
            Generate Monthly Report
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
          <StatCard title="Total Spent" value="₹76,000" icon={IndianRupee} sub="+12%" />
          <StatCard title="GST Claimable" value="₹8,430" icon={ShieldCheck} sub="May 2026" />
          <StatCard title="Receipts" value="38" icon={Receipt} sub="+9 new" />
          <StatCard title="Predicted Expense" value="₹84,500" icon={TrendingUp} sub="Next month" />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          <div className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold">Weekly Spending</h3>
                <p className="text-sm text-slate-500">Expense trend by week</p>
              </div>
              <AlertTriangle className="text-yellow-500" />
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="spend" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold">Category Split</h3>
            <p className="text-sm text-slate-500">Where money is going</p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={95}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold">Upload Receipt</h3>
            <p className="text-sm text-slate-500">
              Upload image or PDF. AI agents will extract, categorize and store it.
            </p>

            <div className="mt-5 border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center bg-slate-50">
              <Upload className="mx-auto mb-4 text-slate-500" size={40} />
              <p className="font-semibold">Drop receipt here</p>
              <p className="text-sm text-slate-500 mt-1">PNG, JPG or PDF supported</p>
              <button className="mt-5 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white">
                Choose File
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-sm">
              {["OCR Agent", "Parser Agent", "GST Agent", "RAG Agent"].map((agent) => (
                <div key={agent} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 font-medium">
                  {agent}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold">Recent Receipts</h3>
            <p className="text-sm text-slate-500">Latest uploaded transactions</p>

            <div className="mt-5 space-y-4">
              {recentReceipts.map((r) => (
                <div key={r.vendor} className="rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold">{r.vendor}</p>
                    <p className="text-sm text-slate-500">{r.date}</p>
                    <span className="inline-block mt-2 rounded-full bg-slate-100 px-3 py-1 text-xs">
                      {r.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{r.amount}</p>
                    <p className="text-sm text-green-600">GST {r.gst}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-500" />
            <div>
              <h3 className="text-xl font-bold">AI Business Intelligence</h3>
              <p className="text-sm text-slate-500">
                Suggestions to reduce cost and improve business growth
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            {insights.map((item) => (
              <div key={item.title} className={`rounded-3xl border-l-4 p-5 ${item.color}`}>
                <p className="text-xs font-bold uppercase">{item.type}</p>
                <h4 className="font-bold mt-2">{item.title}</h4>
                <p className="text-sm text-slate-600 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-slate-950 text-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Bot className="text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold">Ask ReceiptBrain AI</h3>
              <p className="text-sm text-slate-400">
                RAG chatbot answers from your MongoDB + FAISS receipt data.
              </p>
            </div>
          </div>

          <div className="mt-5 bg-white/10 rounded-3xl p-5">
            <p className="text-sm text-slate-300">Example AI Answer</p>
            <p className="mt-2">
              “You spent ₹42,000 on stock this month. Your highest stock vendor is
              Sharma Electronics. Buying LED bulbs in bulk can reduce cost.”
            </p>
          </div>

          <div className="mt-5 flex flex-col md:flex-row gap-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask: How much did I spend on stock this month?"
              className="flex-1 rounded-2xl px-5 py-4 text-slate-900 outline-none"
            />
            <button className="rounded-2xl bg-emerald-500 px-6 py-4 font-bold flex items-center justify-center gap-2">
              <Search size={18} />
              Ask AI
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}