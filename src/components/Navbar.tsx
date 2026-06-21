import React, { useState } from "react";
import { 
  Rocket, 
  LogOut, 
  User, 
  Bell, 
  Shield, 
  Activity, 
  Settings,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { UserProfile, Notification } from "../types";

interface NavbarProps {
  user: UserProfile | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
}

export default function Navbar({
  user,
  activeView,
  setActiveView,
  onLogout,
  notifications,
  onMarkNotificationRead
}: NavbarProps) {
  const [showProgressProfile, setShowProgressProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#131625] border border-white/[0.02] rounded-2xl px-6 py-3 shadow-[6px_6px_16px_#07090f,-6px_-6px_16px_#1f253e]">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView("dashboard")} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="p-2.5 bg-[#131625] rounded-xl shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] md:group-hover:scale-105 transition-transform duration-200">
            <Rocket className="w-5 h-5 text-violet-400 neon-glow-purple" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              Launch<span className="text-violet-400 font-black">IQ</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] px-1.5 py-0.5 bg-[#0b0e18] text-violet-300 border border-violet-500/10 rounded font-mono">
              SaaS AI
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        {user && (
          <div className="hidden md:flex items-center space-x-2.5 font-medium text-sm">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold cursor-pointer ${
                activeView === "dashboard"
                  ? "neu-btn-active-glow text-violet-400"
                  : "text-slate-400 hover:text-white hover:bg-[#1f253e]/20"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView("analyze")}
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold cursor-pointer ${
                activeView === "analyze"
                  ? "neu-btn-active-glow text-violet-400"
                  : "text-slate-400 hover:text-white hover:bg-[#1f253e]/20"
              }`}
            >
              Launch Advisor
            </button>
            <button
              onClick={() => setActiveView("reports")}
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold cursor-pointer ${
                activeView === "reports"
                  ? "neu-btn-active-glow text-violet-400"
                  : "text-slate-400 hover:text-white hover:bg-[#1f253e]/20"
              }`}
            >
              Saved Reports
            </button>
            <button
              onClick={() => setActiveView("mentor")}
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold cursor-pointer ${
                activeView === "mentor"
                  ? "neu-btn-active-glow text-violet-400"
                  : "text-slate-400 hover:text-white hover:bg-[#1f253e]/20"
              }`}
            >
              AI Mentor
            </button>
            {user.role === "admin" && (
              <button
                onClick={() => setActiveView("admin")}
                className={`px-4 py-2.5 rounded-xl flex items-center space-x-1.5 font-semibold transition-all duration-200 cursor-pointer ${
                  activeView === "admin"
                    ? "neu-btn-active-glow text-rose-400 border-rose-500/20"
                    : "text-rose-400/80 hover:text-rose-300 hover:bg-[#1f253e]/20"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Hub</span>
              </button>
            )}
          </div>
        )}

        {/* User profile, Notification Icons */}
        {user ? (
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-slate-400 hover:text-white bg-[#131625] rounded-xl shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:bg-[#1f253e]/20 transition duration-150 relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[#131625] leading-none animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown (Dark Neumorphic) */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#131625] border border-white/[0.02] rounded-2xl overflow-hidden shadow-[8px_8px_24px_#06080d] z-50 text-left">
                  <div className="px-4 py-3 border-b border-white/[0.03] flex justify-between items-center bg-[#0b0e18]">
                    <span className="font-semibold text-sm text-slate-200">Alerts & Status</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.02] custom-scrollbar bg-[#0b0e18]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs font-medium">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 transition-colors ${notif.read ? "bg-transparent" : "bg-violet-500/5"} flex items-start space-x-2.5`}
                        >
                          <div className="mt-0.5">
                            {notif.type === "success" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-violet-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-slate-200">{notif.title}</p>
                            <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">{notif.message}</p>
                            {!notif.read && notif.id && (
                              <button 
                                onClick={() => onMarkNotificationRead(notif.id!)}
                                className="text-[10px] text-violet-400 hover:text-violet-300 font-bold mt-1 inline-block cursor-pointer"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowProgressProfile(!showProgressProfile)}
                className="flex items-center space-x-2 bg-[#131625] hover:bg-[#1a1e33] px-3.5 py-1.5 rounded-xl shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[2px_2px_5px_#07090f,-2px_2px_5px_#1f253e] transition duration-150 text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-200 leading-none truncate max-w-[120px]">
                    {user.displayName || "Entrepreneur"}
                  </p>
                  <p className="text-[9px] text-violet-400 font-mono mt-1 truncate max-w-[120px] uppercase font-bold tracking-wider font-bold">
                    {user.role} Pnl
                  </p>
                </div>
              </button>

              {showProgressProfile && (
                <div className="absolute right-0 mt-3 w-64 bg-[#131625] border border-white/[0.03] rounded-2xl overflow-hidden shadow-[8px_8px_24px_#06080d] z-50 text-left p-4 space-y-4">
                  <div className="border-b border-white/[0.03] pb-3">
                    <p className="font-bold text-sm text-slate-100 truncate">{user.displayName || "Entrepreneur"}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    <span className="inline-block mt-2 text-[9px] font-mono px-2 py-0.5 bg-[#0b0e18] text-violet-400 border border-violet-500/20 rounded-full font-bold capitalize">
                      {user.role} Mode
                    </span>
                  </div>

                  <div className="space-y-1">
                    <button 
                      onClick={() => { setActiveView("dashboard"); setShowProgressProfile(false); }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-slate-300 hover:text-white rounded-xl hover:bg-neutral-800/20 transition text-xs font-semibold cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-violet-400" />
                      <span>My Profile & Projects</span>
                    </button>
                    {user.role === "admin" && (
                      <button 
                        onClick={() => { setActiveView("admin"); setShowProgressProfile(false); }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 text-rose-400 hover:text-rose-300 rounded-xl hover:bg-neutral-800/20 transition text-xs font-semibold cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-rose-500" />
                        <span>Admin hub</span>
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={() => { onLogout(); setShowProgressProfile(false); }}
                    className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-4 py-2 border border-rose-500/20 rounded-xl transition text-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setActiveView("login")} 
            className="flex items-center space-x-2 bg-[#131625] hover:bg-[#1a1e33] px-5 py-2.5 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition duration-150 cursor-pointer"
          >
            <span>Launch Pad login</span>
          </button>
        )}
      </div>

      {/* Mobile Menu Bar */}
      {user && (
        <div className="md:hidden flex justify-around mt-4 bg-[#131625] border border-white/[0.01] rounded-2xl p-2.5 shadow-[4px_4px_12px_#07090f,-4px_-4px_12px_#1f253e] text-xs">
          <button 
            onClick={() => setActiveView("dashboard")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeView === "dashboard" ? "bg-[#0b0e18] text-violet-400 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]" : "text-slate-400 hover:text-white"}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView("analyze")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeView === "analyze" ? "bg-[#0b0e18] text-violet-400 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]" : "text-slate-400 hover:text-white"}`}
          >
            New Idea
          </button>
          <button 
            onClick={() => setActiveView("reports")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeView === "reports" ? "bg-[#0b0e18] text-violet-400 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]" : "text-slate-400 hover:text-white"}`}
          >
            Reports
          </button>
          <button 
            onClick={() => setActiveView("mentor")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeView === "mentor" ? "bg-[#0b0e18] text-violet-400 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]" : "text-slate-400 hover:text-white"}`}
          >
            AI Mentor
          </button>
        </div>
      )}
    </nav>
  );
}
