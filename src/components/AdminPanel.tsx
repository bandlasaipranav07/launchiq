import React, { useState } from "react";
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Trash2, 
  Search, 
  Calendar, 
  Mail, 
  Database,
  RefreshCw
} from "lucide-react";
import { 
  UserProfile, 
  Report, 
  ActivityLog, 
  SystemStats 
} from "../types";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from "recharts";

interface AdminPanelProps {
  stats: SystemStats;
  usersList: UserProfile[];
  reportsList: Report[];
  logsList: ActivityLog[];
  onRefreshStats: () => void;
  onDeleteReport: (id: string) => void;
  onDeleteUser?: (uid: string) => void;
}

export default function AdminPanel({
  stats,
  usersList,
  reportsList,
  logsList,
  onRefreshStats,
  onDeleteReport,
  onDeleteUser
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "users" | "reports" | "logs">("metrics");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usersList.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredReports = reportsList.filter(r => 
    r.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.investorSummary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logsList.filter(l => 
    l.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Growth analytics data
  const platformGrowthGrading = [
    { name: "Day 1", Users: 2, Reports: 1 },
    { name: "Day 2", Users: 5, Reports: 3 },
    { name: "Day 3", Users: 9, Reports: 6 },
    { name: "Day 4", Users: 14, Reports: 11 },
    { name: "Day 5", Users: usersList.length, Reports: reportsList.length }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-200">
      {/* Header section with Stats update button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e]">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-[#131625] text-violet-400 rounded-xl shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] border border-white/[0.01]">
            <ShieldCheck className="w-5 h-5 text-violet-450 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Platform Administrator Core Mode</h2>
            <p className="text-slate-400 text-xs mt-1.5 font-semibold leading-normal">Global LaunchIQ system analytics and resource monitoring</p>
          </div>
        </div>
        <button 
          onClick={onRefreshStats} 
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#131625] hover:bg-[#1a1e33] border border-violet-500/10 text-violet-400 hover:text-white rounded-xl shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] text-xs transition duration-200 font-bold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-violet-400" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users card */}
        <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[4px_4px_12px_#07090f,-4px_-4px_12px_#1f253e]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-450 uppercase tracking-wider font-mono font-bold">Platform Members</p>
              <h3 className="text-2xl font-black text-white mt-1.5">{stats.totalUsers}</h3>
            </div>
            <div className="p-2 bg-[#0b0e18] text-violet-400 rounded-lg shadow-[inset_1px_1px_3px_#040509,inset_-1px_-1px_3px_#14192a]">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Total Reports card */}
        <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[4px_4px_12px_#07090f,-4px_-4px_12px_#1f253e]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-450 uppercase tracking-wider font-mono font-bold">Reports Generated</p>
              <h3 className="text-2xl font-black text-white mt-1.5">{stats.totalReports}</h3>
            </div>
            <div className="p-2 bg-[#0b0e18] text-indigo-400 rounded-lg shadow-[inset_1px_1px_3px_#040509,inset_-1px_-1px_3px_#14192a]">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Total Projects card */}
        <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[4px_4px_12px_#07090f,-4px_-4px_12px_#1f253e]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-455 text-slate-450 uppercase tracking-wider font-mono font-bold">Active Projects</p>
              <h3 className="text-2xl font-black text-white mt-1.5">{stats.totalProjects}</h3>
            </div>
            <div className="p-2 bg-[#0b0e18] text-pink-400 rounded-lg shadow-[inset_1px_1px_3px_#040509,inset_-1px_-1px_3px_#14192a]">
              <Database className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Engagement active user ratio */}
        <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[4px_4px_12px_#07090f,-4px_-4px_12px_#1f253e]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-450 uppercase tracking-wider font-mono font-bold">Daily Accesses</p>
              <h3 className="text-2xl font-black text-white mt-1.5">
                {stats.activeUsersCount} <span className="text-slate-450 text-xs font-normal">DAUs</span>
              </h3>
            </div>
            <div className="p-2 bg-[#0b0e18] text-cyan-400 rounded-lg shadow-[inset_1px_1px_3px_#040509,inset_-1px_-1px_3px_#14192a]">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin layout tab structure */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 bg-[#131625] border border-white/[0.02] rounded-2xl p-4 space-y-1.5 shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e]">
          <button
            onClick={() => { setActiveTab("metrics"); setSearchTerm(""); }}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === "metrics" 
                ? "bg-[#1a1e33] text-violet-400 font-extrabold shadow-[2px_2px_6px_#040509,-2px_-2px_6px_#242b47,0_0_10px_rgba(168,85,247,0.1)] border border-white/[0.01]" 
                : "text-slate-400 hover:text-white hover:bg-white/[0.01]"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>SaaS Analytics Overview</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("users"); setSearchTerm(""); }}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === "users" 
                ? "bg-[#1a1e33] text-violet-400 font-extrabold shadow-[2px_2px_6px_#040509,-2px_-2px_6px_#242b47,0_0_10px_rgba(168,85,247,0.1)] border border-white/[0.01]" 
                : "text-slate-400 hover:text-white hover:bg-white/[0.01]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts ({usersList.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("reports"); setSearchTerm(""); }}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === "reports" 
                ? "bg-[#1a1e33] text-violet-400 font-extrabold shadow-[2px_2px_6px_#040509,-2px_-2px_6px_#242b47,0_0_10px_rgba(168,85,247,0.1)] border border-white/[0.01]" 
                : "text-slate-400 hover:text-white hover:bg-white/[0.01]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Validation Reports ({reportsList.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("logs"); setSearchTerm(""); }}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === "logs" 
                ? "bg-[#1a1e33] text-violet-400 font-extrabold shadow-[2px_2px_6px_#040509,-2px_-2px_6px_#242b47,0_0_10px_rgba(168,85,247,0.1)] border border-white/[0.01]" 
                : "text-slate-400 hover:text-white hover:bg-white/[0.01]"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Daily Audit Logs ({logsList.length})</span>
          </button>
        </div>

        {/* Large Admin Workspace Column */}
        <div className="lg:col-span-3 bg-[#131625] border border-white/[0.02] rounded-2xl p-5 sm:p-6 shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e] min-h-[460px]">
          {/* Active Tab rendering */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-200">Growth Projection & Usage Curves</h3>
                <div className="h-0.5 bg-gradient-to-r from-violet-500 to-transparent w-16 mt-1 rounded-full"></div>
              </div>

              {/* Usage graph */}
              <div className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                <p className="text-[10px] uppercase font-bold text-slate-405 text-slate-400 font-mono mb-3 block">Engagement Velocity Index</p>
                <div className="w-full h-60 text-xs text-slate-400 font-bold font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={platformGrowthGrading}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: "#0b0e18", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", color: "#f8fafc" }} />
                      <Line type="monotone" dataKey="Users" stroke="#8B5CF6" strokeWidth={2.5} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Reports" stroke="#0ea5e9" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] text-xs space-y-2 font-sans font-semibold text-slate-400">
                <p className="font-bold text-slate-200">Database Context</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>Firestore ID: <span className="text-violet-400 font-mono">ai-studio-pro</span></div>
                  <div>Sync Mode: <span className="text-violet-400 font-bold">Real-time Connection</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-200">User Management</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="bg-[#0b0e18] border border-white/[0.02] rounded-xl text-xs py-2 pl-8 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
                  />
                </div>
              </div>

              {/* Users table */}
              <div className="overflow-x-auto select-none">
                <table className="w-full text-xs text-left text-slate-400">
                  <thead className="text-[10px] text-slate-450 uppercase bg-[#0b0e18] border-b border-white/[0.02] font-black">
                    <tr>
                      <th className="px-4 py-2.5 font-bold tracking-wider text-slate-350">Profile</th>
                      <th className="px-4 py-2.5 font-bold tracking-wider text-slate-350">Role</th>
                      <th className="px-4 py-2.5 font-bold tracking-wider text-slate-350">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02] font-semibold">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-slate-500 font-semibold">No matching user accounts found.</td>
                      </tr>
                    ) : (
                      filteredUsers.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-200">{item.displayName || "Anonymous"}</p>
                            <p className="text-[11px] text-slate-550 font-mono mt-0.5">{item.email}</p>
                          </td>
                          <td className="px-4 py-3 capitalize font-bold text-violet-400">{item.role}</td>
                          <td className="px-4 py-3 text-slate-405 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-200">System Report Resources</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reports..."
                    className="bg-[#0b0e18] border border-white/[0.02] rounded-xl text-xs py-2 pl-8 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
                  />
                </div>
              </div>

              {/* Reports dynamic list */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {filteredReports.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs py-8 font-semibold">No reports found matching your parameters.</p>
                ) : (
                  filteredReports.map((item) => (
                    <div key={item.id} className="p-3.5 bg-[#131625] border border-white/[0.01] rounded-xl flex items-center justify-between gap-4 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                      <div className="min-w-0 font-semibold">
                        <h4 className="font-bold text-xs text-slate-200 truncate">{item.projectName}</h4>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-450 mt-1 font-mono">
                          <span>Score: {item.score}</span>
                          <span>•</span>
                          <span>Date: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => { if (item.id) onDeleteReport(item.id); }}
                        className="px-3.5 py-1.5 bg-[#1d121c] border border-red-500/10 hover:bg-[#2e152d] text-red-400 text-xs rounded-xl shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition cursor-pointer font-bold shrink-0"
                      >
                        Delete Report
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-200">Real-time Platform Audit Log</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search actions..."
                    className="bg-[#0b0e18] border border-white/[0.02] rounded-xl text-xs py-2 pl-8 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
                  />
                </div>
              </div>

              {/* Logs terminal block */}
              <div className="bg-[#090b13] border border-white/[0.02] p-4 rounded-xl font-mono text-[11px] leading-relaxed text-indigo-400 space-y-2 h-[320px] overflow-y-auto custom-scrollbar shadow-[inset_2.5px_2.5px_6px_#020306,inset_-2.5px_-2.5px_6px_#0f121d]">
                {filteredLogs.length === 0 ? (
                  <p className="text-slate-550 text-slate-500 py-6 text-center">No audit trail entries matched.</p>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="border-b border-white/[0.01] pb-2 last:border-0 last:pb-0 mb-1.5 leading-relaxed">
                      <div className="flex justify-between items-start text-[10px] font-bold text-slate-500 font-mono">
                        <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                        <span className="text-violet-400 truncate max-w-[150px]">{log.userEmail}</span>
                      </div>
                      <p className="text-[#a78bfa] mt-1 font-semibold">&gt; {log.action}</p>
                      <p className="text-slate-400 text-[10px] pl-3 leading-normal mt-0.5">{log.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
