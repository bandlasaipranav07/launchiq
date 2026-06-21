import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  Loader, 
  Sparkles, 
  ChevronRight, 
  Lightbulb, 
  Zap, 
  DollarSign, 
  Rocket 
} from "lucide-react";
import { Project } from "../types";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

interface MentorPanelProps {
  projects: Project[];
}

const PRESET_PROMPTS = [
  { label: "Pricing Strategy", text: "How should I structure my subscription pricing or packages to maximize initial conversion?", icon: DollarSign },
  { label: "Marketing Plan", text: "What are three creative low-budget growth hacks to acquire our first 10 paying customers?", icon: Rocket },
  { label: "Validation Advice", text: "How do I validate demand for this concept without spending money on custom coding?", icon: Zap },
  { label: "Improve Pitch", text: "How can I articulate our value proposition to angel investors to sound highly compelling?", icon: Lightbulb }
];

export default function MentorPanel({ projects }: MentorPanelProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const currentProject = projects.find((p) => p.id === selectedProjectId) || null;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: projects[0]
        ? `I am IQMentor, your LaunchIQ personal advisor. I've automatically loaded your first project **"${projects[0].name}"**. You can switch which of your projects I advise on using the custom selector dropdown on the left. How can I assist you with validating your ideas or formulating monetization and growth pathways today?`
        : "Welcome to LaunchIQ AI Mentorship! Select or form a startup question, and I will guide you step-by-step through business creation, pricing, distribution, and funding models."
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: String(Date.now()), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/mentor", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           projectContext: currentProject,
           messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))
         })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: "model", content: data.content }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: "model", content: `I encountered an issue connecting. Please try again. ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (pId: string) => {
    setSelectedProjectId(pId);
    const targetProj = projects.find(p => p.id === pId);
    if (targetProj) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "model",
          content: `🔄 **Context Synced**: I have loaded your venture concept **"${targetProj.name}"** in the **${targetProj.industry}** industry. All subsequent growth suggestions, fundraising advice, and distribution models will be optimized precisely for this idea.`
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "model",
          content: `🔄 **Context Synced**: We have entered general startup incubation advisory mode.`
        }
      ]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fade-in text-slate-250">
      {/* Ask Side Panel (Presets & Tips) */}
      <div className="md:col-span-1 bg-[#131625] border border-white/[0.02] rounded-2xl p-5 space-y-4 shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e]">
        {/* Dynamic Project Context Selector Dropdown */}
        {projects.length > 0 && (
          <div className="space-y-1.5 pb-3 border-b border-white/[0.03]">
            <label className="text-[10px] font-black uppercase tracking-wider text-violet-400 block font-mono">Consulted Venture</label>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full bg-[#0b0e18] border border-white/[0.02] rounded-xl py-2.5 px-3 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer font-bold appearance-none shadow-[inset_1px_1px_3px_#040509,inset_-1px_-1px_3px_#14192a]"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id} className="bg-[#131625] text-slate-200">
                    {proj.name}
                  </option>
                ))}
                <option value="" className="bg-[#131625] text-slate-400">General Consultation</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 text-violet-450 text-violet-400">
          <Bot className="w-4 h-4 font-bold" />
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-200">IQMentor Sandbox</h4>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed font-semibold">
          Click any preset prompt below to obtain instant growth suggestions, marketing plans, and validation pathways tailored to your idea.
        </p>

        <div className="space-y-2.5 pt-2">
          {PRESET_PROMPTS.map((p, i) => {
            const IconComp = p.icon;
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(p.text)}
                disabled={loading}
                className="w-full flex items-center space-x-3 p-3 bg-[#131625] border border-white/[0.01] text-slate-350 hover:text-white rounded-xl shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] hover:shadow-[inset_2px_2px_5px_#07090f,inset_-2px_-2px_5px_#1f253e] text-left transition text-xs cursor-pointer group font-semibold"
              >
                <div className="p-2 bg-[#0b0e18] text-violet-400 rounded-lg shadow-[inset_1px_1px_3px_#040509,inset_-1px_-1px_3px_#14192a] group-hover:text-violet-300 transition">
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{p.label}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Display */}
      <div className="md:col-span-2 bg-[#131625] border border-white/[0.02] rounded-2xl flex flex-col h-[520px] shadow-[5px_5px_15px_#07090f,-5px_-5px_15px_#1f253e] relative overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-white/[0.03] flex items-center space-x-3 bg-[#111422]">
          <div className="w-9 h-9 rounded-full bg-[#131625] shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] border border-white/[0.01] text-violet-400 flex items-center justify-center">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-200">AI Business Mentor</h3>
            {currentProject ? (
              <p className="text-[10px] text-violet-400 font-mono font-bold tracking-wide">Managing Concept: {currentProject.name}</p>
            ) : (
              <p className="text-[10px] text-slate-450 font-mono font-bold tracking-wide">Concept Consultation Mode</p>
            )}
          </div>
        </div>

        {/* Scrollable chat section */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start space-x-2.5 max-w-[85%] ${m.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] border border-white/[0.01] ${m.role === "user" ? "bg-[#1c223c] text-violet-400" : "bg-[#0b0e18] text-indigo-400"}`}>
                  {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === "user" 
                    ? "bg-[#1c223c] border border-white/[0.02] text-slate-100 rounded-tr-none font-semibold shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e]" 
                    : "bg-[#0b0e18] border border-white/[0.01] text-slate-200 rounded-tl-none font-semibold shadow-[6px_6px_15px_#07090f,-6px_-6px_15px_#1f253e]"
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#131625] border border-white/[0.01] shadow-[3px_3px_8px_#07090f,-3px_-3px_8px_#1f253e] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div className="px-4 py-3 bg-[#0b0e18] border border-white/[0.01] rounded-2xl rounded-tl-none flex items-center space-x-2 shadow-inner">
                  <Loader className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  <span className="text-[11px] text-slate-400 font-mono font-bold">IQMentor is drafting advice...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Inputs */}
        <div className="p-4 border-t border-white/[0.03] bg-[#0b0e18]/40">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
            className="flex items-center space-x-2.5 bg-[#0b0e18] border border-white/[0.01] rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-violet-500 transition shadow-[inset_2px_2px_5px_#040509,inset_-2px_-2px_5px_#14192a]"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentProject ? `Ask about "${currentProject.name}"...` : "Ask a business question..."}
              className="flex-1 bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 py-2 px-1 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 bg-[#131625] border border-white/[0.02] hover:bg-[#1a1e33] disabled:text-slate-650 text-violet-400 shadow-[2px_2px_4px_#07090f,-2px_-2px_4px_#1f253e] hover:shadow-[inset_1px_1px_3px_#07090f,inset_-1px_-1px_3px_#1f253e] disabled:shadow-none rounded-lg transition shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
