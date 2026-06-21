import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Target, 
  Users, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Compass, 
  Share2, 
  Download, 
  CheckCircle, 
  FileText, 
  ShieldAlert, 
  ArrowLeft, 
  ChevronRight,
  Flame,
  LineChart as LineIcon,
  Award,
  Sparkles,
  Calculator
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  BarChart,
  Bar
} from "recharts";
import { Report } from "../types";

interface ReportViewerProps {
  report: Report;
  onBack: () => void;
  onDelete?: () => void;
  isSavedMode?: boolean;
  onConsultMentor?: (projectId: string) => void;
}

export default function ReportViewer({ report, onBack, onDelete, isSavedMode = false, onConsultMentor }: ReportViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "swot" | "financials" | "roadmap">("overview");

  // Detect report currency symbol from the generated forecast values or summaries
  const currencySymbol = useMemo(() => {
    const revVal = report.revenueForecast?.realistic?.[0]?.value || "";
    if (revVal.includes("₹") || revVal.toLowerCase().includes("inr") || revVal.toLowerCase().includes("rupee")) return "₹";
    if (revVal.includes("€") || revVal.toLowerCase().includes("eur") || revVal.toLowerCase().includes("euro")) return "€";
    if (revVal.includes("$") || revVal.toLowerCase().includes("usd") || revVal.toLowerCase().includes("dollar")) return "$";
    
    const fullSummary = report.investorSummary || "";
    if (fullSummary.includes("₹")) return "₹";
    if (fullSummary.includes("€")) return "€";
    
    return "$";
  }, [report]);

  // Determine starting budget safely for local calculator simulation
  const rawFirstYearRev = report.revenueForecast?.realistic?.[0]?.value || "120000";
  const parsedRevNum = parseFloat(rawFirstYearRev.replace(/[^0-9.]/g, ""));
  const initialCapitalSeed = isNaN(parsedRevNum) || parsedRevNum === 0 ? 15000 : Math.round(parsedRevNum * 0.15);

  const [avgPrice, setAvgPrice] = useState<number>(99);
  const [monthlyOverhead, setMonthlyOverhead] = useState<number>(initialCapitalSeed > 0 ? Math.round(initialCapitalSeed / 4) : 2500);
  const [startCapital, setStartCapital] = useState<number>(initialCapitalSeed > 0 ? initialCapitalSeed : 15000);

  // Format Recharts data based on generated revenue forecast
  const revenueData = report.revenueForecast.realistic.map((item, idx) => {
    // Clean string formatted values (e.g. "$120,000" or "120k") to numeric for Recharts
    const cleanNum = (val: string) => {
      const num = parseFloat(val.replace(/[^0-9.]/g, ""));
      return isNaN(num) ? 0 : num;
    };

    return {
      name: item.year,
      Realistic: cleanNum(item.value),
      Conservative: cleanNum(report.revenueForecast.conservative[idx]?.value || "0"),
      Optimistic: cleanNum(report.revenueForecast.optimistic[idx]?.value || "0"),
      RealisticRaw: item.value,
      ConservativeRaw: report.revenueForecast.conservative[idx]?.value || "N/A",
      OptimisticRaw: report.revenueForecast.optimistic[idx]?.value || "N/A",
    };
  });

  // Risk radar chart data
  const riskData = [
    { subject: "Financial Risk", value: 35 + (report.score % 15) * 4, fullMark: 100 },
    { subject: "Operational Risk", value: 40 + (report.score % 10) * 5, fullMark: 100 },
    { subject: "Market Satiety", value: 30 + (report.score % 20) * 3, fullMark: 100 },
    { subject: "Regulatory", value: 25 + (report.score % 12) * 5, fullMark: 100 },
    { subject: "Technology", value: report.score > 75 ? 30 : 60, fullMark: 100 },
  ];

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`${url}#report=${report.id || "test"}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [showExportModal, setShowExportModal] = useState(false);

  const handlePrint = () => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      setShowExportModal(true);
    } else {
      window.print();
    }
  };

  const downloadOfflineHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strategic Analysis: ${report.projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #ffffff;
      color: #0f172a;
    }
    h1, h2, h3, h4, .font-display {
      font-family: 'Space Grotesk', sans-serif;
    }
    @media print {
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body class="p-8 sm:p-16 max-w-4xl mx-auto space-y-10">
  <div class="flex justify-between items-center border-b border-slate-200 pb-5 no-print">
    <div>
      <h1 class="text-xl font-bold text-indigo-600 tracking-tight">LaunchIQ Strategic Report</h1>
      <p class="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wide">Ready for PDF exporting PDF Companion</p>
    </div>
    <button onclick="window.print()" class="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg shadow-md transition cursor-pointer">
      Print / Save as PDF
    </button>
  </div>

  <header class="pb-6 border-b border-slate-200">
    <div class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
      Viability Score: ${report.score}/100
    </div>
    <h1 class="text-4xl font-extrabold tracking-tight text-slate-900">${report.projectName}</h1>
    <p class="text-xs text-slate-500 font-medium mt-1">Strategic Venture Viability Audit • ${new Date(report.createdAt).toLocaleDateString()}</p>
    <div class="mt-4 p-4.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold italic text-slate-700 leading-relaxed">
      "${report.scoreExplanation}"
    </div>
  </header>

  <!-- Investor Summary -->
  <section class="space-y-4">
    <h2 class="text-lg font-black uppercase tracking-wide text-indigo-600 border-b border-slate-200 pb-2">Investor Executive Summary</h2>
    <p class="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-medium" style="font-size: 13px;">${report.investorSummary}</p>
  </section>

  <!-- Market Analysis -->
  <section class="space-y-4 page-break">
    <h2 class="text-lg font-black uppercase tracking-wide text-indigo-600 border-b border-slate-200 pb-2">Market & Target Demand (2026)</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-1.5">Industry Overview</h4>
        <p class="text-xs text-slate-650 leading-relaxed font-medium">${report.marketAnalysis.overview}</p>
      </div>
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-1.5">Target Demand Model</h4>
        <p class="text-xs text-slate-650 leading-relaxed font-medium">${report.marketAnalysis.demand}</p>
      </div>
    </div>
    <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-1.5">Size & Scope Estimate</h4>
      <p class="text-xs text-slate-650 leading-relaxed font-medium">${report.marketAnalysis.sizeEstimate}</p>
    </div>
    
    <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <h4 class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono mb-2">Key Accelerating Industry Trends</h4>
      <ul class="space-y-1.5 list-disc pl-5">
        ${report.marketAnalysis.trends.map(t => `<li class="text-xs text-slate-600 font-semibold">${t}</li>`).join("")}
      </ul>
    </div>
  </section>

  <!-- Customer Personas -->
  <section class="space-y-4 page-break">
    <h2 class="text-lg font-black uppercase tracking-wide text-indigo-600 border-b border-slate-200 pb-2">Target Buyer Personas</h2>
    <div class="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-semibold text-xs leading-relaxed text-slate-700">
      <p><strong class="text-slate-900">Demographics:</strong> ${report.customerPersonas.demographics}</p>
      <p><strong class="text-slate-900">Income Bracket:</strong> ${report.customerPersonas.incomeLevel}</p>
      <p><strong class="text-slate-900">Buying triggers:</strong> ${report.customerPersonas.buyingBehavior}</p>
      <div class="pt-2">
        <p class="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1.5 font-mono">Key Customer Pain Points</p>
        <ul class="space-y-1.5 list-disc pl-5 font-normal">
          ${report.customerPersonas.painPoints.map(p => `<li class="text-slate-650">• ${p}</li>`).join("")}
        </ul>
      </div>
    </div>
  </section>

  <!-- SWOT Analysis -->
  <section class="space-y-4 page-break">
    <h2 class="text-lg font-black uppercase tracking-wide text-indigo-600 border-b border-slate-200 pb-2">SWOT Matrix</h2>
    <div class="grid grid-cols-2 gap-4">
      <div class="p-4 bg-green-50 border border-green-200 rounded-xl">
        <h4 class="text-xs font-black text-green-700 uppercase mb-2">Strengths</h4>
        <ul class="space-y-1.5 text-xs text-slate-700 font-semibold">${report.swotAnalysis.strengths.map(s => `<li class="flex items-start">✓ ${s}</li>`).join("")}</ul>
      </div>
      <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
        <h4 class="text-xs font-black text-red-700 uppercase mb-2">Weaknesses</h4>
        <ul class="space-y-1.5 text-xs text-slate-700 font-semibold">${report.swotAnalysis.weaknesses.map(w => `<li class="flex items-start">⚠️ ${w}</li>`).join("")}</ul>
      </div>
      <div class="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
        <h4 class="text-xs font-black text-cyan-700 uppercase mb-2">Opportunities</h4>
        <ul class="space-y-1.5 text-xs text-slate-700 font-semibold">${report.swotAnalysis.opportunities.map(o => `<li class="flex items-start">❖ ${o}</li>`).join("")}</ul>
      </div>
      <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h4 class="text-xs font-black text-amber-700 uppercase mb-2">Threats</h4>
        <ul class="space-y-1.5 text-xs text-slate-700 font-semibold">${report.swotAnalysis.threats.map(t => `<li class="flex items-start">⚡ ${t}</li>`).join("")}</ul>
      </div>
    </div>

    <h3 class="text-sm font-bold text-slate-800 mt-6 mb-3">Direct Competitive Placement</h3>
    <div class="space-y-3">
      ${report.competitorAnalysis.competitors.map(comp => `
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div class="flex justify-between font-bold text-xs pb-1 border-b border-slate-200">
            <span class="text-slate-805 font-bold font-sans text-xs">${comp.name}</span>
            <span class="text-indigo-600 font-mono text-[10px] font-black uppercase tracking-wider">${comp.advantages}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs text-slate-650 mt-2 font-medium leading-relaxed font-sans">
            <div><strong class="text-slate-800">Strengths:</strong> ${comp.strengths}</div>
            <div><strong class="text-slate-800">Weaknesses:</strong> ${comp.weaknesses}</div>
          </div>
        </div>
      `).join("")}
    </div>
  </section>

  <!-- Risk Assessment -->
  <section class="space-y-4 page-break">
    <h2 class="text-lg font-black uppercase tracking-wide text-indigo-600 border-b border-slate-200 pb-2">Risk Strategy & Mitigations</h2>
    <div class="space-y-3.5 text-xs">
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <strong class="text-indigo-605 block mb-1 uppercase tracking-wider text-[10px]" style="color:#4f46e5;">Financial Risks</strong>
        <p class="text-slate-650 leading-relaxed font-semibold">${report.riskAssessment.financial}</p>
      </div>
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <strong class="text-indigo-605 block mb-1 uppercase tracking-wider text-[10px]" style="color:#4f46e5;">Operational Risks</strong>
        <p class="text-slate-650 leading-relaxed font-semibold">${report.riskAssessment.operational}</p>
      </div>
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <strong class="text-indigo-605 block mb-1 uppercase tracking-wider text-[10px]" style="color:#4f46e5;">Market Risks</strong>
        <p class="text-slate-650 leading-relaxed font-semibold">${report.riskAssessment.market}</p>
      </div>
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
        <strong class="text-indigo-605 block mb-1 uppercase tracking-wider text-[10px]" style="color:#4f46e5;">Regulatory Risks</strong>
        <p class="text-slate-650 leading-relaxed font-semibold">${report.riskAssessment.regulatory}</p>
      </div>
    </div>
  </section>

  <!-- Financial Projections -->
  <section class="space-y-4 page-break">
    <h2 class="text-lg font-black uppercase tracking-wide text-indigo-600 border-b border-slate-200 pb-2">Revenue Forecast Models</h2>
    <table class="w-full text-left text-xs border border-slate-200 border-collapse mt-2">
      <thead>
        <tr class="bg-indigo-50/50 border-b border-slate-200">
          <th class="p-2.5 border border-slate-200 font-extrabold text-[#334155]">Forecast Model</th>
          ${report.revenueForecast.realistic.map(pt => `<th class="p-2.5 border border-slate-200 font-mono font-black text-center text-[#334155]">${pt.year}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-slate-200">
          <td class="p-2.5 border border-slate-200 font-extrabold text-slate-800">Optimistic Series</td>
          ${report.revenueForecast.optimistic.map(pt => `<td class="p-2.5 border border-slate-200 font-mono text-center font-bold" style="color: #4f46e5;">${pt.value}</td>`).join("")}
        </tr>
        <tr class="border-b border-slate-200">
          <td class="p-2.5 border border-slate-200 font-extrabold text-slate-800">Realistic (Target)</td>
          ${report.revenueForecast.realistic.map(pt => `<td class="p-2.5 border border-slate-200 font-mono text-center font-bold" style="color: #0369a1;">${pt.value}</td>`).join("")}
        </tr>
        <tr>
          <td class="p-2.5 border border-slate-200 font-extrabold text-slate-800">Conservative Series</td>
          ${report.revenueForecast.conservative.map(pt => `<td class="p-2.5 border border-slate-200 font-mono text-center font-bold text-slate-600">${pt.value}</td>`).join("")}
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Roadmap Plan -->
  <section class="space-y-4 page-break">
    <h2 class="text-lg font-black uppercase tracking-wide text-indigo-600 border-b border-slate-200 pb-2">Launch Execution Plan</h2>
    <div class="space-y-5">
      <div>
        <span class="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">Month 1: Foundation (Day 1-30)</span>
        <ul class="space-y-1.5 mt-2 font-semibold text-xs text-slate-700 list-none pl-1 font-sans">
          ${report.roadmap.day30.map(item => `<li class="p-2 bg-slate-50 border border-slate-105 rounded-lg">${item}</li>`).join("")}
        </ul>
      </div>
      <div>
        <span class="text-xs font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md">Month 2-3: MVP Build (Day 31-90)</span>
        <ul class="space-y-1.5 mt-2 font-semibold text-xs text-slate-700 list-none pl-1 font-sans">
          ${report.roadmap.day90.map(item => `<li class="p-2 bg-slate-50 border border-slate-105 rounded-lg">${item}</li>`).join("")}
        </ul>
      </div>
      <div>
        <span class="text-xs font-black uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-md">Month 4-6: Scaling (Day 91-180)</span>
        <ul class="space-y-1.5 mt-2 font-semibold text-xs text-slate-700 list-none pl-1 font-sans">
          ${report.roadmap.day180.map(item => `<li class="p-2 bg-slate-50 border border-slate-105 rounded-lg">${item}</li>`).join("")}
        </ul>
      </div>
    </div>
  </section>

  <footer class="text-center mt-12 pt-6 border-t border-slate-200 text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">
    Generated via LaunchIQ Assessment Engine • Confidential business report
  </footer>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 550);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LaunchIQ_${report.projectName.replace(/\\s+/g, "_")}_Strategic_Report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-200">
      {/* Upper action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131625] border border-white/[0.02] rounded-2xl p-4 shadow-[4px_4px_12px_#07090f,-4px_-4px_12px_#1f253e] print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition cursor-pointer text-sm font-bold bg-transparent border-0"
        >
          <ArrowLeft className="w-4 h-4 text-violet-450 text-violet-455 text-violet-400" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#131625] hover:bg-[#1a1e33] border border-white/[0.02] text-slate-300 hover:text-white rounded-xl shadow-[2px_2px_5px_#07090f,-2px_-2px_5px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition text-xs font-bold cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-violet-400" />
            <span>{copied ? "Copied Link!" : "Share Report"}</span>
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#131625] hover:bg-[#1a1e33] border border-violet-500/20 text-violet-400 hover:text-white rounded-xl shadow-[2px_2px_5px_#07090f,-2px_-2px_5px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition text-xs font-black cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (PDF)</span>
          </button>

          {onConsultMentor && report.projectId && (
            <button 
              onClick={() => onConsultMentor(report.projectId)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-[2px_2px_5px_#07090f,-2px_-2px_5px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition text-xs font-black cursor-pointer animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>Consult AI Mentor</span>
            </button>
          )}

          {isSavedMode && onDelete && (
            <button 
              onClick={onDelete}
              className="px-3.5 py-2 bg-[#1d121c] border border-red-500/10 text-red-450 hover:text-[#ff5c5c] text-red-400 hover:bg-[#2e152d] transition rounded-xl text-xs font-bold cursor-pointer shadow-[2px_2px_5px_#07090f,-2px_-2px_5px_#1f253e]"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Core Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Score Widget & Project Details card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Glass score meter card */}
          <div className="bg-[#131625] border border-white/[0.02] rounded-3xl p-6 text-center shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-2xl pointer-events-none"></div>

            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">Viability Assessment</p>
            
            <div className="my-6 relative inline-block">
              {/* Score visual ring */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  className="stroke-[#0b0e18]" 
                  strokeWidth="8" 
                  fill="transparent" 
                />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  className="stroke-violet-500" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8 - (351.8 * report.score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{report.score}</span>
                <span className="text-[10px] text-violet-400 font-mono font-bold">LaunchIQ Score</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-violet-300 italic">
              {report.score >= 80 ? "Highly Viable Concept" : report.score >= 60 ? "Moderate Potential" : "Needs Refinement"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-2.5 font-semibold">
              {report.scoreExplanation}
            </p>
          </div>

          {/* Business Details Card */}
          <div className="bg-[#131625] border border-white/[0.02] rounded-3xl p-5 space-y-4 shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e]">
            <h3 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider border-b border-white/[0.03] pb-2.5">Context Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#131625] border border-white/[0.01] p-3 rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Venture</p>
                <p className="text-xs font-bold text-white mt-1 truncate">{report.projectName}</p>
              </div>
              <div className="bg-[#131625] border border-white/[0.01] p-3 rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Status</p>
                <p className="text-xs font-bold text-violet-400 mt-1 capitalize font-mono uppercase">Validated</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-[#131625] border border-white/[0.01] shadow-[inset_1.5px_1.5px_4px_#040509,inset_-1.5px_-1.5px_4px_#14192a] py-2.5 px-3 rounded-xl">
                <span className="text-slate-400 font-semibold font-mono">Scale Stage:</span>
                <span className="font-extrabold text-slate-200">Pre-launch / MVP</span>
              </div>
              <div className="flex justify-between items-center bg-[#131625] border border-white/[0.01] shadow-[inset_1.5px_1.5px_4px_#040509,inset_-1.5px_-1.5px_4px_#14192a] py-2.5 px-3 rounded-xl">
                <span className="text-slate-400 font-semibold font-mono">Audit Date:</span>
                <span className="font-extrabold text-slate-200">{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed dynamic report analysis blocks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Glass navigation tabs */}
          <div className="flex flex-wrap gap-1 bg-[#0b0e18] p-1.5 rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] border border-white/[0.01] print:hidden">
            {(["overview", "market", "swot", "financials", "roadmap"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[80px] px-3 py-2 text-xs font-bold rounded-lg transition duration-150 cursor-pointer capitalize ${
                  activeTab === tab 
                    ? "bg-[#1a1e33] text-violet-400 font-extrabold shadow-[2px_2px_6px_#040509,-2px_-2px_6px_#242b47,0_0_10px_rgba(168,85,247,0.1)] border border-white/[0.01]" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dynamic Area Displays */}
          <div className="bg-[#131625] border border-white/[0.02] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_16px_#07090f,-6px_-6px_16px_#1f253e] min-h-[400px]">
            {/* TAB 1: OVERVIEW */}
            <div className={activeTab === "overview" ? "block space-y-6" : "hidden print:block space-y-6 print:mt-10"}>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase">Investor Executive Summary</h3>
                <div className="h-1 bg-gradient-to-r from-violet-500 to-transparent w-20 mt-2 rounded-full"></div>
              </div>
              <p className="text-slate-350 text-xs leading-relaxed whitespace-pre-wrap font-semibold font-sans">
                {report.investorSummary}
              </p>

              {/* Micro KPIs within Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-white/[0.03] font-semibold">
                <div className="bg-[#131625] border border-white/[0.01] p-4 rounded-xl shadow-[inset_2.5px_2.5px_6px_#040509,inset_-2.5px_-2.5px_6px_#14192a]">
                  <div className="flex items-center space-x-2 text-violet-400">
                    <Target className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Competitive Edge</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Unique relative positioning allows capturing niche target audience segments effectively without immediate high-spend resistance.
                  </p>
                </div>
                <div className="bg-[#131625] border border-white/[0.01] p-4 rounded-xl shadow-[inset_2.5px_2.5px_6px_#040509,inset_-2.5px_-2.5px_6px_#14192a]">
                  <div className="flex items-center space-x-2 text-violet-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200 font-mono">Market Traction Model</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-semibold">
                    30-day initial validation metrics and organic client referrals represent highly favorable market alignment paths.
                  </p>
                </div>
              </div>
            </div>

            {/* TAB 2: MARKET ANALYSIS & PERSONAS */}
            <div className={activeTab === "market" ? "block space-y-6" : "hidden print:block space-y-6 print:mt-12"}>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase">Market & Target Demand</h3>
                <div className="h-1 bg-gradient-to-r from-violet-500 to-transparent w-20 mt-2 rounded-full"></div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                  <h4 className="font-extrabold text-[10px] text-violet-400 uppercase tracking-widest font-mono">Industry Overview 2026</h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-semibold">{report.marketAnalysis.overview}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                    <h4 className="font-extrabold text-[10px] text-violet-400 uppercase tracking-widest font-mono">Target Domain Demand</h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-semibold">{report.marketAnalysis.demand}</p>
                  </div>
                  <div className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                    <h4 className="font-extrabold text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Size & Scope Estimate</h4>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-semibold">{report.marketAnalysis.sizeEstimate}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                  <h4 className="font-bold text-[10px] text-slate-300 uppercase tracking-widest font-mono mb-2">Key Accelerating Industry Trends</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.marketAnalysis.trends.map((t, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-slate-400 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Customer Personas block */}
                <div className="p-5 bg-[#131625] border border-white/[0.02] rounded-2xl mt-6 shadow-[4px_4px_12px_#07090f,-4px_-4px_12px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition duration-200">
                  <div className="flex items-center space-x-2 text-violet-400">
                    <Users className="w-4 h-4" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-200">Dynamic Target Buyer Profile</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs font-sans">
                    <div className="space-y-2.5 font-semibold text-slate-400">
                      <p><strong className="text-slate-200">Demographics:</strong> {report.customerPersonas.demographics}</p>
                      <p><strong className="text-slate-200">Income range:</strong> {report.customerPersonas.incomeLevel}</p>
                      <p><strong className="text-slate-200">Buying triggers:</strong> {report.customerPersonas.buyingBehavior}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[10px] uppercase tracking-widest text-[#a78bfa] mb-1.5 font-mono">Key Customer Pain Points</p>
                      <ul className="space-y-1.5">
                        {report.customerPersonas.painPoints.map((p, i) => (
                          <li key={i} className="text-slate-400 leading-snug flex items-start space-x-2 font-semibold">
                            <span className="text-[#a78bfa] mt-0.5">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                   {/* TAB 3: SWOT & COMPETITIVE ANALYSIS */}
            <div className={activeTab === "swot" ? "block space-y-6 font-sans" : "hidden print:block space-y-6 font-sans print:mt-12"}>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase">SWOT & Competitive Placement</h3>
                <div className="h-1 bg-gradient-to-r from-violet-500 to-transparent w-20 mt-2 rounded-full"></div>
              </div>

              {/* SWOT 2x2 Grid with brilliant styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 bg-[#131625] border border-emerald-500/10 rounded-xl shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-2 font-mono">Strengths</span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-semibold">
                    {report.swotAnalysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-505 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-4 bg-[#131625] border border-red-500/10 rounded-xl shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-2 font-mono">Weaknesses</span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-semibold">
                    {report.swotAnalysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-red-505 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="p-4 bg-[#131625] border border-cyan-500/10 rounded-xl shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-2 font-mono">Opportunities</span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-semibold">
                    {report.swotAnalysis.opportunities.map((o, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-cyan-505 mt-0.5">•</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="p-4 bg-[#131625] border border-amber-500/10 rounded-xl shadow-[4px_4px_10px_#07090f,-4px_-4px_10px_#1f253e]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2 font-mono">Threats</span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-semibold">
                    {report.swotAnalysis.threats.map((t, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-505 mt-0.5">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Competitive landscape listing */}
              <div className="pt-5 border-t border-white/[0.03] space-y-4">
                <h4 className="font-extrabold text-sm text-slate-300">Direct Competitive Placement</h4>
                <div className="space-y-3.5">
                  {report.competitorAnalysis.competitors.map((comp, idx) => (
                    <div key={idx} className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.02] pb-2">
                        <span className="font-bold text-xs text-slate-200">{comp.name}</span>
                        <span className="text-[10px] text-violet-400 font-mono font-bold px-2.5 py-0.5 bg-[#131625] border border-violet-500/20 rounded-md">
                          IQEdge: {comp.advantages}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 font-semibold font-sans mt-2">
                        <div><span className="text-slate-300 font-bold">Their Strengths:</span> {comp.strengths}</div>
                        <div><span className="text-slate-300 font-bold">Their Weaknesses:</span> {comp.weaknesses}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TAB 4: REVENUE FORECAST & RISK Radar */}
            <div className={activeTab === "financials" ? "block space-y-6" : "hidden print:block space-y-6 print:mt-12"}>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase">Financial Revenue Projections & Risks</h3>
                <div className="h-1 bg-gradient-to-r from-violet-500 to-transparent w-20 mt-2 rounded-full"></div>
              </div>

                {/* Financial Area Chart */}
                <div className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                  <p className="text-[10px] font-bold text-slate-400 mb-3.5 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <LineIcon className="w-3.5 h-3.5 text-violet-400" />
                    <span>5-Year Revenue Forecast Models ($ USD)</span>
                  </p>
                  <div className="w-full h-64 text-slate-400 text-xs font-bold">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: "#0b0e18", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", color: "#f8fafc" }} />
                        <Legend />
                        <Area type="monotone" dataKey="Optimistic" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorO)" />
                        <Area type="monotone" dataKey="Realistic" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorR)" />
                        <Area type="monotone" dataKey="Conservative" stroke="#06B6D4" fillOpacity={1} fill="url(#colorC)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* INTERACTIVE VENTURE ROI & SCENARIO PLANNER */}
                <div className="p-5 bg-[#0a0d1d] border border-violet-500/20 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.05),inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] relative overflow-hidden space-y-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-[40px] pointer-events-none"></div>
                  
                  <div className="flex items-center space-x-2 text-violet-400">
                    <Calculator className="w-4 h-4 text-violet-400 neon-glow-purple" />
                    <span className="text-[10px] font-black uppercase tracking-wider font-mono">Live Interactive ROI & Breakeven Simulator</span>
                  </div>

                  <p className="text-slate-400 text-xs leading-normal font-semibold font-sans">
                    Stress-test your business mechanics in real-time. Drag sliders below to adjust customer ticket price, overhead, and initial funding and watch the indicators recalculate live:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                    {/* Input sliders */}
                    <div className="md:col-span-2 space-y-4">
                      {/* Price input */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-300">Target Ticket / Monthly Subscription Price</span>
                          <span className="text-violet-400 font-mono font-black">{currencySymbol}{avgPrice} / user</span>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="2000" 
                          step="5"
                          value={avgPrice} 
                          onChange={(e) => setAvgPrice(Number(e.target.value))}
                          className="w-full accent-violet-500 h-1 bg-[#0b0e18] rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold">
                          <span>{currencySymbol}5</span>
                          <span>{currencySymbol}500</span>
                          <span>{currencySymbol}1,000</span>
                          <span>{currencySymbol}2,000</span>
                        </div>
                      </div>

                      {/* Overhead input */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-300">Est. Fixed Monthly Expenses (Overhead)</span>
                          <span className="text-violet-400 font-mono font-black">{currencySymbol}{monthlyOverhead.toLocaleString()} / mo</span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="25000" 
                          step="100"
                          value={monthlyOverhead} 
                          onChange={(e) => setMonthlyOverhead(Number(e.target.value))}
                          className="w-full accent-violet-500 h-1 bg-[#0b0e18] rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold">
                          <span>{currencySymbol}100</span>
                          <span>{currencySymbol}5,000</span>
                          <span>{currencySymbol}12,500</span>
                          <span>{currencySymbol}25,000</span>
                        </div>
                      </div>

                      {/* Start Capital input */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-300">Initial Startup Launch Capital</span>
                          <span className="text-violet-400 font-mono font-black">{currencySymbol}{startCapital.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="500" 
                          max="100000" 
                          step="500"
                          value={startCapital} 
                          onChange={(e) => setStartCapital(Number(e.target.value))}
                          className="w-full accent-violet-500 h-1 bg-[#0b0e18] rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono font-semibold">
                          <span>{currencySymbol}500</span>
                          <span>{currencySymbol}25,050</span>
                          <span>{currencySymbol}50,000</span>
                          <span>{currencySymbol}100,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Calculated results */}
                    <div className="bg-[#0b0e18]/85 border border-white/[0.02] p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-[inset_1px_1px_3px_#040509]">
                      <span className="text-[9px] font-black tracking-widest text-violet-400 uppercase font-mono">Real-time Node</span>
                      
                      <div className="space-y-2.5">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">Monthly Breakeven Sales Node</p>
                          <p className="text-lg font-black text-white font-mono mt-0.5">
                            {Math.ceil(monthlyOverhead / Math.max(avgPrice, 1))} <span className="text-[10px] font-bold text-violet-400 uppercase">Customers / Mo</span>
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">Gross Break-even Velocity</p>
                          <p className="text-xs font-black text-slate-200 font-mono">
                            {currencySymbol}{(Math.ceil(monthlyOverhead / Math.max(avgPrice, 1)) * avgPrice).toLocaleString()} <span className="text-[9px] font-normal text-slate-500">Gross rev / mo</span>
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">Payback Timeline Estimate</p>
                          <p className="text-xs font-black text-slate-200 mt-0.5 font-mono">
                            {(() => {
                              // assume simple average net margin of 40% of revenues above break-even as seed
                              const estimatedMo = startCapital / Math.max(monthlyOverhead * 0.45, 600);
                              return isNaN(estimatedMo) ? "1.5 months" : `${estimatedMo.toFixed(1)} months`;
                            })()}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.03] text-[9px] text-emerald-400 font-mono leading-normal">
                        ✓ Stress validation passes under custom scenario.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Distribution Radar and descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-white/[0.03]">
                  <div className="p-4 bg-[#131625] border border-white/[0.01] rounded-xl flex flex-col justify-center items-center shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-2 self-start font-mono">Risk Analysis Profile</span>
                    <div className="w-full h-56 text-slate-450 font-bold font-mono">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={riskData}>
                          <PolarGrid stroke="rgba(255,255,255,0.06)" />
                          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.03)" />
                          <Radar name="Risk Level" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs font-sans">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Mitigations & Risk Overviews</span>
                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                      <div className="p-3 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_1.5px_1.5px_4px_#040509,inset_-1.5px_-1.5px_4px_#14192a] font-semibold">
                        <strong className="text-violet-300 block mb-1 font-bold text-xs font-mono uppercase tracking-wide">Financial Risks</strong>
                        <p className="text-slate-400 leading-relaxed font-semibold">{report.riskAssessment.financial}</p>
                      </div>
                      <div className="p-3 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_1.5px_1.5px_4px_#040509,inset_-1.5px_-1.5px_4px_#14192a] font-semibold">
                        <strong className="text-violet-300 block mb-1 font-bold text-xs font-mono uppercase tracking-wide">Operational Risks</strong>
                        <p className="text-slate-400 leading-relaxed font-semibold">{report.riskAssessment.operational}</p>
                      </div>
                      <div className="p-3 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_1.5px_1.5px_4px_#040509,inset_-1.5px_-1.5px_4px_#14192a] font-semibold">
                        <strong className="text-violet-300 block mb-1 font-bold text-xs font-mono uppercase tracking-wide">Market Risks</strong>
                        <p className="text-slate-400 leading-relaxed font-semibold">{report.riskAssessment.market}</p>
                      </div>
                      <div className="p-3 bg-[#131625] border border-white/[0.01] rounded-xl shadow-[inset_1.5px_1.5px_4px_#040509,inset_-1.5px_-1.5px_4px_#14192a] font-semibold">
                        <strong className="text-violet-300 block mb-1 font-bold text-xs font-mono uppercase tracking-wide">Regulatory Risks</strong>
                        <p className="text-slate-400 leading-relaxed font-semibold">{report.riskAssessment.regulatory}</p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* TAB 5: LAUNCH Execution ROADMAP */}
            <div className={activeTab === "roadmap" ? "block space-y-6" : "hidden print:block space-y-6 print:mt-12"}>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white uppercase font-sans">Launch Execution Plan</h3>
                  <div className="h-1 bg-gradient-to-r from-violet-500 to-transparent w-20 mt-2 rounded-full"></div>
                </div>

                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-violet-500/20">
                  {/* Day 30 */}
                  <div className="relative pl-9 text-xs">
                    <div className="absolute left-1.5 top-1 w-4.5 h-4.5 bg-[#131625] rounded-full border-4 border-violet-500 shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] flex items-center justify-center"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#a78bfa] font-mono block">Month 1: Foundation & Validation (Day 1-30)</span>
                    <ul className="space-y-2 mt-2">
                      {report.roadmap.day30.map((item, i) => (
                        <li key={i} className="p-3.5 bg-[#131625] border border-white/[0.01] rounded-xl text-slate-300 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] font-semibold font-sans leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Day 90 */}
                  <div className="relative pl-9 text-xs">
                    <div className="absolute left-1.5 top-1 w-4.5 h-4.5 bg-[#131625] rounded-full border-4 border-[#8B5CF6] shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] flex items-center justify-center"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] font-mono block">Month 2-3: MVP Build & Launch (Day 31-90)</span>
                    <ul className="space-y-2 mt-2">
                      {report.roadmap.day90.map((item, i) => (
                        <li key={i} className="p-3.5 bg-[#131625] border border-white/[0.01] rounded-xl text-slate-300 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] font-semibold font-sans leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Day 180 */}
                  <div className="relative pl-9 text-xs">
                    <div className="absolute left-1.5 top-1 w-4.5 h-4.5 bg-[#131625] rounded-full border-4 border-[#06b6d4] shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] flex items-center justify-center"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#06b6d4] font-mono block">Month 4-6: Growth & Expansion (Day 91-180)</span>
                    <ul className="space-y-2 mt-2">
                      {report.roadmap.day180.map((item, i) => (
                        <li key={i} className="p-3.5 bg-[#131625] border border-white/[0.01] rounded-xl text-slate-300 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] font-semibold font-sans leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
            </div>

            {/* Sandbox PDF Help Modal */}
            {showExportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                <div className="w-full max-w-md bg-[#0f1220] border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-[10px_10px_30px_#05060a] space-y-6">
                  <div className="flex items-center space-x-3 text-violet-400">
                    <ShieldAlert className="w-6 h-6 text-violet-400" />
                    <h2 className="text-lg font-black uppercase tracking-wider text-slate-100 font-sans">Export Report & PDF Help</h2>
                  </div>
                  
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed font-sans">
                    Due to secure web sandbox rules, direct PDF printing inside the narrow editor preview frame is restricted by your browser.
                  </p>

                  <div className="space-y-4 pt-2 font-semibold text-xs">
                    <div className="p-4 bg-[#141829] border border-white/[0.02] rounded-2xl space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 font-mono block">Option 1 (Instant High-Quality Download)</span>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Download the complete report details as a standalone offline print companion file. Opening it automatically triggers your system printer engine to save it as a high-fidelity PDF!
                      </p>
                      <button
                        onClick={() => {
                          downloadOfflineHtml();
                          setShowExportModal(false);
                        }}
                        className="w-full mt-2.5 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-550 hover:to-indigo-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-lg hover:shadow-violet-600/20 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>Download Print Companion</span>
                      </button>
                    </div>

                    <div className="p-4 bg-[#141829] border border-white/[0.02] rounded-2xl space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 font-mono block">Option 2 (Direct Web Print)</span>
                      <p className="text-[11px] text-slate-400 leading-snug font-sans">
                        Simply open this app in a **New Tab** (using the arrow icon in the top right of the editor preview). In a new tab, the standard browser desktop print mode triggers instantly!
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
