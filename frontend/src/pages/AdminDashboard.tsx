import { useEffect, useState } from "react";
import {
  Users, Building2, MessageSquare, TrendingUp,
  Search, ChevronDown, Shield, Ban, CheckCircle,
  IndianRupee, Zap, RefreshCw, X, Edit2, Calendar, CreditCard,
  BarChart3, Moon, Sun,
} from "lucide-react";
import {
  adminStats, adminWorkspaces, adminChangePlan,
  adminSuspendWorkspace, adminUsers, adminSuspendUser, adminSetSuperadmin,
  adminEditUser, adminExtendValidity, adminGetPayments, adminAddPayment,
  adminRevenue, adminWorkspaceDetail,
} from "../api/admin";
import { useThemeStore } from "../store/themeStore";

// Import UI Library components
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";

const PLANS = ["free", "starter", "pro", "enterprise"];

// Mappings for UI badge colors
const PLAN_COLOR_MAP: Record<string, "gray" | "blue" | "purple" | "orange"> = {
  free: "gray",
  starter: "blue",
  pro: "purple",
  enterprise: "orange",
};

const STATUS_COLOR_MAP: Record<string, "green" | "red" | "orange" | "gray"> = {
  active: "green",
  cancelled: "red",
  past_due: "orange",
  halted: "red",
  none: "gray",
};

// Colors mapping for native Tailwind compilation (avoiding dynamic compilation JIT omissions)
const CARD_THEMES: Record<string, { bgIcon: string; textIcon: string; borderIcon: string; hoverBorder: string; glowBg: string }> = {
  blue: {
    bgIcon: "bg-blue-500/10 dark:bg-blue-500/20",
    textIcon: "text-blue-600 dark:text-blue-400",
    borderIcon: "border-blue-500/20 dark:border-blue-500/30",
    hoverBorder: "hover:border-blue-500/30 dark:hover:border-blue-500/40 hover:shadow-blue-500/5",
    glowBg: "bg-blue-500/10 dark:bg-blue-500/5",
  },
  violet: {
    bgIcon: "bg-violet-500/10 dark:bg-violet-500/20",
    textIcon: "text-violet-600 dark:text-violet-400",
    borderIcon: "border-violet-500/20 dark:border-violet-500/30",
    hoverBorder: "hover:border-violet-500/30 dark:hover:border-violet-500/40 hover:shadow-violet-500/5",
    glowBg: "bg-violet-500/10 dark:bg-violet-500/5",
  },
  green: {
    bgIcon: "bg-green-500/10 dark:bg-green-500/20",
    textIcon: "text-green-600 dark:text-green-400",
    borderIcon: "border-green-500/20 dark:border-green-500/30",
    hoverBorder: "hover:border-green-500/30 dark:hover:border-green-500/40 hover:shadow-green-500/5",
    glowBg: "bg-green-500/10 dark:bg-green-500/5",
  },
  amber: {
    bgIcon: "bg-amber-500/10 dark:bg-amber-500/20",
    textIcon: "text-amber-600 dark:text-amber-400",
    borderIcon: "border-amber-500/20 dark:border-amber-500/30",
    hoverBorder: "hover:border-amber-500/30 dark:hover:border-amber-500/40 hover:shadow-amber-500/5",
    glowBg: "bg-amber-500/10 dark:bg-amber-500/5",
  },
};

