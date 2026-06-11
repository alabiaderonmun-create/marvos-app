// @ts-nocheck
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  getProducts as getProductsFn,
  getCustomers as getCustomersFn,
  getRecentTransactions as getRecentTransactionsFn,
  getStaff as getStaffFn,
  createOrder as createOrderFn,
  createCustomer as createCustomerFn,
} from "@/lib/marvos.functions";

// ─── DATA CONTEXT (live from Lovable Cloud) ─────────────────────────────────
const DataContext = createContext<any>({ products: [], customers: [], transactions: [], users: [], refresh: () => {} });
function useData() { return useContext(DataContext); }
function DataProvider({ children }: { children: any }) {
  const getProducts = useServerFn(getProductsFn);
  const getCustomers = useServerFn(getCustomersFn);
  const getRecentTransactions = useServerFn(getRecentTransactionsFn);
  const getStaff = useServerFn(getStaffFn);
  const qc = useQueryClient();
  const productsQ = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });
  const customersQ = useQuery({ queryKey: ["customers"], queryFn: () => getCustomers() });
  const txQ = useQuery({ queryKey: ["transactions"], queryFn: () => getRecentTransactions() });
  const staffQ = useQuery({ queryKey: ["staff"], queryFn: () => getStaff() });
  const value = {
    products: productsQ.data ?? [],
    customers: customersQ.data ?? [],
    transactions: txQ.data ?? [],
    users: staffQ.data ?? [],
    refresh: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["staff"] });
    },
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}


import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  UserCog, Bot, Settings, Bell, Search, Moon, Sun, Menu, X,
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Archive,
  UserCheck, ChevronRight, Plus, Minus, Trash2, Printer,
  Download, Upload, Edit2, AlertTriangle, CheckCircle,
  LogOut, Eye, EyeOff, Star, Send, Zap, Target, Clock,
  Filter, MoreVertical, ArrowUpRight, ArrowDownRight,
  CreditCard, Barcode, Tag, Percent, Receipt, FileText,
  Building2, Camera, Shield, Lock, Globe, Phone, Mail,
  ChevronDown, RefreshCw, Package2, Layers, PieChart
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RPieChart,
  Pie, Cell, Legend
} from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const salesData = [
  { month: "Jan", revenue: 42000, orders: 320, profit: 12000 },
  { month: "Feb", revenue: 38000, orders: 290, profit: 10500 },
  { month: "Mar", revenue: 51000, orders: 410, profit: 15200 },
  { month: "Apr", revenue: 47000, orders: 375, profit: 13800 },
  { month: "May", revenue: 63000, orders: 520, profit: 19400 },
  { month: "Jun", revenue: 58000, orders: 480, profit: 17200 },
  { month: "Jul", revenue: 71000, orders: 590, profit: 22100 },
  { month: "Aug", revenue: 68000, orders: 560, profit: 21000 },
  { month: "Sep", revenue: 74000, orders: 610, profit: 23500 },
  { month: "Oct", revenue: 79000, orders: 650, profit: 25000 },
  { month: "Nov", revenue: 92000, orders: 750, profit: 29800 },
  { month: "Dec", revenue: 88000, orders: 720, profit: 28200 },
];

const weeklyData = [
  { day: "Mon", sales: 8200, transactions: 64 },
  { day: "Tue", sales: 9100, transactions: 71 },
  { day: "Wed", sales: 7800, transactions: 58 },
  { day: "Thu", sales: 11200, transactions: 89 },
  { day: "Fri", sales: 13400, transactions: 104 },
  { day: "Sat", sales: 15600, transactions: 128 },
  { day: "Sun", sales: 6800, transactions: 52 },
];

const categoryData = [
  { name: "Electronics", value: 35, color: "#16A34A" },
  { name: "Clothing", value: 25, color: "#0F172A" },
  { name: "Food & Bev", value: 20, color: "#22C55E" },
  { name: "Home & Garden", value: 12, color: "#4ADE80" },
  { name: "Other", value: 8, color: "#86EFAC" },
];

// products / customers / transactions / users now come from Lovable Cloud via useData()

const aiMessages = [
  { role: "assistant", content: "Hello! I'm MarvAI, your business intelligence assistant. I've analyzed your store data and have some insights ready for you. What would you like to explore?" },
];

