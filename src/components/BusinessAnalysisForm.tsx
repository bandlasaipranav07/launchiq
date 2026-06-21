import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Settings, 
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info
} from "lucide-react";

interface FormState {
  name: string;
  idea: string;
  industry: string;
  city: string;
  state: string;
  country: string;
  budget: string;
  targetCustomers: string;
  stage: string;
}

interface BusinessAnalysisFormProps {
  onSubmit: (data: FormState) => void;
  isGenerating: boolean;
}

const INDUSTRIES = [
  "Software-as-a-Service (SaaS)",
  "Artificial Intelligence / ML",
  "E-commerce & Retail",
  "Fintech",
  "Healthcare & MedTech",
  "B2B Professional Services",
  "Real Estate / PropTech",
  "Education / EdTech",
  "Hardware & IoT",
  "Clean Energy & Sustainability",
  "Food & Beverage / Restaurant",
  "Entertainment & Gaming",
  "Other"
];

const STAGES = [
  { value: "Idea", label: "Idea Phase", desc: "Just a conceptual business thought" },
  { value: "Prototype", label: "Prototype / MVP", desc: "An initial version built or designed" },
  { value: "Early Traction", label: "Early Traction", desc: "Launched with preliminary users or buyers" },
  { value: "Scaling", label: "Scaling Phase", desc: "A stable revenue model looking to expand" }
];

const PRESET_CONCEPTS = [
  {
    name: "CarbonTrack Pro",
    industry: "Clean Energy & Sustainability",
    industryShort: "ClimateTech",
    idea: "A SaaS carbon accounting platform designed to help local mid-sized craft breweries track, manage, and offset their carbon footprint. We coordinate direct offset purchasing via certified regional reforestation projects.",
    city: "Austin",
    state: "TX",
    country: "US",
    budget: "$ 15,000",
    targetCustomers: "B2B local craft breweries and custom food producers",
    stage: "Idea"
  },
  {
    name: "KrishiConnect",
    industry: "E-commerce & Retail",
    industryShort: "AgriTech",
    idea: "A direct farm-to-restaurant supply marketplace optimized for Indian regional cold chains. Farmers list fresh harvests directly, bypassing middlemen to increase revenue margins by up to 28%.",
    city: "Hyderabad",
    state: "Telangana",
    country: "IN",
    budget: "₹ 8,50,000",
    targetCustomers: "High-volume city restaurants and smallholder farmers",
    stage: "Prototype"
  },
  {
    name: "EviCycle Berlin",
    industry: "Software-as-a-Service (SaaS)",
    industryShort: "SaaS Utility",
    idea: "A micro-mobility fleet optimization dashboard tailored for European city councils and private e-scooter providers to rebalance vehicle distribution and forecast charging demands.",
    city: "Berlin",
    state: "Berlin",
    country: "DE",
    budget: "€ 12,500",
    targetCustomers: "B2G city mobility heads and fleet dispatch operations",
    stage: "Idea"
  }
];