const PLAN_THEMES: Record<string, {
  cardBg: string;
  glow: string;
  iconBg: string;
  textIcon: string;
  borderClass: string;
  accentBar: string;
  badgeBg: string;
  badgeText: string;
}> = {
  free: {
    cardBg: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-gray-900 dark:to-gray-950/40",
    glow: "bg-slate-400/10 dark:bg-slate-400/5",
    iconBg: "bg-slate-200/60 dark:bg-slate-800/60",
    textIcon: "text-slate-600 dark:text-slate-400",
    borderClass: "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/60 hover:shadow-slate-500/5",
    accentBar: "bg-slate-400 dark:bg-slate-600",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-600 dark:text-slate-400",
  },
  starter: {
    cardBg: "bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-gray-900 dark:to-blue-950/10",
    glow: "bg-blue-400/10 dark:bg-blue-400/5",
    iconBg: "bg-blue-100/60 dark:bg-blue-900/40",
    textIcon: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-200 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-800/40 hover:shadow-blue-500/5",
    accentBar: "bg-blue-500",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-600 dark:text-blue-400",
  },
  pro: {
    cardBg: "bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-gray-900 dark:to-violet-950/10",
    glow: "bg-violet-400/10 dark:bg-violet-400/5",
    iconBg: "bg-violet-100/60 dark:bg-violet-900/40",
    textIcon: "text-violet-600 dark:text-violet-400",
    borderClass: "border-violet-200 dark:border-violet-900/30 hover:border-violet-300 dark:hover:border-violet-800/40 hover:shadow-violet-500/5",
    accentBar: "bg-violet-500",
    badgeBg: "bg-violet-50 dark:bg-violet-950/40",
    badgeText: "text-violet-600 dark:text-violet-400",
  },
  enterprise: {
    cardBg: "bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-gray-900 dark:to-amber-950/10",
    glow: "bg-amber-400/10 dark:bg-amber-400/5",
    iconBg: "bg-amber-100/60 dark:bg-amber-900/40",
    textIcon: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-800/40 hover:shadow-amber-500/5",
    accentBar: "bg-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-600 dark:text-amber-400",
  },
};

const PLAN_ICONS: Record<string, any> = {
  free: Building2,
  starter: Zap,
  pro: TrendingUp,
  enterprise: Shield,
};

const QUICK_THEMES: Record<string, { border: string; text: string; bg: string }> = {
  active: {
    border: "border-green-500/20 hover:border-green-500/30 hover:shadow-green-500/5",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/5 dark:bg-green-500/10",
  },
  contacts: {
    border: "border-blue-500/20 hover:border-blue-500/30 hover:shadow-blue-500/5",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/5 dark:bg-blue-500/10",
  },
  flows: {
    border: "border-violet-500/20 hover:border-violet-500/30 hover:shadow-violet-500/5",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/5 dark:bg-violet-500/10",
  },
};