const aiSuggestions = [
  "📈 Analyze this week's sales performance",
  "📦 Which products need restocking?",
  "👥 Who are my top customers?",
  "🔮 Forecast next month's revenue",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
const fmtNum = (n) => new Intl.NumberFormat().format(n);
const tierColor = { Platinum: "#e5e7eb", Gold: "#fbbf24", Silver: "#94a3b8", Bronze: "#d97706" };
const roleColor = { Admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", Manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", Cashier: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Avatar({ initials, size = "md", color = "#16A34A" }) {
  const s = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" }[size];
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ background: color }}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, changeType, color, dark }) {
  const isUp = changeType === "up";
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-3 shadow-sm border transition-all hover:shadow-md ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-2xl font-bold tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>{value}</span>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isUp ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[variant]}`}>{children}</span>;
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400" {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <select className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all" {...props}>{children}</select>
    </div>
  );
}

function Btn({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: "bg-green-600 hover:bg-green-700 text-white shadow-sm",
    secondary: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

// LOGIN
export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Account created — signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onLogin();
    } catch (e: any) {
      toast.error(e?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-5 bg-green-500" style={{ width: `${120 + i * 60}px`, height: `${120 + i * 60}px`, top: `${10 + i * 12}%`, left: `${5 + i * 15}%`, animation: `pulse ${2 + i}s ease-in-out infinite` }} />
        ))}
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Layers size={24} className="text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight">MarvOS</span>
          </div>
          <p className="text-gray-400 text-sm">Business Operating System</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in to your workspace</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="you@company.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)}
                  type={show ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••" />
                <button onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded accent-green-500" />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <button className="text-sm text-green-400 hover:text-green-300 font-medium">Forgot password?</button>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-green-500/30 disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : null}
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in to MarvOS"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-xs text-green-400 hover:text-green-300 font-medium">
              {mode === "signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">© 2025 MarvOS · Enterprise Business Platform</p>
      </div>
    </div>
  );
}

// DASHBOARD
function Dashboard({ dark }) {
  const { products, transactions } = useData();
  const stats = [
    { icon: DollarSign, label: "Total Revenue", value: "₦8.84M", change: "12.4%", changeType: "up", color: "#16A34A" },
    { icon: ShoppingBag, label: "Total Orders", value: "4,720", change: "8.1%", changeType: "up", color: "#3B82F6" },
    { icon: Package2, label: "In Stock Items", value: "292", change: "3.2%", changeType: "down", color: "#F59E0B" },
    { icon: Users, label: "Customers", value: "1,284", change: "18.6%", changeType: "up", color: "#8B5CF6" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>Dashboard</h1>
          <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>Tuesday, 9 June 2025 · Good morning!</p>
        </div>
        <Btn size="sm"><RefreshCw size={13} /> Refresh</Btn>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} dark={dark} />)}
      </div>

      {/* AI Insight Banner */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center gap-4 shadow-lg shadow-green-600/20">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">AI Insight · Revenue up 23% vs last month</p>
          <p className="text-green-100 text-xs mt-0.5">Electronics & Clothing driving growth. Friday sales peak — consider extra staffing.</p>
        </div>
        <Btn variant="secondary" size="sm" className="!bg-white/20 !text-white hover:!bg-white/30 flex-shrink-0">View Analysis</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className={`lg:col-span-2 rounded-2xl p-5 shadow-sm border ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Annual Revenue</h3>
              <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>12-month performance overview</p>
            </div>
            <div className="flex gap-1">
              {["Revenue", "Profit"].map(t => (
                <button key={t} className={`text-xs px-3 py-1 rounded-lg font-medium ${t === "Revenue" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#f3f4f6"} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? "#9CA3AF" : "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#9CA3AF" : "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₦${v / 1000}k`} />
              <Tooltip formatter={v => [fmt(v), "Revenue"]} contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2.5} fill="url(#rev)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className={`rounded-2xl p-5 shadow-sm border ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-1 ${dark ? "text-white" : "text-gray-900"}`}>Sales by Category</h3>
          <p className={`text-xs mb-4 ${dark ? "text-gray-400" : "text-gray-500"}`}>Current month breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <RPieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => [`${v}%`, ""]} contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 12, fontSize: 12 }} />
            </RPieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>{c.name}</span>
                </div>
                <span className={`text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-700"}`}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="p-5 pb-3 flex items-center justify-between">
            <h3 className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Top Products</h3>
            <Btn variant="ghost" size="sm">View all <ChevronRight size={13} /></Btn>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-xs font-semibold ${dark ? "text-gray-400 bg-gray-700/50" : "text-gray-500 bg-gray-50"}`}>
                  <th className="px-5 py-2.5 text-left">Product</th>
                  <th className="px-3 py-2.5 text-right">Price</th>
                  <th className="px-3 py-2.5 text-right">Sold</th>
                  <th className="px-5 py-2.5 text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map(p => (
                  <tr key={p.id} className={`border-t text-sm ${dark ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-50 hover:bg-gray-50"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.image}</span>
                        <div>
                          <p className={`font-medium text-xs leading-tight ${dark ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                          <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-3 py-3 text-right text-xs ${dark ? "text-gray-300" : "text-gray-600"}`}>₦{p.price.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-xs font-semibold text-green-600">{p.sales}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge variant={p.stock <= p.reorder ? "warning" : "success"}>{p.stock}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="p-5 pb-3 flex items-center justify-between">
            <h3 className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Recent Transactions</h3>
            <Btn variant="ghost" size="sm">View all <ChevronRight size={13} /></Btn>
          </div>
          <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-700">
            {transactions.map(t => (
              <div key={t.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>{t.customer}</p>
                  <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{t.id} · {t.items} items · {t.time}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>₦{t.amount.toLocaleString()}</p>
                  <Badge variant={t.status === "completed" ? "success" : "warning"}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// POS
function POS({ dark }) {
  const { products, refresh } = useData();
  const createOrder = useServerFn(createOrderFn);
  const checkoutMutation = useMutation({
    mutationFn: (vars: any) => createOrder({ data: vars }),
    onSuccess: (res: any) => {
      toast.success(`Order ${res.order_number} created · ₦${Math.round(res.total).toLocaleString()}`);
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Checkout failed"),
  });
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const TAX_RATE = 0.075;

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
    });
  };
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = subtotal * (discount / 100);
  const taxable = subtotal - discountAmt;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>Point of Sale</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products or scan barcode…"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${dark ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
          </div>
          <Btn variant="outline" size="md"><Barcode size={16} /></Btn>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto max-h-[calc(100vh-280px)]">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)}
              className={`rounded-2xl p-4 text-left border transition-all hover:shadow-md hover:border-green-300 active:scale-95 ${dark ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white border-gray-100 hover:bg-green-50"}`}>
              <span className="text-3xl block mb-2">{p.image}</span>
              <p className={`text-xs font-semibold leading-tight mb-1 ${dark ? "text-white" : "text-gray-900"}`}>{p.name}</p>
              <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{p.sku}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-green-600">₦{p.price.toLocaleString()}</span>
                <Badge variant={p.stock > 10 ? "success" : p.stock > 0 ? "warning" : "danger"}>{p.stock}</Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className={`w-full lg:w-[360px] rounded-2xl border flex flex-col shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="p-5 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>Cart</h2>
            {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Clear all</button>}
          </div>
          <p className={`text-xs mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{cart.length} item type{cart.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
              <ShoppingCart size={28} />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${dark ? "bg-gray-700/50" : "bg-gray-50"}`}>
              <span className="text-xl">{item.image}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>{item.name}</p>
                <p className="text-xs text-green-600 font-medium">₦{item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors">
                  <Minus size={10} />
                </button>
                <span className={`text-xs font-bold w-6 text-center ${dark ? "text-white" : "text-gray-900"}`}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 text-green-700 dark:text-green-400 transition-colors">
                  <Plus size={10} />
                </button>
              </div>
              <span className={`text-xs font-bold w-16 text-right ${dark ? "text-white" : "text-gray-900"}`}>₦{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className={`p-5 border-t flex flex-col gap-3 ${dark ? "border-gray-700" : "border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <Percent size={14} className="text-gray-400" />
            <input value={discount} onChange={e => setDiscount(Math.min(100, Math.max(0, +e.target.value)))} type="number" min={0} max={100}
              className={`flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-green-500 ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
              placeholder="Discount %" />
          </div>

          <div className={`flex flex-col gap-1.5 text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
            <div className="flex justify-between"><span>Subtotal</span><span className={dark ? "text-gray-200" : "text-gray-800"}>₦{subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="flex justify-between text-red-500"><span>Discount ({discount}%)</span><span>-₦{discountAmt.toFixed(0)}</span></div>}
            <div className="flex justify-between"><span>VAT (7.5%)</span><span className={dark ? "text-gray-200" : "text-gray-800"}>₦{tax.toFixed(0)}</span></div>
            <div className={`flex justify-between font-bold text-base pt-2 border-t ${dark ? "border-gray-700 text-white" : "border-gray-100 text-gray-900"}`}>
              <span>Total</span><span className="text-green-600">₦{total.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Btn variant="outline" size="sm" className="flex-1" onClick={() => cart.length && setShowReceipt(true)}>
              <Receipt size={14} /> Preview
            </Btn>
            <Btn
              size="md"
              className="flex-1"
              disabled={!cart.length || checkoutMutation.isPending}
              onClick={() => {
                if (!cart.length) return;
                checkoutMutation.mutate(
                  {
                    items: cart.map((i: any) => ({
                      product_id: i.id,
                      name: i.name,
                      unit_price: Number(i.price),
                      quantity: i.qty,
                    })),
                    discount: discountAmt,
                    tax,
                    payment_method: "Card",
                  },
                  {
                    onSuccess: () => {
                      setShowReceipt(true);
                      setCart([]);
                      setDiscount(0);
                    },
                  },
                );
              }}
            >
              <CreditCard size={14} /> {checkoutMutation.isPending ? "Processing…" : "Checkout"}
            </Btn>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal open={showReceipt} onClose={() => setShowReceipt(false)} title="Receipt Preview">
        <div className="font-mono text-xs space-y-2">
          <div className="text-center pb-3 border-b dark:border-gray-700">
            <p className="font-bold text-base">MarvOS Store</p>
            <p className="text-gray-500">123 Business Ave, Lagos, NG</p>
            <p className="text-gray-500">{new Date().toLocaleString()}</p>
            <p className="text-gray-500">TXN-{Math.floor(Math.random() * 9000 + 1000)}</p>
          </div>
          {cart.map(i => (
            <div key={i.id} className="flex justify-between">
              <span>{i.name} x{i.qty}</span>
              <span>₦{(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="pt-2 border-t dark:border-gray-700 space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-₦{discountAmt.toFixed(0)}</span></div>}
            <div className="flex justify-between"><span>VAT 7.5%</span><span>₦{tax.toFixed(0)}</span></div>
            <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span className="text-green-600">₦{total.toFixed(0)}</span></div>
          </div>
          <div className="text-center pt-3 text-gray-400">Thank you for shopping with us!</div>
        </div>
        <div className="flex gap-2 mt-4">
          <Btn variant="outline" className="flex-1"><Printer size={14} /> Print</Btn>
          <Btn className="flex-1" onClick={() => { setCart([]); setShowReceipt(false); }}><CheckCircle size={14} /> Complete Sale</Btn>
        </div>
      </Modal>
    </div>
  );
}

// INVENTORY
function Inventory({ dark }) {
  const { products } = useData();
  const [view, setView] = useState("grid");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(search.toLowerCase()));
  const low = products.filter(p => p.stock <= p.reorder);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>Inventory</h1>
        <Btn onClick={() => setAddOpen(true)}><Plus size={15} /> Add Product</Btn>
      </div>

      {low.length > 0 && (
        <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Low Stock Alert — {low.length} item{low.length > 1 ? "s" : ""} need restocking</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">{low.map(p => p.name).join(", ")}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 ${dark ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`text-xs px-3 py-2 rounded-xl font-medium transition-all ${cat === c ? "bg-green-600 text-white" : dark ? "bg-gray-700 text-gray-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {[["grid", Layers], ["list", FileText]].map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`p-2 rounded-lg transition-all ${view === v ? "bg-green-600 text-white" : dark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className={`rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{p.image}</span>
                <button onClick={() => setEditItem(p)} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${dark ? "text-gray-400" : "text-gray-400"}`}><Edit2 size={13} /></button>
              </div>
              <p className={`text-xs font-bold leading-tight mb-0.5 ${dark ? "text-white" : "text-gray-900"}`}>{p.name}</p>
              <p className={`text-xs mb-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>{p.sku}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-green-600">₦{p.price.toLocaleString()}</span>
                <Badge variant={p.stock <= p.reorder ? "warning" : "success"}>{p.stock} left</Badge>
              </div>
              <div className={`mt-2 w-full h-1.5 rounded-full ${dark ? "bg-gray-700" : "bg-gray-100"}`}>
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <table className="w-full">
            <thead className={`text-xs font-semibold ${dark ? "bg-gray-700/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
              <tr>
                {["Product", "Category", "Price", "Cost", "Stock", "Status", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={`border-t text-sm ${dark ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-50 hover:bg-gray-50"}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{p.image}</span>
                      <div>
                        <p className={`font-semibold text-xs ${dark ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                        <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-5 py-3 text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>{p.category}</td>
                  <td className="px-5 py-3 text-xs font-semibold text-green-600">₦{p.price.toLocaleString()}</td>
                  <td className={`px-5 py-3 text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>₦{p.cost.toLocaleString()}</td>
                  <td className={`px-5 py-3 text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-700"}`}>{p.stock}</td>
                  <td className="px-5 py-3"><Badge variant={p.stock <= p.reorder ? "warning" : "success"}>{p.stock <= p.reorder ? "Low Stock" : "In Stock"}</Badge></td>
                  <td className="px-5 py-3">
                    <button onClick={() => setEditItem(p)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><Edit2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Product" wide>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Product Name" placeholder="e.g. iPhone 15 Pro" />
          <Input label="SKU" placeholder="e.g. APL-IP15P" />
          <Input label="Category" placeholder="Electronics" />
          <Input label="Selling Price (₦)" type="number" placeholder="1199" />
          <Input label="Cost Price (₦)" type="number" placeholder="820" />
          <Input label="Initial Stock" type="number" placeholder="50" />
          <Input label="Reorder Point" type="number" placeholder="10" />
          <Select label="Status"><option>Active</option><option>Inactive</option></Select>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Btn variant="outline" onClick={() => setAddOpen(false)}>Cancel</Btn>
          <Btn onClick={() => setAddOpen(false)}>Save Product</Btn>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Edit: ${editItem?.name}`} wide>
        {editItem && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Product Name" defaultValue={editItem.name} />
              <Input label="SKU" defaultValue={editItem.sku} />
              <Input label="Category" defaultValue={editItem.category} />
              <Input label="Selling Price (₦)" type="number" defaultValue={editItem.price} />
              <Input label="Cost Price (₦)" type="number" defaultValue={editItem.cost} />
              <Input label="Current Stock" type="number" defaultValue={editItem.stock} />
            </div>
            <div className="flex justify-between items-center mt-6">
              <Btn variant="danger" size="sm" onClick={() => setEditItem(null)}><Trash2 size={13} /> Delete Product</Btn>
              <div className="flex gap-2">
                <Btn variant="outline" onClick={() => setEditItem(null)}>Cancel</Btn>
                <Btn onClick={() => setEditItem(null)}>Save Changes</Btn>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// CUSTOMERS
function Customers({ dark }) {
  const { customers, refresh } = useData();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", tier: "Bronze" });
  const [saving, setSaving] = useState(false);
  const createCustomer = useServerFn(createCustomerFn);
  const submitNew = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    try {
      setSaving(true);
      await createCustomer({ data: form });
      toast.success("Customer added");
      setForm({ name: "", email: "", phone: "", tier: "Bronze" });
      setShowAdd(false);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add customer");
    } finally {
      setSaving(false);
    }
  };
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>Customers</h1>
        <Btn onClick={() => setShowAdd(true)}><Plus size={15} /> Add Customer</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Total Customers", val: "1,284", icon: Users, color: "#8B5CF6" }, { label: "Active This Month", val: "346", icon: UserCheck, color: "#16A34A" }, { label: "Avg Spend", val: "₦11,682", icon: DollarSign, color: "#F59E0B" }].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + "20" }}>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
            </div>
            <p className={`text-xl font-black ${dark ? "text-white" : "text-gray-900"}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers by name or email…"
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 ${dark ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <table className="w-full">
          <thead className={`text-xs font-semibold ${dark ? "bg-gray-700/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
            <tr>
              {["Customer", "Contact", "Joined", "Orders", "Total Spent", "Tier", "Points", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className={`border-t text-sm cursor-pointer ${dark ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-50 hover:bg-gray-50"}`} onClick={() => setSelected(c)}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={c.name.split(" ").map(n => n[0]).join("")} size="sm" />
                    <span className={`text-xs font-semibold ${dark ? "text-white" : "text-gray-900"}`}>{c.name}</span>
                  </div>
                </td>
                <td className={`px-5 py-3 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{c.email}</td>
                <td className={`px-5 py-3 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{c.joinDate}</td>
                <td className={`px-5 py-3 text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-700"}`}>{c.orders}</td>
                <td className="px-5 py-3 text-xs font-semibold text-green-600">₦{c.totalSpent.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: tierColor[c.tier] + "30", color: tierColor[c.tier] }}>
                    {c.tier}
                  </span>
                </td>
                <td className={`px-5 py-3 text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-700"}`}>{c.points.toLocaleString()}</td>
                <td className="px-5 py-3"><ChevronRight size={14} className="text-gray-400" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Customer Profile" wide>
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar initials={selected.name.split(" ").map(n => n[0]).join("")} size="lg" />
              <div>
                <h3 className={`font-bold text-lg ${dark ? "text-white" : "text-gray-900"}`}>{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.email}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: tierColor[selected.tier] + "30", color: tierColor[selected.tier] }}>{selected.tier} Member</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ l: "Total Orders", v: selected.orders }, { l: "Total Spent", v: "₦" + selected.totalSpent.toLocaleString() }, { l: "Loyalty Points", v: selected.points.toLocaleString() }].map(s => (
                <div key={s.l} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{s.l}</p>
                  <p className={`font-bold mt-0.5 ${dark ? "text-white" : "text-gray-900"}`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Customer">
        <div className="flex flex-col gap-3">
          {[
            { k: "name", label: "Full name *", type: "text" },
            { k: "email", label: "Email", type: "email" },
            { k: "phone", label: "Phone", type: "tel" },
          ].map(f => (
            <div key={f.k}>
              <label className={`text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}>{f.label}</label>
              <input type={f.type} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`} />
            </div>
          ))}
          <div>
            <label className={`text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}>Tier</label>
            <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}
              className={`mt-1 w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
              {["Bronze", "Silver", "Gold", "Platinum"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Btn variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={submitNew} disabled={saving}>{saving ? "Saving…" : "Add Customer"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// REPORTS
function Reports({ dark }) {
  const [period, setPeriod] = useState("Monthly");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>Reports</h1>
        <div className="flex gap-2">
          {["Daily", "Weekly", "Monthly"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-xs px-4 py-2 rounded-xl font-medium transition-all ${period === p ? "bg-green-600 text-white" : dark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"}`}>{p}</button>
          ))}
          <Btn variant="outline" size="sm"><Download size={13} /> Export PDF</Btn>
          <Btn variant="outline" size="sm"><Download size={13} /> Export Excel</Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "₦8.84M", sub: "This year", icon: TrendingUp, color: "#16A34A" },
          { label: "Net Profit", value: "₦2.37M", sub: "Margin 26.8%", icon: DollarSign, color: "#3B82F6" },
          { label: "Avg Order Value", value: "₦18,728", sub: "+4.2% vs last month", icon: ShoppingBag, color: "#8B5CF6" },
          { label: "Return Rate", value: "2.3%", sub: "Below industry avg", icon: RefreshCw, color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + "20" }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
            </div>
            <p className={`text-xl font-black ${dark ? "text-white" : "text-gray-900"}`}>{s.value}</p>
            <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl p-5 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Revenue vs Profit (Annual)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#f3f4f6"} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? "#9CA3AF" : "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#9CA3AF" : "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#16A34A" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="profit" fill="#86EFAC" radius={[4, 4, 0, 0]} name="Profit" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-2xl p-5 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Weekly Sales Pattern</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="wk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#f3f4f6"} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: dark ? "#9CA3AF" : "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#9CA3AF" : "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip contentStyle={{ background: dark ? "#1f2937" : "#fff", border: "none", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} fill="url(#wk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// USER MANAGEMENT
function UserManagement({ dark }) {
  const { users } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const perms = {
    Admin: ["Dashboard", "POS", "Inventory", "Customers", "Reports", "Users", "AI Assistant", "Settings"],
    Manager: ["Dashboard", "POS", "Inventory", "Customers", "Reports", "AI Assistant"],
    Cashier: ["POS", "Inventory (View)"],
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>User Management</h1>
        <Btn onClick={() => setAddOpen(true)}><Plus size={15} /> Add User</Btn>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ role: "Admin", count: 1, color: "#EF4444", desc: "Full access" }, { role: "Manager", count: 2, color: "#3B82F6", desc: "Operational access" }, { role: "Cashier", count: 2, color: "#16A34A", desc: "POS access" }].map(r => (
          <div key={r.role} className={`rounded-2xl p-4 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ background: r.color }} />
              <span className={`font-bold text-sm ${dark ? "text-white" : "text-gray-900"}`}>{r.role}</span>
            </div>
            <p className={`text-2xl font-black ${dark ? "text-white" : "text-gray-900"}`}>{r.count}</p>
            <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{r.desc}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <table className="w-full">
          <thead className={`text-xs font-semibold ${dark ? "bg-gray-700/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
            <tr>
              {["User", "Role", "Status", "Last Login", ""].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className={`border-t ${dark ? "border-gray-700 hover:bg-gray-700/50" : "border-gray-50 hover:bg-gray-50"}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={u.avatar} size="sm" color={u.role === "Admin" ? "#EF4444" : u.role === "Manager" ? "#3B82F6" : "#16A34A"} />
                    <div>
                      <p className={`text-xs font-semibold ${dark ? "text-white" : "text-gray-900"}`}>{u.name}</p>
                      <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColor[u.role]}`}>{u.role}</span></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"} capitalize`}>{u.status}</span>
                  </div>
                </td>
                <td className={`px-5 py-3 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{u.lastLogin}</td>
                <td className="px-5 py-3">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><Edit2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Permissions */}
      <div className={`rounded-2xl p-5 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <h3 className={`font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Role Permissions</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(perms).map(([role, ps]) => (
            <div key={role} className={`rounded-xl p-4 ${dark ? "bg-gray-700/50" : "bg-gray-50"}`}>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full mb-3 inline-block ${roleColor[role]}`}>{role}</span>
              <div className="flex flex-col gap-1.5">
                {ps.map(p => (
                  <div key={p} className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                    <span className={`text-xs ${dark ? "text-gray-300" : "text-gray-700"}`}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User">
        <div className="flex flex-col gap-4">
          <Input label="Full Name" placeholder="Jane Doe" />
          <Input label="Email Address" placeholder="jane@company.com" type="email" />
          <Select label="Role"><option>Cashier</option><option>Manager</option><option>Admin</option></Select>
          <Input label="Temporary Password" type="password" placeholder="••••••••" />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Btn variant="outline" onClick={() => setAddOpen(false)}>Cancel</Btn>
          <Btn onClick={() => setAddOpen(false)}>Create User</Btn>
        </div>
      </Modal>
    </div>
  );
}

// SETTINGS
function SettingsPage({ dark }) {
  const [tab, setTab] = useState("Company");
  const tabs = ["Company", "Receipt", "Tax", "Notifications", "Security"];

  return (
    <div className="flex flex-col gap-5">
      <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>Settings</h1>

      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-xl font-medium transition-all ${tab === t ? "bg-green-600 text-white" : dark ? "bg-gray-700 text-gray-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t}</button>
        ))}
      </div>

      <div className={`rounded-2xl p-6 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {tab === "Company" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed ${dark ? "border-gray-600" : "border-gray-300"}`}>
                <Building2 size={28} className="text-gray-400" />
              </div>
              <div>
                <Btn variant="outline" size="sm"><Camera size={13} /> Upload Logo</Btn>
                <p className={`text-xs mt-1.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>PNG, JPG up to 2MB</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Business Name" defaultValue="MarvOS Store Ltd" />
              <Input label="Registration Number" defaultValue="RC-1234567" />
              <Input label="Business Email" defaultValue="hello@marvos.co" type="email" />
              <Input label="Phone Number" defaultValue="+234 800 000 0000" />
              <div className="col-span-2"><Input label="Address" defaultValue="123 Business Avenue, Victoria Island, Lagos, Nigeria" /></div>
              <Input label="City" defaultValue="Lagos" />
              <Input label="Country" defaultValue="Nigeria" />
            </div>
            <div className="flex justify-end"><Btn>Save Changes</Btn></div>
          </div>
        )}

        {tab === "Receipt" && (
          <div className="flex flex-col gap-4">
            <Input label="Receipt Header" defaultValue="Thank you for shopping with us!" />
            <Input label="Receipt Footer" defaultValue="Visit us at marvos.co | +234 800 000 0000" />
            <div className="flex flex-col gap-2">
              {[["Show Logo on Receipt", true], ["Print Barcode", true], ["Include Customer Name", false], ["Show Loyalty Points", true]].map(([l, d]) => (
                <label key={l} className="flex items-center justify-between py-2.5 cursor-pointer">
                  <span className={`text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>{l}</span>
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${d ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${d ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end"><Btn>Save Receipt Settings</Btn></div>
          </div>
        )}

        {tab === "Tax" && (
          <div className="flex flex-col gap-4">
            <Input label="VAT Rate (%)" defaultValue="7.5" type="number" />
            <Input label="Tax ID Number" defaultValue="NG-TAX-00123456" />
            <Select label="Tax Calculation Method">
              <option>Exclusive (added on top)</option>
              <option>Inclusive (already in price)</option>
            </Select>
            <div className="flex justify-end"><Btn>Save Tax Settings</Btn></div>
          </div>
        )}

        {tab === "Notifications" && (
          <div className="flex flex-col gap-2">
            {[["Low Stock Alerts", true], ["Daily Sales Report", true], ["New Customer Registration", false], ["Large Transaction Alert", true], ["System Maintenance", true]].map(([l, d]) => (
              <label key={l} className="flex items-center justify-between py-2.5 border-b dark:border-gray-700 last:border-0 cursor-pointer">
                <span className={`text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>{l}</span>
                <div className={`relative w-10 h-5 rounded-full transition-colors ${d ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${d ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
            ))}
          </div>
        )}

        {tab === "Security" && (
          <div className="flex flex-col gap-4">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" />
            <div className="flex justify-end"><Btn>Update Password</Btn></div>
          </div>
        )}
      </div>
    </div>
  );
}

// AI ASSISTANT
function AIAssistant({ dark }) {
  const [messages, setMessages] = useState(aiMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const aiResponses = {
    "analyze": "📊 **This Week's Sales Analysis**\n\nRevenue is up 18.4% vs last week at ₦72,400. Your best day was Friday with ₦13,400 in sales. Electronics continues to dominate at 35% of total revenue.\n\n**Top insight:** Friday evening (6–9 PM) drives 28% of weekly sales. Consider targeted promotions during that window.",
    "restock": "📦 **Restocking Recommendations**\n\n3 products need immediate attention:\n1. **Levi's 501 Jeans** — only 3 units left (reorder point: 20)\n2. **Sony WH-1000XM5** — only 2 units left (reorder point: 8)\n3. **Samsung 4K TV** — 8 units left (reorder point: 5)\n\nEstimated cost to restock all: **₦2.4M**",
    "customers": "👥 **Top Customer Insights**\n\n**Chidinma Eze** is your #1 customer with ₦24,100 spent across 45 orders. She's a Platinum tier member.\n\n3 customers haven't purchased in 30+ days — consider a win-back campaign with a 10% discount code.",
    "forecast": "🔮 **Revenue Forecast — Next 30 Days**\n\nBased on historical trends and seasonal patterns:\n\n- **Projected Revenue:** ₦94,000–₦101,000\n- **Confidence:** 82%\n- **Key driver:** Back-to-school season boosting Electronics & Clothing\n\nRecommend increasing Electronics stock by 20% for the period.",
    "default": "I've analyzed your business data. Your store is performing well — revenue is up 12.4% this month. Would you like me to dive deeper into sales, inventory, customers, or forecasting?"
  };

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    setTimeout(() => {
      const lower = msg.toLowerCase();
      const resp = lower.includes("analyz") || lower.includes("sales") ? aiResponses.analyze
        : lower.includes("restock") || lower.includes("stock") || lower.includes("inventory") ? aiResponses.restock
        : lower.includes("customer") ? aiResponses.customers
        : lower.includes("forecast") || lower.includes("predict") ? aiResponses.forecast
        : aiResponses.default;
      setMessages(prev => [...prev, { role: "assistant", content: resp }]);
      setLoading(false);
    }, 1200);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <div className="flex flex-col gap-4 h-full max-h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>AI Assistant</h1>
          <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Powered by MarvAI · Business Intelligence Engine</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">Online</span>
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 rounded-2xl border overflow-hidden flex flex-col ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              {m.role === "assistant" ? (
                <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              ) : (
                <Avatar initials="MR" size="sm" />
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${m.role === "assistant" ? dark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800" : "bg-green-600 text-white"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className={`px-4 py-3 rounded-2xl ${dark ? "bg-gray-700" : "bg-gray-100"} flex gap-1 items-center`}>
                {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        <div className={`px-5 py-3 border-t flex flex-wrap gap-2 ${dark ? "border-gray-700" : "border-gray-100"}`}>
          {aiSuggestions.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all hover:border-green-400 hover:text-green-600 ${dark ? "border-gray-600 text-gray-400" : "border-gray-200 text-gray-600"}`}>{s}</button>
          ))}
        </div>

        {/* Input */}
        <div className={`p-4 border-t flex gap-2 ${dark ? "border-gray-700" : "border-gray-100"}`}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask MarvAI anything about your business…"
            className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 ${dark ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
          <Btn onClick={() => sendMessage()} disabled={!input.trim() && !loading}>
            <Send size={15} />
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── LAYOUT ──────────────────────────────────────────────────────────────────
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pos", label: "POS", icon: ShoppingCart },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "users", label: "Users", icon: UserCog },
  { id: "ai", label: "AI Assistant", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
];

function AppLayout({ page, setPage, dark, toggleDark }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [profile, setProfile] = useState<{ name: string; initials: string } | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const name = (u.user_metadata?.full_name as string) || u.email || "User";
      const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
      setProfile({ name, initials });
    });
  }, []);
  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const current = navItems.find(n => n.id === page);

  const pageComponents = {
    dashboard: <Dashboard dark={dark} />,
    pos: <POS dark={dark} />,
    inventory: <Inventory dark={dark} />,
    customers: <Customers dark={dark} />,
    reports: <Reports dark={dark} />,
    users: <UserManagement dark={dark} />,
    ai: <AIAssistant dark={dark} />,
    settings: <SettingsPage dark={dark} />,
  };

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border-r`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b ${dark ? "border-gray-800" : "border-gray-100"}`}>
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Layers size={18} className="text-white" />
          </div>
          {sidebarOpen && <span className={`font-black text-xl tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>MarvOS</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${active ? "bg-green-600 text-white shadow-sm" : dark ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User area */}
        {sidebarOpen && (
          <div className={`p-3 border-t ${dark ? "border-gray-800" : "border-gray-100"}`}>
            <div onClick={handleSignOut} className={`flex items-center gap-2.5 p-2.5 rounded-xl ${dark ? "hover:bg-gray-800" : "hover:bg-gray-50"} cursor-pointer transition-colors`}>
              <Avatar initials={profile?.initials ?? "··"} size="sm" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${dark ? "text-white" : "text-gray-900"}`}>{profile?.name ?? "Signed in"}</p>
                <p className={`text-xs truncate ${dark ? "text-gray-500" : "text-gray-400"}`}>Sign out</p>
              </div>
              <LogOut size={14} className={dark ? "text-gray-500" : "text-gray-400"} />
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0 ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-1.5 rounded-lg transition-colors ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
            <Menu size={18} />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <div className="relative hidden md:flex">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search anything…"
                className={`w-64 pl-9 pr-4 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 ${dark ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={toggleDark} className={`p-2 rounded-xl transition-colors ${dark ? "hover:bg-gray-800 text-yellow-400" : "hover:bg-gray-100 text-gray-500"}`}>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button className={`relative p-2 rounded-xl transition-colors ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`} onClick={() => setNotifications(0)}>
              <Bell size={17} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">{notifications}</span>
              )}
            </button>

            <div className="flex items-center gap-2 ml-1 cursor-pointer">
              <Avatar initials="MR" size="sm" />
              {sidebarOpen && <ChevronDown size={14} className={dark ? "text-gray-500" : "text-gray-400"} />}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {pageComponents[page]}
        </main>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function MarvOS() {
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(false);

  return (
    <DataProvider>
      <div className={dark ? "dark" : ""}>
        <AppLayout page={page} setPage={setPage} dark={dark} toggleDark={() => setDark(!dark)} />
      </div>
    </DataProvider>
  );
}