export default function BusinessAnalysisForm({ onSubmit, isGenerating }: BusinessAnalysisFormProps) {
  const [currency, setCurrency] = useState<"$" | "€" | "₹">("$");
  const [formData, setFormData] = useState<FormState>({
    name: "",
    idea: "",
    industry: INDUSTRIES[0],
    city: "",
    state: "",
    country: "",
    budget: "",
    targetCustomers: "",
    stage: "Idea"
  });

  const handleAutofill = (concept: typeof PRESET_CONCEPTS[0]) => {
    let detectedCurrency: "$" | "€" | "₹" = "$";
    if (concept.budget.includes("₹")) detectedCurrency = "₹";
    else if (concept.budget.includes("€")) detectedCurrency = "€";
    else if (concept.budget.includes("$")) detectedCurrency = "$";

    setCurrency(detectedCurrency);

    // Filter out symbol from budget text so it can be inputted nicely
    const cleanBudgetNum = concept.budget.replace(/[$,€,₹\s]/g, "");

    setFormData({
      name: concept.name,
      idea: concept.idea,
      industry: concept.industry,
      city: concept.city,
      state: concept.state,
      country: concept.country,
      budget: cleanBudgetNum,
      targetCustomers: concept.targetCustomers,
      stage: concept.stage
    });
  };

  const [loaderMessage, setLoaderMessage] = useState("Initializing Brain...");

  // Rotate messages for the AI report loader
  useEffect(() => {
    if (!isGenerating) return;
    const messages = [
      "Securing Secure API Ingress Channel...",
      "Analyzing Industry Growth Vectors...",
      "Scanning Key Aggregated Competitors...",
      "Synthesizing Dynamic Buyer Demographics...",
      "Modeling Market Saturation & SWOT Factors...",
      "Simulating 5-Year Financial Revenue Projections...",
      "Drafting 180-Day Venture Scaling Roadmap...",
      "Crafting Executive Investor One-Pager Summary..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoaderMessage(messages[i]);
      i = (i + 1) % messages.length;
    }, 3500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStageSelect = (stageValue: string) => {
    setFormData((prev) => ({ ...prev, stage: stageValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.idea || !formData.industry) return;
    
    // Ensure the symbol is prefixed exactly to guide the model and charts
    const budgetVal = formData.budget.replace(/[$,€,₹\s]/g, "");
    const formattedBudget = `${currency} ${budgetVal || "0"}`;

    onSubmit({
      ...formData,
      budget: formattedBudget
    });
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[500px]">
        <div className="relative mb-8">
          {/* Pulsing glow ring */}
          <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative p-8 bg-[#131625] border border-white/[0.01] rounded-full flex items-center justify-center w-28 h-28 shadow-[6px_6px_16px_#07090f,-6px_-6px_16px_#1f253e]">
            <Sparkles className="w-10 h-10 text-violet-400 neon-glow-purple animate-pulse" />
            <div className="absolute inset-0 border-4 border-dashed border-violet-500/20 rounded-full animate-spin [animation-duration:8s]"></div>
          </div>
        </div>
        <h3 className="text-xl font-extrabold text-white tracking-wide text-center">
          Synthesizing Investor-Ready Analysis
        </h3>
        <p className="text-slate-400 text-sm mt-3 text-center max-w-md px-4 leading-relaxed font-mono">
          {loaderMessage}
        </p>

        {/* Elegant loading bar */}
        <div className="w-64 h-2 bg-[#0b0e18] rounded-full overflow-hidden mt-6 border border-white/[0.01] shadow-[inset_2px_2px_5px_#020204,inset_-2px_-2px_5px_#121526]">
          <div className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 animate-[loading_15s_ease-in-out_infinite]"></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { width: 4%; }
            50% { width: 75%; }
            100% { width: 98%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-[#131625] border border-white/[0.02] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_24px_#07090f,-8px_-8px_24px_#1f253e] relative">
      {/* Decorative gradient spot */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center space-x-3.5 mb-8">
        <div className="p-3 bg-[#131625] rounded-2xl shadow-[inset_3px_3px_6px_#07090f,inset_-3px_-3px_6px_#1f253e] border border-white/[0.01] text-violet-400">
          <Sparkles className="w-5 h-5 text-violet-400 neon-glow-purple" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">AI Launch Advisor</h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">Describe your business concept to start instant market validation and financial model synthesis.</p>
        </div>
      </div>

      {/* Dynamic Preset Test Concepts Option */}
      <div className="mb-8 p-4 bg-[#0a0d1d] rounded-2xl border border-violet-500/10 shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center space-x-2 text-violet-400 mb-2">
          <Sparkles className="w-4 h-4 text-violet-400 neon-glow-purple" />
          <span className="text-[10px] font-black uppercase tracking-wider font-mono">Instant Sandbox Presets</span>
        </div>
        <p className="text-slate-400 text-[11px] mb-3 leading-normal font-medium max-w-2xl">
          Don't have an idea ready to write? Click any premium pre-modeled concept below to instantly populate form parameters and witness the depth of the AI validation advisor report:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_CONCEPTS.map((concept, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAutofill(concept)}
              className="p-3 bg-[#131625] border border-white/[0.01] hover:border-violet-500/35 text-slate-300 hover:text-white rounded-xl shadow-[2px_2px_6px_#07090f,-2px_-2px_6px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] transition text-left cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-1 gap-2">
                  <span className="font-extrabold text-xs text-slate-200 group-hover:text-violet-400 transition-colors truncate">{concept.name}</span>
                  <span className="text-[9px] font-bold text-violet-400/80 bg-violet-955/20 px-1.5 py-0.5 rounded border border-violet-500/10 shrink-0 font-mono">{concept.industryShort}</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-semibold">{concept.idea}</p>
              </div>
              <div className="text-[9px] text-violet-400 font-mono font-bold mt-2 hover:underline flex items-center gap-0.5 self-end">
                <span>Autofill</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name & Industry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-wider uppercase block">
              Business Name <span className="text-violet-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme SaaS Solutions"
                className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors text-sm font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-wider uppercase block">
              Industry <span className="text-violet-400">*</span>
            </label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors text-sm appearance-none cursor-pointer font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
            >
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry} className="bg-[#131625] text-white">
                  {industry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Business Idea Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 tracking-wider uppercase block">
            Business Concept & Value Proposition <span className="text-violet-400">*</span>
          </label>
          <p className="text-[11px] text-slate-400 font-semibold">
            Tell us about the problems you are solving, core features, how you stand out, and how you monetize.
          </p>
          <textarea
            name="idea"
            required
            rows={4}
            value={formData.idea}
            onChange={handleChange}
            placeholder="e.g. A web application designed to help small local hardware stores optimize their seasonal inventory using historical weather forecasts and AI predictions. Subscription model starting at $49/mo."
            className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors text-sm leading-relaxed font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a] animate-fade-in"
          />
        </div>

        {/* Row 2: Location */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 tracking-wider uppercase block">
            target Location
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City (e.g. Austin)"
                className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors text-xs font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
              />
            </div>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State/Province (e.g. TX)"
              className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors text-xs font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country (e.g. US)"
              className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors text-xs font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
            />
          </div>
        </div>

        {/* Row 3: Budget and Target Customers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <label className="text-xs font-bold text-slate-300 tracking-wider uppercase block">
                  Estimated Launch Budget
                </label>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 bg-[#0b0e18] text-slate-350 text-[10px] p-2.5 rounded shadow-2xl border border-white/[0.03] z-10 font-bold">
                    Initial capital available or needed to initiate operation.
                  </span>
                </div>
              </div>
              
              {/* Interactive Currency Switcher */}
              <div className="flex items-center space-x-1 bg-[#0b0e18] border border-white/[0.02] p-0.5 rounded-lg shadow-[inset_1px_1px_3px_#040509]">
                {(["$", "€", "₹"] as const).map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => {
                      setCurrency(symbol);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-black rounded-md transition duration-150 ${
                      currency === symbol
                        ? "bg-violet-600 text-white shadow shadow-violet-900/50"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative font-semibold">
              <div className="absolute left-3.5 top-3.5 flex items-center justify-center text-slate-400 font-extrabold text-sm pointer-events-none w-4 h-4 font-mono select-none">
                {currency}
              </div>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[$,€,₹\s]/g, "");
                  setFormData((prev) => ({ ...prev, budget: cleaned }));
                }}
                placeholder={
                  currency === "₹" 
                    ? "e.g. 5,00,000" 
                    : currency === "€" 
                      ? "e.g. 15,000" 
                      : "e.g. 10,000"
                }
                className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors text-sm font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-wider uppercase block">
              Primary Target Customers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="targetCustomers"
                value={formData.targetCustomers}
                onChange={handleChange}
                placeholder="e.g. Small-to-medium retail pharmacy owners"
                className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors text-sm font-semibold shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
              />
            </div>
          </div>
        </div>

        {/* Business Stage (Visual Selection cards) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 tracking-wider uppercase block">
            Business Stage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STAGES.map((s) => {
              const matches = formData.stage === s.value;
              return (
                <div
                  key={s.value}
                  onClick={() => handleStageSelect(s.value)}
                  className={`p-3.5 rounded-xl border cursor-pointer text-left transition duration-150 ${
                    matches
                      ? "bg-[#161b2e] border-violet-500/20 text-white shadow-[inset_2px_2px_5px_#06080d,inset_-2px_-2px_5px_#242c4b,0_0_12px_rgba(168,85,247,0.1)] font-bold"
                      : "bg-[#131625] border-white/[0.02] text-slate-300 shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] hover:shadow-[1px_1px_4px_#07090f,-1px_-1px_4px_#1f253e] hover:bg-[#1a1e33]/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs">{s.label}</p>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${matches ? "border-violet-500 bg-[#0b0e18]" : "border-slate-700"}`}>
                      {matches && <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1.5 font-semibold">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form action button container */}
        <div className="pt-5 border-t border-white/[0.03] flex justify-end">
          <button
            type="submit"
            disabled={!formData.name || !formData.idea || !formData.industry}
            className={`flex items-center space-x-2 px-6 py-3 font-bold rounded-xl text-sm transition-transform active:scale-95 ${
              formData.name && formData.idea && formData.industry
                ? "bg-[#131625] hover:bg-[#1a1e33] border border-violet-500/20 text-violet-400 shadow-[5px_5px_12px_#07090f,-5px_-5px_12px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] hover:text-white cursor-pointer"
                : "bg-[#0b0e18]/20 text-slate-600 cursor-not-allowed border border-white/[0.01]"
            }`}
          >
            <span>Analyze Launch Viability</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
