import React, { useState, useEffect } from "react";
import { 
  Rocket, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Users, 
  ShieldAlert, 
  FileText, 
  Activity, 
  Shield, 
  Search, 
  Bell, 
  PlusCircle, 
  MessageSquare, 
  TrendingDown, 
  Award, 
  ArrowRight,
  Info,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  LogOut,
  Mail,
  Lock,
  UserCheck,
  Globe
} from "lucide-react";
import { 
  auth, 
  db, 
  googleProvider,
  OperationType,
  handleFirestoreError
} from "./lib/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  increment
} from "firebase/firestore";
import { 
  UserProfile, 
  Project, 
  Report, 
  Notification, 
  ActivityLog, 
  SystemStats 
} from "./types";
import Navbar from "./components/Navbar";
import BusinessAnalysisForm from "./components/BusinessAnalysisForm";
import ReportViewer from "./components/ReportViewer";
import MentorPanel from "./components/MentorPanel";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Navigation and UI state
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Selected resource pointers
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedMentorProjectId, setSelectedMentorProjectId] = useState<string>("");

  // Admin and global statistics state
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalReports: 0,
    totalProjects: 0,
    activeUsersCount: 0,
    updatedAt: new Date().toISOString()
  });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [allLogs, setAllLogs] = useState<ActivityLog[]>([]);

  // Track user session changes
  useEffect(() => {
    // 1. Initial check for Guest mode auto-login
    const activeUser = localStorage.getItem("launchiq_active_user");
    if (activeUser === "guest_user") {
      const guestUser: UserProfile = {
        uid: "guest_user",
        email: "guest@launchiq.local",
        displayName: "Guest Explorer",
        role: "user",
        createdAt: new Date().toISOString()
      };
      setUser(guestUser);
      
      const storedProjects = localStorage.getItem("launchiq_guest_projects");
      const storedReports = localStorage.getItem("launchiq_guest_reports");
      const storedNotifications = localStorage.getItem("launchiq_guest_notifications");
      
      setProjects(storedProjects ? JSON.parse(storedProjects) : []);
      setReports(storedReports ? JSON.parse(storedReports) : []);
      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : [
        {
          id: "welcome-guest",
          userId: "guest_user",
          title: "Welcome to Guest Mode!",
          message: "You are running in Guest mode. Any analysis reports generated will be persisted in your local browser sandbox.",
          type: "info",
          read: false,
          createdAt: new Date().toISOString()
        }
      ]);
      setAuthLoading(false);
    }

    // 2. Subscribe to Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const currentActiveUser = localStorage.getItem("launchiq_active_user");
      if (currentActiveUser !== "guest_user") {
        setAuthLoading(true);
      }
      
      if (firebaseUser) {
        localStorage.setItem("launchiq_active_user", firebaseUser.uid);
        
        // Fetch custom user profile info or create one
        const userDocRef = doc(db, "users", firebaseUser.uid);
        let userDocSnap;
        try {
          userDocSnap = await getDoc(userDocRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setAuthLoading(false);
          return;
        }

        let profile: UserProfile;

        if (userDocSnap && userDocSnap.exists()) {
          const data = userDocSnap.data();
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: data.displayName || firebaseUser.displayName,
            role: data.role || "user",
            createdAt: data.createdAt || new Date().toISOString()
          };
        } else {
          // Identify first user as admin, default others to user
          const adminCandidates = ["bandlasaipranav@gmail.com"];
          const role = adminCandidates.includes(firebaseUser.email || "") ? "admin" : "user";
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || displayName || "Launcher",
            role: role as "user" | "admin",
            createdAt: new Date().toISOString()
          };
          try {
            await setDoc(userDocRef, profile);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
          }

          // Update System stats user count
          try {
            await updateDoc(doc(db, "system", "stats"), {
              totalUsers: increment(1)
            });
          } catch (updateError) {
            try {
              // Document might not exist, initialize it safely
              await setDoc(doc(db, "system", "stats"), {
                totalUsers: 1,
                totalReports: 0,
                totalProjects: 0,
                activeUsersCount: 1,
                updatedAt: new Date().toISOString()
              });
            } catch (setError) {
              handleFirestoreError(setError, OperationType.WRITE, "system/stats");
            }
          }
        }

        setUser(profile);
        
        // Log user activity
        await logUserActivity(profile.uid, profile.email, "System Sign In", `User logged into LaunchIQ via ${firebaseUser.providerId || "Credentials"}`);

        // Pull initial collections
        setupUserSubscriptions(profile);
      } else {
        if (localStorage.getItem("launchiq_active_user") !== "guest_user") {
          setUser(null);
        }
      }
      setAuthLoading(false);
    });

    // Auto update system statistics initially
    fetchSystemStats();

    return () => unsubscribe();
  }, []);

  // Fetch administrator real-time system stats and global accounts
  const fetchSystemStats = async () => {
    try {
      const statsSnap = await getDoc(doc(db, "system", "stats"));
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalReports: data.totalReports ?? 0,
          totalProjects: data.totalProjects ?? 0,
          activeUsersCount: data.activeUsersCount ?? 0,
          updatedAt: data.updatedAt ?? new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Failed to retrieve metrics config:", e);
      if (auth.currentUser) {
        handleFirestoreError(e, OperationType.GET, "system/stats");
      }
    }
  };

  // Pull initial collections from Supabase backend REST API
  const setupUserSubscriptions = async (profile: UserProfile) => {
    try {
      const [resProj, resRep, resNotif] = await Promise.all([
        fetch(`/api/projects?userId=${profile.uid}`),
        fetch(`/api/reports?userId=${profile.uid}`),
        fetch(`/api/notifications?userId=${profile.uid}`)
      ]);

      if (resProj.ok) {
        const projs = await resProj.json();
        setProjects(projs);
      }
      if (resRep.ok) {
        const reps = await resRep.json();
        setReports(reps);
      }
      if (resNotif.ok) {
        const notifs = await resNotif.json();
        setNotifications(notifs);
      }

      if (profile.role === "admin") {
        setAllUsers([profile]);
        setAllReports([]);
        setAllLogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch user data from Supabase backend:", error);
    }
  };

  // Create systematic audit trails
  const logUserActivity = async (userId: string, email: string, action: string, details: string) => {
    if (userId === "guest_user") return;
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userEmail: email,
          action,
          details,
          createdAt: new Date().toISOString()
        })
      });
    } catch (e) {
      console.warn("Telemetry log failure:", e);
    }
  };

  const createNotification = async (userId: string, title: string, message: string, type: "info" | "alert" | "success") => {
    if (userId === "guest_user") {
      setNotifications(prev => [
        {
          id: `guest_notif_${Date.now()}`,
          userId,
          title,
          message,
          type,
          read: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
      return;
    }
    try {
      const newNotif = {
        id: `notif_${Date.now()}`,
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString()
      };
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotif)
      });
      setNotifications(prev => [newNotif, ...prev]);
    } catch (e) {
      console.warn("Notification logging failed:", e);
    }
  };

  // Auth Operations
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!email || !password) {
      setAuthError("Email and Password required");
      return;
    }

    try {
      if (authMode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName && credential.user) {
          await updateProfile(credential.user, { displayName });
        }
        setAuthSuccess("Account created! Logging in...");
      } else if (authMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (authMode === "forgot") {
        await sendPasswordResetEmail(auth, email);
        setAuthSuccess("Password reset instructions dispatched to your inbox.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An authentication issue occurred");
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(err.message || "Failed Google Authentication");
    }
  };

  const handleGuestAccess = () => {
    localStorage.setItem("launchiq_active_user", "guest_user");
    const guestUser: UserProfile = {
      uid: "guest_user",
      email: "guest@launchiq.local",
      displayName: "Guest Explorer",
      role: "user",
      createdAt: new Date().toISOString()
    };
    setUser(guestUser);

    const storedProjects = localStorage.getItem("launchiq_guest_projects");
    const storedReports = localStorage.getItem("launchiq_guest_reports");
    const storedNotifications = localStorage.getItem("launchiq_guest_notifications");

    setProjects(storedProjects ? JSON.parse(storedProjects) : []);
    setReports(storedReports ? JSON.parse(storedReports) : []);
    setNotifications(storedNotifications ? JSON.parse(storedNotifications) : [
      {
        id: "welcome-guest",
        userId: "guest_user",
        title: "Welcome to Guest Mode!",
        message: "You are running in Guest mode. Any analysis reports generated will be persisted in your local browser sandbox.",
        type: "info",
        read: false,
        createdAt: new Date().toISOString()
      }
    ]);
    setActiveView("dashboard");
  };

  const handleSignOut = async () => {
    localStorage.removeItem("launchiq_active_user");
    if (user && user.uid !== "guest_user") {
      await logUserActivity(user.uid, user.email, "User Sign Out", "Session manually closed by user");
      await signOut(auth);
    }
    setUser(null);
    setActiveView("dashboard");
  };

  // Mark in-app notifications read
  const handleMarkNotifRead = async (id: string) => {
    if (user?.uid === "guest_user") {
      setNotifications(prev => {
        const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem("launchiq_guest_notifications", JSON.stringify(next));
        return next;
      });
      return;
    }
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Failed to mark notification read in Supabase backend:", e);
    }
  };

  // Analyze Project Viability
  const handleNewAnalysis = async (formData: any) => {
    if (!user) return;
    setIsGenerating(true);

    try {
      // 1. Store project details inside Supabase via backend API
      let projRef;
      if (user.uid !== "guest_user") {
        const newProjId = `proj_${Date.now()}`;
        const newProj = {
          id: newProjId,
          userId: user.uid,
          name: formData.name,
          idea: formData.idea,
          industry: formData.industry,
          city: formData.city || "",
          state: formData.state || "",
          country: formData.country || "",
          budget: formData.budget || "",
          targetCustomers: formData.targetCustomers || "",
          stage: formData.stage || "",
          createdAt: new Date().toISOString()
        };

        try {
          const resProj = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProj)
          });
          if (!resProj.ok) throw new Error("Backend projects save failed");
          
          projRef = { id: newProjId };
          setProjects(prev => [newProj, ...prev]);
        } catch (e) {
          console.error("Supabase project sync failed:", e);
          throw e;
        }
      } else {
        projRef = { id: `guest_proj_${Date.now()}` };
        const localProj: Project = {
          id: projRef.id,
          userId: user.uid,
          name: formData.name,
          idea: formData.idea,
          industry: formData.industry,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          budget: formData.budget,
          targetCustomers: formData.targetCustomers,
          stage: formData.stage,
          createdAt: new Date().toISOString()
        };
        setProjects(prev => {
          const next = [...prev, localProj];
          localStorage.setItem("launchiq_guest_projects", JSON.stringify(next));
          return next;
        });
      }

      // 2. Fetch full AI advisor synthesized content
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error("Could not acquire analysis results. Please retry.");
      }

      const reportData = await res.json();

      // 3. Store full report data to Supabase via backend API
      const savedRep: Report = {
        userId: user.uid,
        projectId: projRef.id,
        projectName: formData.name,
        score: reportData.score,
        scoreExplanation: reportData.scoreExplanation,
        marketAnalysis: reportData.marketAnalysis,
        competitorAnalysis: reportData.competitorAnalysis,
        customerPersonas: reportData.customerPersonas,
        swotAnalysis: reportData.swotAnalysis,
        riskAssessment: reportData.riskAssessment,
        revenueForecast: reportData.revenueForecast,
        roadmap: reportData.roadmap,
        investorSummary: reportData.investorSummary,
        createdAt: new Date().toISOString()
      };

      if (user.uid !== "guest_user") {
        const newRepId = `rep_${Date.now()}`;
        savedRep.id = newRepId;

        try {
          const resRep = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(savedRep)
          });
          if (!resRep.ok) throw new Error("Backend reports save failed");

          setReports(prev => [savedRep, ...prev]);
        } catch (e) {
          console.error("Supabase report sync failed:", e);
          throw e;
        }

        // Create Success Alert
        await createNotification(
          user.uid, 
          "Report Synthesized Succeeded!", 
          `Venture report for "${formData.name}" was compiled with score of ${reportData.score}/100. Check SWOT & financials.`,
          "success"
        );

        await logUserActivity(
          user.uid, 
          user.email, 
          "Report Synthesized", 
          `Synthesized venture launch plan for "${formData.name}"`
        );
      } else {
        savedRep.id = `guest_rep_${Date.now()}`;
        setReports(prev => {
          const next = [...prev, savedRep];
          localStorage.setItem("launchiq_guest_reports", JSON.stringify(next));
          return next;
        });

        const newNotif = {
          id: `guest_notif_${Date.now()}`,
          userId: user.uid,
          title: "Report Synthesized (Guest)",
          message: `Venture report for "${formData.name}" compiled with score of ${reportData.score}/100. Note: This report is persisted in your browser's local storage.`,
          type: "success" as const,
          read: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => {
          const next = [newNotif, ...prev];
          localStorage.setItem("launchiq_guest_notifications", JSON.stringify(next));
          return next;
        });
      }

      setSelectedReport(savedRep);

      // Switch to display report viewer
      setActiveView("reports");
    } catch (err: any) {
      alert(err.message || "Failed to finalize business validation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to permanently delete this report?")) return;
    if (user?.uid === "guest_user") {
      setReports(prev => {
        const next = prev.filter(r => r.id !== reportId);
        localStorage.setItem("launchiq_guest_reports", JSON.stringify(next));
        return next;
      });
      setSelectedReport(null);
      return;
    }
    try {
      const resDel = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (!resDel.ok) throw new Error("Backend report delete failed");

      setReports(prev => prev.filter(r => r.id !== reportId));
      if (user) {
        await logUserActivity(user.uid, user.email, "Report Deleted", `Manually deleted report reference ${reportId}`);
      }
      setSelectedReport(null);
    } catch (e) {
      console.error("Supabase delete report failed:", e);
    }
  };

  // Helper calculating project metrics on dashboard
  const totalProjectsCount = projects.length;
  const reportsGeneratedCount = reports.length;
  const scoreSum = reports.reduce((acc, r) => acc + r.score, 0);
  const scoreAverage = reportsGeneratedCount > 0 ? Math.round(scoreSum / reportsGeneratedCount) : 0;
  const opportunitiesMet = reports.filter(r => r.score >= 75).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#131625] text-slate-200 flex flex-col items-center justify-center p-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full"></div>
          <div className="p-5 bg-[#131625] rounded-3xl shadow-[6px_6px_16px_#07090f,-6px_-6px_16px_#1f253e] border border-white/[0.01]">
            <Rocket className="w-10 h-10 text-violet-400 neon-glow-purple animate-bounce" />
          </div>
        </div>
        <h2 className="font-extrabold text-lg text-white tracking-wide">Initializing LaunchIQ Engines...</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">Establishing Secure Firebase Datachannels...</p>
      </div>
    );
  }

  // Not logged in UI
  if (!user) {
    return (
      <div className="min-h-screen bg-[#131625] text-slate-200 relative overflow-hidden flex flex-col justify-center py-12 px-6 animate-fade-in">
        {/* Ambient floating gradient spheres */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full mx-auto bg-[#131625] p-6 sm:p-8 rounded-3xl shadow-[8px_8px_24px_#07090f,-8px_-8px_24px_#1f253e] border border-white/[0.01] relative">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3.5 bg-[#131625] rounded-2xl shadow-[inset_3px_3px_6px_#07090f,inset_-3px_-3px_6px_#1f253e] border border-white/[0.01] mb-4">
              <Rocket className="w-7 h-7 text-violet-400 neon-glow-purple animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Launch<span className="text-violet-400 font-black">IQ</span> Pad</h1>
            <p className="text-slate-400 text-xs text-center mt-2 leading-normal">
              Validate business ideas, generate market roadmaps, analyze risk profiles, and consult startup mentors.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex items-center space-x-2">
              <span className="font-bold">•</span>
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
              <span className="font-bold">✓</span>
              <span>{authSuccess}</span>
            </div>
          )}

          {authMode !== "forgot" ? (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authMode === "signup" && (
                <div className="space-y-1.5 row-start-1">
                  <label className="text-xs text-slate-300 font-bold block">First Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-bold">Password</label>
                  {authMode === "login" && (
                    <button 
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-violet-400 hover:text-violet-300 text-[11px] font-bold transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#131625] hover:bg-[#1a1e33] py-3 rounded-xl font-bold text-xs transition text-white shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[2px_2px_5px_#07090f,-2px_2px_5px_#1f253e] hover:translate-y-[0.5px] border border-white/[0.03] cursor-pointer"
              >
                {authMode === "login" ? "Enter Launch Pad" : "Establish Launch Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold block">Account Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#131625] hover:bg-[#1a1e33] py-3 rounded-xl font-bold text-xs text-white transition border border-white/[0.03] shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[2px_2px_5px_#07090f,-2px_2px_5px_#1f253e] cursor-pointer"
              >
                Dispatch Reset Link
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition mt-2 cursor-pointer font-semibold"
              >
                Go back to login
              </button>
            </form>
          )}

          {/* Social login divider */}
          {authMode !== "forgot" && (
            <div className="space-y-4 mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/[0.03]"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-mono tracking-widest uppercase font-semibold">Or execute with</span>
                <div className="flex-grow border-t border-white/[0.03]"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center space-x-2 bg-[#131625] hover:bg-[#1a1e33] border border-white/[0.03] py-2.5 rounded-xl text-xs font-bold transition text-slate-200 shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[2px_2px_5px_#07090f,-2px_2px_5px_#1f253e] cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-violet-400" />
                <span>Authorized Google account</span>
              </button>

              <button
                onClick={handleGuestAccess}
                className="w-full flex items-center justify-center space-x-2 bg-[#131625] hover:bg-[#1c223c] border border-dashed border-violet-500/30 hover:border-violet-500/50 py-2.5 rounded-xl text-xs font-bold transition text-violet-400 shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[2px_2px_5px_#07090f,-2px_2px_5px_#1f253e] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                <span>Explore in Guest Mode</span>
              </button>

              <div className="text-center text-xs pt-2">
                {authMode === "login" ? (
                  <p className="text-slate-400">
                    New to LaunchIQ?{" "}
                    <button onClick={() => setAuthMode("signup")} className="text-violet-400 font-extrabold hover:underline cursor-pointer">
                      Create Account
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-400">
                    Existing account?{" "}
                    <button onClick={() => setAuthMode("login")} className="text-violet-400 font-extrabold hover:underline cursor-pointer">
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active platform interface for logged in members
  return (
    <div className="min-h-screen bg-[#131625] text-slate-100 relative overflow-hidden flex flex-col justify-between">
      {/* Backdrops */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-550/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div>
        {/* Navigation Headboard */}
        <Navbar 
          user={user} 
          activeView={activeView} 
          setActiveView={setActiveView} 
          onLogout={handleSignOut} 
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotifRead}
        />

        {/* Content canvas container */}
        <main className="px-6 py-4 max-w-7xl mx-auto w-full pb-20">
          
          {/* VIEW: DASHBOARD */}
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* Top Banner section */}
              <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-6 relative overflow-hidden shadow-[6px_6px_16px_#07090f,-6px_-6px_16px_#1f253e] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Welcome back, {user.displayName || "Launcher"}</span>
                    <Sparkles className="w-5 h-5 text-violet-400 neon-glow-purple animate-pulse" />
                  </h1>
                  <p className="text-slate-400 text-xs leading-normal max-w-xl font-medium">
                    Deploy LaunchIQ AI validator engines. Get professional SWOT matrixes, customer personas, realistic financial models, and executive summary reports.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView("analyze")}
                  className="flex items-center space-x-2 bg-[#131625] hover:bg-[#1a1e33] text-violet-400 font-extrabold px-5 py-3 rounded-xl text-xs tracking-wider border border-violet-500/10 shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition duration-200 self-start sm:self-center cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>NEW BUSINESS VALIDATION</span>
                </button>
              </div>

              {/* KPI metrics section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Score count KPI */}
                <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[5px_5px_12px_#07090f,-5px_-5px_12px_#1f253e] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">My Projects</p>
                      <h3 className="text-2xl font-black text-white mt-1.5">{totalProjectsCount}</h3>
                    </div>
                    <div className="p-2 bg-[#0b0e18] text-violet-400 rounded-lg shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] border border-white/[0.01]">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-violet-400 mt-2 font-semibold font-mono uppercase tracking-wide">Blueprints modeled</p>
                </div>

                {/* Score analysis ratio KPI */}
                <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[5px_5px_12px_#07090f,-5px_-5px_12px_#1f253e] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Reports Synthesized</p>
                      <h3 className="text-2xl font-black text-white mt-1.5">{reportsGeneratedCount}</h3>
                    </div>
                    <div className="p-2 bg-[#0b0e18] text-indigo-400 rounded-lg shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] border border-white/[0.01]">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-indigo-400 mt-2 font-semibold font-mono uppercase tracking-wide">Audit summaries cached</p>
                </div>

                {/* Opportunities met counters */}
                <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[5px_5px_12px_#07090f,-5px_-5px_12px_#1f253e] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Strong Matches Found</p>
                      <h3 className="text-2xl font-black text-white mt-1.5">{opportunitiesMet}</h3>
                    </div>
                    <div className="p-2 bg-[#0b0e18] text-emerald-400 rounded-lg shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] border border-white/[0.01]">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-400 mt-2 font-semibold font-mono uppercase tracking-wide">Score &ge; 75/100</p>
                </div>

                {/* Score average calculation */}
                <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[5px_5px_12px_#07090f,-5px_-5px_12px_#1f253e] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Average Viability Score</p>
                      <h3 className="text-2xl font-black text-white mt-1.5">{scoreAverage}%</h3>
                    </div>
                    <div className="p-2 bg-[#0b0e18] text-cyan-400 rounded-lg shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] border border-white/[0.01]">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-cyan-400 mt-2 font-semibold font-mono uppercase tracking-wide">Viability aggregate</p>
                </div>
              </div>

              {/* Main Workspace split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left block: Recent reports & Saved analysis listings */}
                <div className="lg:col-span-2 bg-[#131625] border border-white/[0.02] rounded-2xl p-5 sm:p-6 shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e] space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/[0.03]">
                    <h3 className="font-extrabold text-slate-200 text-sm">Venture Validation Portfolio</h3>
                    <button 
                      onClick={() => setActiveView("reports")} 
                      className="text-[11px] text-violet-400 hover:text-violet-300 font-bold cursor-pointer font-mono uppercase tracking-wide"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {reports.length === 0 ? (
                      <div className="text-center py-10 bg-[#0b0e18] rounded-xl border border-white/[0.01] shadow-[inset_2px_2px_6px_#040509,inset_-2px_-2px_6px_#14192a]">
                        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-[12px] text-slate-400">No launch assessments generated yet.</p>
                        <button 
                          onClick={() => setActiveView("analyze")}
                          className="text-[11px] text-violet-400 hover:text-violet-300 mt-1.5 font-bold inline-block cursor-pointer underline"
                        >
                          Synthesize Your First Idea
                        </button>
                      </div>
                    ) : (
                      reports.slice(0, 3).map((rep) => (
                        <div 
                          key={rep.id} 
                          onClick={() => { setSelectedReport(rep); setActiveView("reports"); }}
                          className="p-4 bg-[#131625] rounded-xl border border-white/[0.01] shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div className="space-y-1 min-w-0 pr-4">
                            <h4 className="font-extrabold text-slate-200 text-xs truncate group-hover:text-violet-400 transition-colors">
                              {rep.projectName}
                            </h4>
                            <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                              <span>Score: {rep.score}/100</span>
                              <span>•</span>
                              <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                              rep.score >= 75 
                                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" 
                                : rep.score >= 60 
                                  ? "bg-violet-950/40 text-violet-300 border border-violet-500/20" 
                                  : "bg-red-950/45 text-red-300 border border-red-500/20"
                            }`}>
                              {rep.score}% Viable
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right block: Live Quick Actions & Mentor Card */}
                <div className="lg:col-span-1 space-y-6">
                  {/* IQMentor Invitation card */}
                  <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex items-center space-x-2 text-violet-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono">AI Incubation Hub</span>
                    </div>

                    <h4 className="text-white font-extrabold text-sm mt-3">Ready to Consult IQMentor?</h4>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
                      Consult our startup strategist regarding pricing tiers, digital distributions, low-budget organic conversions, and funding roadmap preparations.
                    </p>

                    <button 
                      onClick={() => setActiveView("mentor")}
                      className="w-full mt-4 flex items-center justify-center space-x-1 px-4 py-2.5 bg-[#131625] hover:bg-[#1a1e33] border border-violet-500/20 text-xs font-bold rounded-xl shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] hover:text-white text-violet-400 transition cursor-pointer"
                    >
                      <span>Inquire Mentor</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* System Notifications widget on dashboard */}
                  <div className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e] space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider pb-1.5 border-b border-white/[0.03]">Audit Trails</h4>
                    
                    <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-slate-500 font-medium">No alerts logged in current session.</p>
                      ) : (
                        notifications.slice(0, 3).map((notif) => (
                          <div key={notif.id} className="text-xs p-2.5 bg-[#0b0e18] rounded-xl border border-white/[0.01] shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] font-semibold text-slate-300">
                            <p className="font-bold text-slate-200">{notif.title}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: BUSINESS validation ANALYSIS FORM */}
          {activeView === "analyze" && (
            <BusinessAnalysisForm 
              onSubmit={handleNewAnalysis} 
              isGenerating={isGenerating} 
            />
          )}

          {/* VIEW: REPORTS CONTAINER */}
          {activeView === "reports" && (
            <div>
              {selectedReport ? (
                <ReportViewer 
                  report={selectedReport} 
                  onBack={() => setSelectedReport(null)}
                  isSavedMode={true}
                  onDelete={() => handleDeleteReport(selectedReport.id!)}
                  onConsultMentor={(projId) => {
                    setSelectedMentorProjectId(projId);
                    setActiveView("mentor");
                    setSelectedReport(null);
                  }}
                />
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between items-center bg-[#131625] p-5 rounded-2xl border border-white/[0.02] shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e]">
                    <h2 className="text-base font-extrabold text-white">Full Validation Reports Archive</h2>
                    <button 
                      onClick={() => setActiveView("analyze")}
                      className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>New Validation</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.length === 0 ? (
                      <div className="col-span-full text-center py-20 bg-[#131625] rounded-2xl border border-white/[0.02] shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e]">
                        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-xs font-semibold">No compiled validation reports in your archive.</p>
                      </div>
                    ) : (
                      reports.map((rep) => (
                        <div 
                          key={rep.id}
                          className="bg-[#131625] border border-white/[0.02] rounded-2xl p-5 shadow-[4px_4px_12px_#07090f,-4px_-4px_12px_#1f253e] hover:shadow-[inset_2px_2px_6px_#07090f,inset_-2px_-2px_6px_#1f253e] transition duration-150 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="font-bold text-sm text-slate-100 truncate max-w-[150px]">{rep.projectName}</h4>
                              <span className="font-mono text-xs text-violet-400 bg-[#0b0e18] px-2.5 py-0.5 rounded border border-white/[0.01] font-bold">{rep.score}%</span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed mt-2 line-clamp-3 font-medium">
                              {rep.scoreExplanation}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-white/[0.03] mt-4 flex justify-between items-center gap-4 text-xs font-semibold">
                            <span className="text-slate-400 font-mono">{new Date(rep.createdAt).toLocaleDateString()}</span>
                            <button 
                              onClick={() => { setSelectedReport(rep); }}
                              className="text-violet-400 hover:text-violet-300 font-bold inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Review report</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: MENTOR PANEL */}
          {activeView === "mentor" && (
            <MentorPanel projects={projects} initialProjectId={selectedMentorProjectId} />
          )}

          {/* VIEW: ADMIN HUB */}
          {activeView === "admin" && user && user.role === "admin" && (
            <AdminPanel 
              stats={stats} 
              usersList={allUsers} 
              reportsList={allReports} 
              logsList={allLogs}
              onRefreshStats={fetchSystemStats}
              onDeleteReport={handleDeleteReport}
            />
          )}

        </main>
      </div>

      {/* Symmetrical footer */}
      <footer className="w-full border-t border-white/[0.03] bg-[#0b0e18]/80 py-5 text-center text-[10px] text-slate-500 font-mono">
        <p>&copy; {new Date().getFullYear()} LaunchIQ SaaS. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