function StatCard({ label, value, icon: Icon, themeKey }: { label: string; value: any; icon: any; themeKey: "blue" | "violet" | "green" | "amber" }) {
  const theme = CARD_THEMES[themeKey];
  return (
    <div className={`relative overflow-hidden bg-white/70 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-250/60 dark:border-gray-800/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.hoverBorder} group`}>
      {/* Background soft glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${theme.glowBg} blur-2xl group-hover:scale-125 transition-transform duration-500`} />
      
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${theme.bgIcon} ${theme.textIcon} border ${theme.borderIcon} group-hover:scale-105 transition-transform duration-300`}>
        <Icon size={18} className="transition-transform duration-300 group-hover:rotate-6" />
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
    </div>
  );
}


export default function AdminDashboard() {
  const { theme, toggleTheme } = useThemeStore();
  const [tab, setTab] = useState<"overview" | "workspaces" | "users">("overview");
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [planModal, setPlanModal] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [editUserModal, setEditUserModal] = useState<any>(null);
  const [editUserForm, setEditUserForm] = useState({ full_name: "", email: "" });
  const [extendModal, setExtendModal] = useState<any>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [paymentsModal, setPaymentsModal] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount_inr: 0, plan: "starter", note: "" });
  const [detailModal, setDetailModal] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadStats = async () => {
    try { 
      setStats(await adminStats());
      setRevenue(await adminRevenue());
    } catch { }
  };

  const loadWorkspaces = async () => {
    setLoading(true);
    try { setWorkspaces(await adminWorkspaces({ search })); }
    finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try { setUsers(await adminUsers({ search })); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    if (tab === "workspaces") loadWorkspaces();
    if (tab === "users") loadUsers();
  }, [tab, search]);

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const handleChangePlan = async () => {
    if (!planModal || !selectedPlan) return;
    await adminChangePlan(planModal.id, selectedPlan);
    setPlanModal(null);
    loadWorkspaces();
    loadStats();
  };

  const handleSuspendWs = async (id: string, current: boolean) => {
    if (!confirm(current ? "Suspend this workspace?" : "Reactivate this workspace?")) return;
    await adminSuspendWorkspace(id, !current);
    loadWorkspaces();
  };

  const handleSuspendUser = async (id: string, current: boolean) => {
    if (!confirm(current ? "Suspend this user?" : "Reactivate this user?")) return;
    await adminSuspendUser(id, !current);
    loadUsers();
  };

  const handleSuperadmin = async (id: string, current: boolean) => {
    if (!confirm(current ? "Revoke superadmin?" : "Grant superadmin access?")) return;
    await adminSetSuperadmin(id, !current);
    loadUsers();
  };

  const handleEditUser = async () => {
    if (!editUserModal) return;
    await adminEditUser(editUserModal.id, editUserForm);
    setEditUserModal(null);
    loadUsers();
  };

  const handleExtendValidity = async () => {
    if (!extendModal || extendDays < 1) return;
    await adminExtendValidity(extendModal.id, extendDays);
    setExtendModal(null);
    loadWorkspaces();
  };

  const loadPayments = async (workspaceId: string) => {
    try {
      const data = await adminGetPayments(workspaceId);
      setPayments(data);
    } catch {
      setPayments([]);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentsModal || paymentForm.amount_inr <= 0) return;
    await adminAddPayment(paymentsModal.id, paymentForm);
    setShowAddPayment(false);
    setPaymentForm({ amount_inr: 0, plan: "starter", note: "" });
    loadPayments(paymentsModal.id);
    loadWorkspaces();
  };

  const loadWorkspaceDetail = async (workspaceId: string) => {
    setDetailLoading(true);
    try {
      const data = await adminWorkspaceDetail(workspaceId);
      setDetailModal(data);
    } catch {
      setDetailModal(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-md shadow-brand-500/10 hover:scale-105 transition-transform">
            <Zap size={16} className="text-white animate-pulse" fill="white" />
          </div>
          <div>
            <span className="font-extrabold text-gray-950 dark:text-white text-lg tracking-tight">FlowWA</span>
            <span className="ml-2.5 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Super Admin
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-gray-900/80 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200/20 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95 shadow-sm"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            href="/dashboard"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            ← Back to App
          </a>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* Banner Section */}
        <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-br from-brand-600/10 via-emerald-600/5 to-transparent dark:from-brand-950/20 dark:via-emerald-950/10 dark:to-transparent border border-brand-500/10 p-8 shadow-sm">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-brand-500/10 dark:bg-brand-500/5 blur-3xl" />
          <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium max-w-xl">
            System administration center. Manage your platforms workspaces, user lists, verify active WhatsApp nodes, view MRR trends and manage payments.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200/50 dark:bg-gray-900/50 backdrop-blur-md rounded-xl p-1.5 w-fit mb-8 border border-gray-300/30 dark:border-gray-800/40 shadow-inner">
          {(["overview", "workspaces", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${
                tab === t
                  ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-white shadow-md shadow-gray-200/40 dark:shadow-black/20 scale-102"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/40 dark:hover:bg-gray-800/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && stats && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard label="Total Workspaces" value={stats.total_workspaces} icon={Building2} themeKey="blue" />
              <StatCard label="Total Users" value={stats.total_users} icon={Users} themeKey="violet" />
              <StatCard label="Messages Sent" value={stats.total_messages_sent?.toLocaleString() ?? 0} icon={MessageSquare} themeKey="green" />
              <StatCard label="MRR (₹)" value={`₹${stats.mrr_inr?.toLocaleString("en-IN")}`} icon={IndianRupee} themeKey="amber" />
            </div>

            {/* Revenue Chart */}
            {revenue.length > 0 && (
              <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-800/40 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-brand-500 dark:text-brand-400" />
                    <p className="font-bold text-gray-950 dark:text-white">Revenue Trend (MRR)</p>
                  </div>
                  <span className="text-[10px] bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Monthly
                  </span>
                </div>
                <div className="relative flex items-end justify-between gap-2 h-48">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-gray-100 dark:border-gray-800/50 w-full" />
                    <div className="border-t border-gray-100 dark:border-gray-800/50 w-full" />
                    <div className="border-t border-gray-100 dark:border-gray-800/50 w-full" />
                    <div className="border-t border-gray-100 dark:border-gray-800/50 w-full" />
                  </div>

                  {revenue.map((item, i) => {
                    const maxMrr = Math.max(...revenue.map(r => r.mrr));
                    const height = maxMrr > 0 ? (item.mrr / maxMrr) * 100 : 0;
                    return (
                      <div key={i} className="z-10 flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="relative w-full group/bar flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full max-w-[32px] bg-gradient-to-t from-brand-600 to-brand-400 dark:from-brand-600 dark:to-brand-50 rounded-t-lg transition-all duration-300 hover:from-brand-500 hover:to-brand-300 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 cursor-pointer"
                            style={{ height: `${height}%`, minHeight: item.mrr > 0 ? '8px' : '0' }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-250/60 dark:border-gray-800/80 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white whitespace-nowrap shadow-xl">
                              <p className="font-extrabold text-gray-950 dark:text-white">₹{item.mrr.toLocaleString("en-IN")}</p>
                              <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5 font-semibold">{item.month}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-450 dark:text-gray-400 text-center font-bold">{item.month.split(' ')[0]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Plan breakdown */}
            <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-800/40 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="font-bold text-gray-950 dark:text-white mb-6">Workspace Subscription Breakdown</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {PLANS.map((plan) => {
                  const theme = PLAN_THEMES[plan];
                  const Icon = PLAN_ICONS[plan];
                  const count = stats.plan_breakdown?.[plan] ?? 0;
                  return (
                    <div key={plan} className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg ${theme.cardBg} ${theme.borderClass} group`}>
                      {/* Subtly glowing backplane */}
                      <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full ${theme.glow} blur-xl group-hover:scale-125 transition-transform duration-500`} />
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.iconBg} ${theme.textIcon} border border-black/5 dark:border-white/5`}>
                          <Icon size={16} />
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}>
                          {plan}
                        </span>
                      </div>
                      
                      <p className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">{count}</p>
                      
                      {/* Visual progress scale bar */}
                      <div className="h-1 bg-gray-200/50 dark:bg-gray-800/60 rounded-full mt-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${theme.accentBar}`}
                          style={{ width: `${Math.min(100, count > 0 ? (count / (stats.total_workspaces || 1)) * 100 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Active Workspaces", value: stats.active_workspaces, themeKey: "active" },
                { label: "Total Contacts", value: stats.total_contacts?.toLocaleString() ?? 0, themeKey: "contacts" },
                { label: "Total Flows", value: stats.total_flows?.toLocaleString() ?? 0, themeKey: "flows" },
              ].map((qs, i) => {
                const theme = QUICK_THEMES[qs.themeKey];
                return (
                  <div key={i} className={`relative overflow-hidden bg-white/70 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-800/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${theme.border}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{qs.label}</p>
                        <p className={`text-2xl font-extrabold mt-1.5 ${theme.text}`}>{qs.value}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${qs.themeKey === "active" ? "bg-green-500 animate-pulse" : qs.themeKey === "contacts" ? "bg-blue-500" : "bg-violet-500"}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── WORKSPACES ── */}
        {tab === "workspaces" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full max-w-md">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Search size={16} />
                  </div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search workspace name, slug, email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-900/60 border border-gray-250/60 dark:border-gray-800/50 rounded-xl text-sm text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all shadow-sm"
                  />
                </div>
                <button
                  onClick={loadWorkspaces}
                  disabled={loading}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 active:scale-95 transition-all shadow-sm"
                  title="Refresh List"
                >
                  <RefreshCw size={15} className={`${loading ? "animate-spin text-brand-500" : ""}`} />
                </button>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-250/60 dark:border-gray-800/50 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800/50">
                    <th className="px-6 py-4 font-bold">Workspace</th>
                    <th className="px-6 py-4 font-bold">Owner</th>
                    <th className="px-6 py-4 font-bold">Plan</th>
                    <th className="px-6 py-4 font-bold">Subscription</th>
                    <th className="px-6 py-4 font-bold text-center">Messages</th>
                    <th className="px-6 py-4 text-center font-bold">Contacts</th>
                    <th className="px-6 py-4 text-center font-bold">WhatsApp</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-14 text-gray-500 dark:text-gray-400 font-semibold">
                        <RefreshCw size={24} className="animate-spin text-brand-500 mx-auto mb-3" />
                        Loading workspaces...
                      </td>
                    </tr>
                  ) : workspaces.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-14 text-gray-400 dark:text-gray-500 font-medium">
                        No workspaces found
                      </td>
                    </tr>
                  ) : workspaces.map((ws) => (
                    <tr key={ws.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4.5">
                        <button
                          onClick={() => loadWorkspaceDetail(ws.id)}
                          className="text-left hover:text-brand-500 dark:hover:text-brand-400 transition-colors focus:outline-none group"
                        >
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{ws.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-550 mt-0.5">{ws.slug}</p>
                        </button>
                      </td>
                      <td className="px-6 py-4.5">
                        <p className="text-gray-800 dark:text-gray-300 font-bold">{ws.owner_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{ws.owner_email}</p>
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge label={ws.plan} color={PLAN_COLOR_MAP[ws.plan] ?? "gray"} variant="soft" />
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge label={ws.subscription_status} color={STATUS_COLOR_MAP[ws.subscription_status] ?? "gray"} variant="soft" />
                        {ws.subscription_end && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">
                            until {new Date(ws.subscription_end * 1000).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-center font-bold text-gray-800 dark:text-gray-300">
                        {ws.messages_sent?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-6 py-4.5 text-center font-bold text-gray-800 dark:text-gray-300">
                        {ws.contacts?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${ws.whatsapp_connected ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600"}`}>
                          {ws.whatsapp_connected ? "✓" : "✗"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${ws.is_active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ws.is_active ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                          {ws.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setPlanModal(ws); setSelectedPlan(ws.plan); }}
                            className="px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-100/60 dark:border-blue-500/20 rounded-lg transition-all"
                          >
                            Plan
                          </button>
                          <button
                            onClick={() => { setExtendModal(ws); setExtendDays(30); }}
                            className="px-2.5 py-1.5 text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 border border-green-100/60 dark:border-green-500/20 rounded-lg transition-all"
                          >
                            Extend
                          </button>
                          <button
                            onClick={() => { setPaymentsModal(ws); loadPayments(ws.id); setShowAddPayment(false); }}
                            className="px-2.5 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 border border-purple-100/60 dark:border-purple-500/20 rounded-lg transition-all"
                          >
                            Payments
                          </button>
                          <button
                            onClick={() => handleSuspendWs(ws.id, ws.is_active)}
                            className={`px-2.5 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                              ws.is_active
                                ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border-red-100/60 dark:border-red-500/20"
                                : "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 border-green-100/60 dark:border-green-500/20"
                            }`}
                          >
                            {ws.is_active ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full max-w-md">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <Search size={16} />
                  </div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search user name, email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-gray-900/60 border border-gray-250/60 dark:border-gray-800/50 rounded-xl text-sm text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all shadow-sm"
                  />
                </div>
                <button
                  onClick={loadUsers}
                  disabled={loading}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 active:scale-95 transition-all shadow-sm"
                  title="Refresh List"
                >
                  <RefreshCw size={15} className={`${loading ? "animate-spin text-brand-500" : ""}`} />
                </button>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-250/60 dark:border-gray-800/50 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800/50">
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold">Joined</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-14 text-gray-500 dark:text-gray-400 font-semibold">
                        <RefreshCw size={24} className="animate-spin text-brand-500 mx-auto mb-3" />
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-14 text-gray-400 dark:text-gray-500 font-medium">
                        No users found
                      </td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-emerald-600 flex items-center justify-center text-white text-xs font-black shadow-sm select-none">
                            {u.full_name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-gray-650 dark:text-gray-400 font-medium">{u.email}</td>
                      <td className="px-6 py-4.5 text-gray-400 dark:text-gray-500 text-xs font-semibold">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4.5">
                        {u.is_superadmin ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                            <Shield size={12} className="animate-pulse" />
                            Superadmin
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider pl-1.5">User</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.is_active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditUserModal(u); setEditUserForm({ full_name: u.full_name, email: u.email }); }}
                            className="px-2.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-100/60 dark:border-blue-500/20 rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSuperadmin(u.id, u.is_superadmin)}
                            className="px-2.5 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-100/60 dark:border-amber-500/20 rounded-lg transition-all"
                          >
                            {u.is_superadmin ? "Revoke" : "Admin"}
                          </button>
                          <button
                            onClick={() => handleSuspendUser(u.id, u.is_active)}
                            className={`px-2.5 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                              u.is_active
                                ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border-red-100/60 dark:border-red-500/20"
                                : "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 border-green-100/60 dark:border-green-500/20"
                            }`}
                          >
                            {u.is_active ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Plan change modal */}
      <Modal
        open={!!planModal}
        onClose={() => setPlanModal(null)}
        title="Change Subscription Plan"
        width="max-w-sm"
      >
        {planModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Workspace: <span className="text-gray-900 dark:text-white font-bold">{planModal.name}</span>
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PLANS.map((p) => {
                const planTheme = PLAN_THEMES[p];
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPlan(p)}
                    className={`py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all ${
                      selectedPlan === p
                        ? `${planTheme.accentBar} border-transparent text-white shadow-md shadow-brand-500/10`
                        : "bg-white dark:bg-gray-800/50 border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={handleChangePlan}
              fullWidth
              variant="primary"
            >
              Apply Plan
            </Button>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={!!editUserModal}
        onClose={() => setEditUserModal(null)}
        title="Edit User Info"
        width="max-w-md"
      >
        {editUserModal && (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={editUserForm.full_name}
              onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
              placeholder="Enter full name"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={editUserForm.email}
              onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              placeholder="Enter email"
              required
            />
            <div className="pt-2">
              <Button
                onClick={handleEditUser}
                fullWidth
                variant="primary"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Extend Validity Modal */}
      <Modal
        open={!!extendModal}
        onClose={() => setExtendModal(null)}
        title="Extend Subscription Validity"
        width="max-w-md"
      >
        {extendModal && (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Workspace: <span className="text-gray-900 dark:text-white font-bold">{extendModal.name}</span>
              </p>
              {extendModal.subscription_end && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-semibold">
                  Current expiry: <span className="text-gray-700 dark:text-gray-300">{new Date(extendModal.subscription_end * 1000).toLocaleDateString()}</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Add Days</label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 15, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setExtendDays(d)}
                    className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                      extendDays === d
                        ? "bg-green-600 border-transparent text-white shadow-md shadow-green-600/10"
                        : "bg-white dark:bg-gray-800/50 border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
              <Input
                type="number"
                label="Custom Days"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                placeholder="Custom days"
                min="1"
                required
              />
            </div>

            {extendModal.subscription_end && (
              <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-400 dark:text-gray-550 font-semibold">New expiry date:</p>
                <p className="text-base text-green-600 dark:text-green-400 font-bold mt-1">
                  {new Date(extendModal.subscription_end * 1000 + extendDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            )}

            <Button
              onClick={handleExtendValidity}
              fullWidth
              variant="success"
            >
              Extend Subscription
            </Button>
          </div>
        )}
      </Modal>

      {/* Payments Modal */}
      <Modal
        open={!!paymentsModal}
        onClose={() => setPaymentsModal(null)}
        title="Manual Payment Records"
        width="max-w-xl"
      >
        {paymentsModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Workspace: <span className="text-gray-900 dark:text-white font-bold">{paymentsModal.name}</span>
            </p>

            {!showAddPayment ? (
              <>
                <Button
                  onClick={() => setShowAddPayment(true)}
                  fullWidth
                  variant="primary"
                  className="mb-2"
                >
                  + Add Manual Payment
                </Button>

                {payments.length === 0 ? (
                  <div className="text-center py-10 text-gray-450 dark:text-gray-500">
                    <CreditCard size={32} className="mx-auto mb-2 opacity-30 animate-pulse" />
                    <p className="text-sm font-semibold">No payment records found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {payments.map((p: any, i: number) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-900/40 border border-gray-250/60 dark:border-gray-800/80 rounded-xl p-4 transition-all hover:border-gray-300 dark:hover:border-gray-700/80">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-950 dark:text-white">₹{(p.amount / 100).toLocaleString("en-IN")}</p>
                            <p className="text-xs text-gray-450 dark:text-gray-500 mt-1 font-semibold">{p.method || "Online"}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              p.status === "captured"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-450 border border-gray-200 dark:border-gray-700"
                            }`}>
                              {p.status || "completed"}
                            </span>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-bold">
                              {p.created_at ? new Date(p.created_at * 1000).toLocaleDateString() : "—"}
                            </p>
                          </div>
                        </div>
                        {p.description && (
                          <div className="mt-3 pt-2.5 border-t border-gray-200/50 dark:border-gray-800/50">
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic font-semibold">{p.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <Input
                  type="number"
                  label="Amount (₹)"
                  value={paymentForm.amount_inr}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount_inr: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter amount"
                  min="0"
                  required
                />
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Plan</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PLANS.map((p) => {
                      const planTheme = PLAN_THEMES[p];
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPaymentForm({ ...paymentForm, plan: p })}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                            paymentForm.plan === p
                              ? `${planTheme.accentBar} border-transparent text-white shadow-md shadow-brand-500/10`
                              : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Note (optional)</label>
                  <textarea
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                    className="w-full bg-white dark:bg-gray-800/50 border border-gray-250 dark:border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all shadow-sm"
                    placeholder="Payment note or reference"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setShowAddPayment(false)}
                    variant="ghost"
                    className="flex-1 border border-gray-200 dark:border-gray-800 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPayment}
                    variant="primary"
                    className="flex-1 font-bold"
                  >
                    Add Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Workspace Detail Modal */}
      <Modal
        open={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Workspace Detail Metadata"
        width="max-w-3xl"
      >
        {detailModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-brand-500/10">
                <Building2 size={22} />
              </div>
              <div>
                <p className="font-extrabold text-gray-950 dark:text-white text-lg tracking-tight">{detailModal.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mt-0.5">{detailModal.slug}</p>
              </div>
            </div>

            {detailLoading ? (
              <div className="text-center py-10 text-gray-500 font-semibold">Loading details...</div>
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-250/60 dark:border-gray-850 rounded-xl p-4">
                    <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">Plan</p>
                    <Badge label={detailModal.plan} color={PLAN_COLOR_MAP[detailModal.plan] ?? "gray"} variant="soft" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-250/60 dark:border-gray-850 rounded-xl p-4">
                    <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">Status</p>
                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${detailModal.is_active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${detailModal.is_active ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                      {detailModal.is_active ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-250/60 dark:border-gray-850 rounded-xl p-4">
                    <p className="text-xs text-gray-455 dark:text-gray-500 font-bold uppercase tracking-wider mb-2.5">Created</p>
                    <p className="text-sm text-gray-850 dark:text-white font-bold">{detailModal.created_at ? new Date(detailModal.created_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-250/60 dark:border-gray-850 rounded-xl p-4">
                    <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider mb-2">WhatsApp</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                      detailModal.whatsapp_phone_number_id 
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20" 
                        : "bg-gray-100 text-gray-600 dark:bg-gray-850 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
                    }`}>
                      {detailModal.whatsapp_phone_number_id ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>

                {/* Owner Info */}
                {detailModal.owner && (
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-255 dark:border-gray-850 rounded-xl p-4">
                    <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider mb-3">Owner</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-emerald-600 flex items-center justify-center text-white text-sm font-extrabold shadow-sm">
                        {detailModal.owner.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white font-bold">{detailModal.owner.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-455 font-bold mt-0.5">{detailModal.owner.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Info */}
                {detailModal.subscription && (
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-255 dark:border-gray-855 rounded-xl p-4">
                    <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider mb-3">Subscription Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Status</p>
                        <div className="mt-1.5">
                          <Badge label={detailModal.subscription.status} color={STATUS_COLOR_MAP[detailModal.subscription.status] ?? "gray"} variant="soft" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-450 dark:text-gray-500 font-semibold">Period End</p>
                        <p className="text-sm text-gray-800 dark:text-white font-bold mt-1.5">
                          {detailModal.subscription.period_end ? new Date(detailModal.subscription.period_end).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      {detailModal.subscription.razorpay_id && (
                        <div className="col-span-2 pt-2 border-t border-gray-200/50 dark:border-gray-800/50">
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Razorpay ID</p>
                          <p className="text-xs text-gray-600 dark:text-gray-305 font-mono mt-1 select-all">{detailModal.subscription.razorpay_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Usage Stats */}
                {detailModal.usage && (
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-255 dark:border-gray-850 rounded-xl p-5">
                    <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider mb-4">Usage Statistics</p>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="hover:scale-102 transition-transform">
                        <p className="text-2xl font-black text-green-500 dark:text-green-400">{detailModal.usage.messages_sent?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">Sent</p>
                      </div>
                      <div className="hover:scale-102 transition-transform">
                        <p className="text-2xl font-black text-blue-500 dark:text-blue-400">{detailModal.usage.messages_received?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">Received</p>
                      </div>
                      <div className="hover:scale-102 transition-transform">
                        <p className="text-2xl font-black text-violet-500 dark:text-violet-400">{detailModal.usage.contacts?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">Contacts</p>
                      </div>
                      <div className="hover:scale-102 transition-transform">
                        <p className="text-2xl font-black text-amber-500 dark:text-amber-400">{detailModal.usage.flows?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">Flows</p>
                      </div>
                      <div className="hover:scale-102 transition-transform">
                        <p className="text-2xl font-black text-pink-500 dark:text-pink-400">{detailModal.usage.flow_runs?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">Runs</p>
                      </div>
                      <div className="hover:scale-102 transition-transform">
                        <p className="text-2xl font-black text-cyan-500 dark:text-cyan-400">{(detailModal.usage.this_month?.messages || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">This Month</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Details */}
                {detailModal.whatsapp_phone_number_id && (
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-255 dark:border-gray-850 rounded-xl p-4">
                    <p className="text-xs text-gray-450 dark:text-gray-500 font-bold uppercase tracking-wider mb-3">WhatsApp Configuration</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold">Phone Number ID</p>
                        <p className="text-xs text-gray-800 dark:text-gray-300 font-mono mt-1 select-all">{detailModal.whatsapp_phone_number_id}</p>
                      </div>
                      {detailModal.whatsapp_business_account_id && (
                        <div className="pt-2 border-t border-gray-200/50 dark:border-gray-800/30">
                          <p className="text-[10px] text-gray-450 dark:text-gray-500 font-semibold">Business Account ID</p>
                          <p className="text-xs text-gray-800 dark:text-gray-300 font-mono mt-1 select-all">{detailModal.whatsapp_business_account_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

