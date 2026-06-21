import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Initialize Supabase Client
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

if (!supabase) {
  console.warn("Supabase not fully configured. Backend endpoints will run in mock/local fallback mode.");
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize client helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Business Analysis AI Generation API
app.post("/api/analyze", async (req, res) => {
  try {
    const ai = getAIClient();
    const { name, idea, industry, city, state, country, budget, targetCustomers, stage } = req.body;

    if (!name || !idea || !industry) {
      res.status(400).json({ error: "Missing required fields (name, idea, industry)" });
      return;
    }

    if (!ai) {
      // Fallback/Mock report generator when GEMINI_API_KEY is not configured
      const currencySymbol = (budget && (budget.includes("₹") || budget.toLowerCase().includes("inr"))) ? "₹" : 
                             (budget && (budget.includes("€") || budget.toLowerCase().includes("euro") || budget.toLowerCase().includes("eur"))) ? "€" : "$";
      
      const cleanBudget = budget ? budget.replace(/[$,€,₹\s]/g, "") : "15,000";
      const score = Math.min(95, Math.max(65, 75 + (name.length % 18)));
      
      const mockReport = {
        score,
        scoreExplanation: `The business concept "${name}" shows a strong viability potential in the "${industry}" sector. The initial budget of ${currencySymbol} ${cleanBudget} provides a reasonable runway for a lean MVP verification cycle. Key strengths include addressing a direct pain point for ${targetCustomers || "target audience"}, while primary risks involve market saturation and local execution constraints in ${city || "the target city"}.`,
        marketAnalysis: {
          overview: `The ${industry} industry in 2026 is experiencing rapid transition, marked by increased customer expectations, specialized micro-segment demands, and accelerated adoption of digital efficiency workflows. Platforms offering custom integrations show a high compound annual growth rate (CAGR).`,
          demand: `Demand patterns for "${idea}" are driven directly by pain points around operational delays, cost inefficiency, and fragmented service delivery currently experienced by ${targetCustomers || "potential users"}. Local customer segments indicate a strong readiness to adopt custom utilities.`,
          trends: [
            `Acceleration of digital-first integrations in the ${industry} sector.`,
            `Rising customer demand for custom solutions targeting ${targetCustomers || "specific demographics"}.`,
            `Increasing relevance of localized regulatory compliance in ${country || "the region"}.`
          ],
          sizeEstimate: `TAM (Total Addressable Market) is estimated at ${currencySymbol} ${cleanBudget} * 200, SAM (Serviceable Addressable Market) at 15% of TAM, and SOM (Serviceable Obtainable Market) representing a realistic 3-year capture of 8% of SAM.`
        },
        competitorAnalysis: {
          competitors: [
            {
              name: "Incumbent Alpha Group",
              strengths: "Large market share, high brand capital, extensive marketing budget.",
              weaknesses: "Slow feature release cycles, rigid pricing models, generic user experience.",
              advantages: `Direct, specialized alignment of feature sets specifically addressing the local requirements of ${targetCustomers || "target customers"} in ${city || "the area"}.`
            },
            {
              name: "Agile Digital Competitor Beta",
              strengths: "Fast software iterations, modern mobile/web UI.",
              weaknesses: "High customer acquisition costs (CAC), limited service depth.",
              advantages: "Lower initial cost structure and direct integration with local ecosystem partners."
            }
          ]
        },
        customerPersonas: {
          demographics: `Main buyers are professionals aged 25-54 years old, residing in ${city || "local urban centers"}, operating within the ${industry} domain.`,
          interests: [
            "Process optimization",
            "Cost-efficiency utilities",
            "High-trust vendor collaborations"
          ],
          incomeLevel: "Medium to High (consistent with discretionary service buyers)",
          painPoints: [
            "High operational overheads due to manual processes.",
            `Lack of customized features for ${targetCustomers || "their industry sector"}.`,
            "Opaque pricing models offered by legacy competitors."
          ],
          buyingBehavior: `Value-driven decision triggers. Relies heavily on peer recommendations, organic validation searches, and a trial-to-paid lifecycle.`
        },
        swotAnalysis: {
          strengths: [
            `Direct alignment of MVP features to solve pain points for ${targetCustomers || "target customers"}.`,
            `Agile starting structure based on ${currencySymbol} ${cleanBudget} seed.`,
            `Clear value proposition tailored to ${industry} trends.`
          ],
          weaknesses: [
            "Limited initial brand visibility compared to established incumbents.",
            `Bootstrapped capital constraint on marketing channels.`,
            `Dependency on early partner integrations in ${city || "the local market"}.`
          ],
          opportunities: [
            `Unlocking untapped market niches in ${city || "the region"} where incumbents have weak footprints.`,
            "Leveraging AI automation to lower operational cost structure by up to 35%.",
            "Structuring high-margin subscription models to secure recurring revenue early."
          ],
          threats: [
            "Aggressive defensive pricing actions from established competitors.",
            `Sudden compliance adjustments in ${country || "the region"}.`,
            "Initial customer trust barriers when onboarding sensitive data."
          ]
        },
        riskAssessment: {
          financial: `Operating on a starting budget of ${currencySymbol} ${cleanBudget} requires strict capital allocation. Risk is moderate; focus on securing early paying cohorts.`,
          operational: "Low to moderate. Lean structure avoids initial complexity, but hiring will be required for scaling.",
          market: `Moderate. Requires constant feedback loop validation with ${targetCustomers || "target audience"} to avoid product feature mismatch.`,
          regulatory: `Low. Basic compliance and localized registrations in ${country || "the target country"} are required within the first 30 days.`
        },
        revenueForecast: {
          conservative: [
            { year: "Year 1", value: `${currencySymbol} 15,000` },
            { year: "Year 2", value: `${currencySymbol} 35,000` },
            { year: "Year 3", value: `${currencySymbol} 75,000` },
            { year: "Year 4", value: `${currencySymbol} 150,000` },
            { year: "Year 5", value: `${currencySymbol} 280,000` }
          ],
          realistic: [
            { year: "Year 1", value: `${currencySymbol} 25,000` },
            { year: "Year 2", value: `${currencySymbol} 65,000` },
            { year: "Year 3", value: `${currencySymbol} 160,000` },
            { year: "Year 4", value: `${currencySymbol} 350,000` },
            { year: "Year 5", value: `${currencySymbol} 750,000` }
          ],
          optimistic: [
            { year: "Year 1", value: `${currencySymbol} 45,500` },
            { year: "Year 2", value: `${currencySymbol} 120,000` },
            { year: "Year 3", value: `${currencySymbol} 320,000` },
            { year: "Year 4", value: `${currencySymbol} 800,000` },
            { year: "Year 5", value: `${currencySymbol} 1,800,000` }
          ]
        },
        roadmap: {
          day30: [
            `Launch landing page with validation waitlist describing "${idea}".`,
            `Conduct direct validation interviews with at least 15 target buyers.`,
            `Finalize incorporation details and localized brand assets.`
          ],
          day90: [
            "Deploy functional MVP with core features to initial waitlisted users.",
            `Launch organic acquisition campaigns targeting local networks in ${city || "the city"}.`,
            "Gather pilot user telemetry feedback to refine product-market fit."
          ],
          day180: [
            "Incorporate usage feedback to launch premium monetization tiers.",
            "Scale acquisition channels via paid outreach and referral multipliers.",
            `Assess expansion capabilities into adjacent segments of ${country || "the country"}.`
          ]
        },
        investorSummary: `Venture concept validation for "${name}" (${industry}) presents a compelling opportunity to solve core bottlenecks for ${targetCustomers || "discretionary buyers"}. Utilizing a lean budget of ${currencySymbol} ${cleanBudget}, the founding team can achieve product validation within 90 days. Dynamic TAM estimates reveal a viable local market. While initial brand awareness is a SWOT weakness, operational agility and low overhead structures act as competitive multipliers. The viability score is highly favorable, highlighting a clear path to early recurring revenue validation.`
      };

      res.json(mockReport);
      return;
    }

    const prompt = `
Generate a comprehensive, professional, and investor-ready business launch advisor report for the following ideas:
Business Name: ${name}
Business Idea: ${idea}
Industry: ${industry}
Location: ${city ? city : "N/A"}, ${state ? state : "N/A"}, ${country ? country : "N/A"}
Budget: ${budget || "N/A"}
Target Customers: ${targetCustomers || "N/A"}
Current Stage: ${stage || "Idea"}

Fill in the required information dynamically and realistically based on industry metrics.
Provide a high-quality assessment report. Ensure growth projections and SWOT analysis represent valid, helpful analysis of this domain.
Any financial numbers in the response (e.g., in revenue forecasts, size estimates) MUST use the same currency symbol as specified in the Budget parameter (e.g., ₹, €, or $).
`;

    const systemInstruction = `You are a world-class venture capitalist, market analyst, and entrepreneurship advisor. Your output must be real, highly technical, actionable analysis for the given business. Do not use generic answers; model realistic SWOT factors, competitive advantages, demographic profiles, financial forecasts, and roadmaps based on the business details, location context, and industry trends in 2026. All financial and monetary figures in the response (such as sizeEstimate, and revenueForecast values) MUST use the exact same currency symbol/unit as supplied in the budget: ${budget || "N/A"} (e.g. if the budget has '₹' or 'INR' or 'Rupee', use '₹'; if it has '€' or 'Euro', use '€'; if 'S' or '$' or 'Dollar', use '$'). Make the analysis extremely comprehensive, professional, and SaaS premium grade.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "A business dynamic viability and alignment score from 0 to 100",
            },
            scoreExplanation: {
              type: Type.STRING,
              description: "Detailed description of why this business scored this value, covering key strengths and areas of risk.",
            },
            marketAnalysis: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING, description: "Detailed 2026 industry overview" },
                demand: { type: Type.STRING, description: "Detailed local and global demand patterns" },
                trends: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key relevant growth trends (e.g. tech, social, legal)",
                },
                sizeEstimate: { type: Type.STRING, description: "TAM / SAM / SOM projection estimate" },
              },
              required: ["overview", "demand", "trends", "sizeEstimate"],
            },
            competitorAnalysis: {
              type: Type.OBJECT,
              properties: {
                competitors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      strengths: { type: Type.STRING },
                      weaknesses: { type: Type.STRING },
                      advantages: { type: Type.STRING, description: "Your startup's unique comparative advantage over them" },
                    },
                    required: ["name", "strengths", "weaknesses", "advantages"],
                  },
                },
              },
              required: ["competitors"],
            },
            customerPersonas: {
              type: Type.OBJECT,
              properties: {
                demographics: { type: Type.STRING, description: "Age range, locations, occupation, income level of main buyers" },
                interests: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                incomeLevel: { type: Type.STRING },
                painPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific problems they have that this business solves",
                },
                buyingBehavior: { type: Type.STRING, description: "B2B/B2C, triggers, frequency, search channels" },
              },
              required: ["demographics", "interests", "incomeLevel", "painPoints", "buyingBehavior"],
            },
            swotAnalysis: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["strengths", "weaknesses", "opportunities", "threats"],
            },
            riskAssessment: {
              type: Type.OBJECT,
              properties: {
                financial: { type: Type.STRING },
                operational: { type: Type.STRING },
                market: { type: Type.STRING },
                regulatory: { type: Type.STRING },
              },
              required: ["financial", "operational", "market", "regulatory"],
            },
            revenueForecast: {
              type: Type.OBJECT,
              properties: {
                conservative: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      year: { type: Type.STRING },
                      value: { type: Type.STRING },
                    },
                    required: ["year", "value"],
                  },
                },
                realistic: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      year: { type: Type.STRING },
                      value: { type: Type.STRING },
                    },
                    required: ["year", "value"],
                  },
                },
                optimistic: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      year: { type: Type.STRING },
                      value: { type: Type.STRING },
                    },
                    required: ["year", "value"],
                  },
                },
              },
              required: ["conservative", "realistic", "optimistic"],
            },
            roadmap: {
              type: Type.OBJECT,
              properties: {
                day30: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Immediate validation & setup steps" },
                day90: { type: Type.ARRAY, items: { type: Type.STRING }, description: "MVP launch and early marketing steps" },
                day180: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Scaling and monetization expansion steps" },
              },
              required: ["day30", "day90", "day180"],
            },
            investorSummary: {
              type: Type.STRING,
              description: "A cohesive, high-impact one-pager executive and investor summary validating the model",
            },
          },
          required: [
            "score",
            "scoreExplanation",
            "marketAnalysis",
            "competitorAnalysis",
            "customerPersonas",
            "swotAnalysis",
            "riskAssessment",
            "revenueForecast",
            "roadmap",
            "investorSummary",
          ],
        },
      },
    });

    const reportData = JSON.parse(response.text || "{}");
    res.json(reportData);
  } catch (err: any) {
    console.error("AI Generation failed:", err);
    res.status(500).json({ error: err.message || "Failed to generate business analysis" });
  }
});

// 2. Chatbot AI Mentor API
app.post("/api/mentor", async (req, res) => {
  try {
    const ai = getAIClient();
    const { messages, projectContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required" });
      return;
    }

    if (!ai) {
      // ─── Dynamic IQMentor Engine (no API key) ───────────────────────────────
      const userMessage = messages[messages.length - 1]?.content || "";
      const lowerMsg = userMessage.toLowerCase();
      const ctx = projectContext;
      const venture = ctx ? `**"${ctx.name}"**` : "your venture";
      const industry = ctx?.industry || "your industry";
      const stage = ctx?.stage || "early";
      const idea = ctx?.idea || "your business concept";
      const target = ctx?.targetCustomers || "your target customers";

      // Trim the user's message for echoing back in responses
      const quotedMsg = userMessage.length > 80
        ? `"${userMessage.slice(0, 77)}..."`
        : `"${userMessage}"`;

      // Build a picture of previous conversation topics to avoid repeating
      const prevTopics = new Set<string>();
      for (const m of messages.slice(0, -1)) {
        const t = (m.content || "").toLowerCase();
        if (t.includes("pric") || t.includes("tier") || t.includes("monetiz")) prevTopics.add("pricing");
        if (t.includes("market") || t.includes("acqui") || t.includes("growth")) prevTopics.add("marketing");
        if (t.includes("mvp") || t.includes("validat") || t.includes("prototype")) prevTopics.add("validation");
        if (t.includes("pitch") || t.includes("invest") || t.includes("fund")) prevTopics.add("funding");
        if (t.includes("competi") || t.includes("rival") || t.includes("differenti")) prevTopics.add("competition");
        if (t.includes("team") || t.includes("hire") || t.includes("cofounder")) prevTopics.add("team");
        if (t.includes("revenue") || t.includes("forecast") || t.includes("profit")) prevTopics.add("revenue");
        if (t.includes("legal") || t.includes("regulat") || t.includes("compli")) prevTopics.add("legal");
        if (t.includes("tech") || t.includes("stack") || t.includes("build") || t.includes("develop")) prevTopics.add("tech");
        if (t.includes("brand") || t.includes("name") || t.includes("logo")) prevTopics.add("brand");
        if (t.includes("partner") || t.includes("distrib") || t.includes("channel")) prevTopics.add("channels");
      }

      // Randomize pick from array
      const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

      // Detect topic from user message
      const is = (keywords: string[]) => keywords.some(k => lowerMsg.includes(k));

      let mentorResponse = "";

      // ── Greeting ──────────────────────────────────────────────────────────────
      if (is(["hello", "hi", "hey", "start", "begin", "what can you", "what do you"])) {
        mentorResponse = pick([
          `Hey! I'm **IQMentor** — your startup advisor inside LaunchIQ.\n\nYou're building ${venture} in the **${industry}** space. I'm here to help you move from idea to revenue as fast as possible.\n\nI can go deep on:\n- 💰 **Pricing & monetization**\n- 📣 **Customer acquisition & growth**\n- ✅ **MVP validation**\n- 🎤 **Investor pitching & fundraising**\n- ⚔️ **Competitive positioning**\n- 👥 **Team building**\n- 📊 **Revenue & unit economics**\n- 🛠️ **Tech stack decisions**\n- ⚖️ **Legal & compliance basics**\n\nWhat's the most urgent challenge on your plate right now?`,

          `Great to connect! You're working on ${venture} at the **${stage}** stage — I know exactly what phase you're in and what matters most here.\n\nTell me what's on your mind. Whether it's getting your first customers, figuring out pricing, or preparing for investors — I'll give you direct, actionable advice, not generic startup advice you've already heard.\n\nWhat do you want to tackle?`,
        ]);

      // ── Pricing ───────────────────────────────────────────────────────────────
      } else if (is(["pricing", "price", "tier", "subscription", "monetiz", "charge", "how much", "revenue model", "freemium", "per month", "per year", "annual plan"])) {
        const pricingOptions = [
          `You asked about pricing — great timing to nail this for ${venture}.\n\nHere's the framework I'd apply for **${industry}** at the **${stage}** stage:\n\n**Step 1 — Anchor on value delivered, not your costs:**\nWhat is the measurable outcome ${target} gets from ${venture}? Time saved? Revenue gained? If you can quantify it, price at 10-20% of that value.\n\n**Step 2 — Three-tier structure:**\n- 🆓 **Free / Trial**: Removes all friction, lets users hit the "aha moment"\n- 💼 **Pro (your main tier)**: Solves the core pain completely — this is where 70%+ of revenue will come from\n- 🏢 **Enterprise**: High-touch, custom, quoted individually\n\n**Step 3 — Early adopter offer:**\nOffer your first 20 customers a "founder rate" (40-60% off lifetime) in exchange for testimonials and feedback. This creates urgency and social proof simultaneously.\n\nWhat does it cost you to serve one customer per month? Let's work out your minimum viable price from there.`,

          `Pricing for ${venture} — you're asking the right question. Most founders price too low and it hurts them in two ways: thin margins *and* attracting price-sensitive customers who churn.\n\n**Psychological pricing rules that work in ${industry}:**\n- $97/mo anchors better than $100/mo, but communicates similar value\n- Annual plans (with 20% discount) give you 12 months of cash upfront\n- "Per seat" pricing scales revenue without adding product complexity\n\n**The "Mom Test" for pricing:**\nDon't ask "What would you pay?" — people always lowball. Instead ask: *"What would this need to cost to be a complete no-brainer for you?"* That gives you their ceiling.\n\n**Competitor anchor:**\n- Penetration entry: competitor price × 0.7\n- Premium positioning: competitor price × 1.3\n\nWhich direction fits ${venture}'s brand better — value leader or premium?`,

          `Good question on pricing for ${venture}. Let me cut straight to what works at the **${stage}** stage:\n\n**Freemium vs. Free Trial vs. Paid-only — which fits?**\n- **Freemium** → only if you have a viral loop or network effect (most early startups don't)\n- **Free Trial (14-30 days)** → best for most B2B SaaS: removes friction, pre-qualifies serious buyers\n- **Paid-only** → works when your buyers have budgets and expect to pay (enterprise, professional tools)\n\nFor **${industry}**, I'd default to a **time-limited free trial** with credit card required upfront — it filters tire-kickers and gets you real conversion data fast.\n\nDo you have a sense of what competitors charge? I can help you position relative to them.`,
        ];
        mentorResponse = pick(prevTopics.has("pricing") ? pricingOptions.slice(1) : pricingOptions);

      // ── Marketing / Growth / Acquisition ─────────────────────────────────────
      } else if (is(["marketing", "acquire", "acquisition", "get customer", "first customer", "growth", "traffic", "lead", "advertis", "seo", "social media", "content", "viral", "promote", "reach"])) {
        mentorResponse = pick([
          `You're asking how to get customers for ${venture} — the right question at the **${stage}** stage.\n\nHere's the honest truth: **don't run ads yet**. Ads amplify a message that already converts. Before you know what converts, you'll burn money.\n\n**Your 30-day customer acquisition plan for ${industry}:**\n\n1. **Direct outreach (Week 1-2):** Identify 50 people who match ${target} on LinkedIn, Twitter, or local groups. Send a 3-sentence personalized message explaining the exact problem ${venture} solves. Offer a free 30-min call — no pitch.\n\n2. **Community presence (Week 2-3):** Find 3 online communities where ${target} hangs out. Answer questions. Share useful content. Don't promote directly — build trust first.\n\n3. **Strategic partnerships (Week 3-4):** Find 2-3 non-competing businesses already serving ${target}. Propose a mutual referral deal — no cash needed.\n\nThe goal isn't volume — it's your first 5 conversations that lead to 2 paying customers. What's your current outreach doing?`,

          `Getting your first customers for ${venture} in **${industry}** — here's a phase-based approach:\n\n**Phase 1: Manual & Scrappy (0 → 10 customers)**\n- Every customer acquired by hand — no automation yet\n- Personalize every message. Generic outreach gets 0% reply rate\n- Ask each customer: *"Who else should I be talking to?"* — referrals cost nothing\n\n**Phase 2: Systematize (10 → 100 customers)**\n- Turn your best-performing outreach message into a repeatable template\n- Build a basic CRM (even a Notion table works)\n- Launch a simple referral program: give existing customers a discount for referrals\n\n**Phase 3: Scale (100+ customers)**\n- *Now* invest in paid ads — you have proof of what message converts\n- SEO content targeting long-tail terms your ${target} searches\n\nWhich phase is ${venture} in right now?`,

          `The most underused growth tactic for **${industry}** startups targeting ${target}? **Strategic partnerships with non-competing businesses that already have your audience.**\n\n**Here's the exact playbook:**\n1. List 15 businesses that serve ${target} but don't compete with ${venture}\n2. Reach out with a specific value offer: *"I'll promote your product to my audience if you promote mine to yours"*\n3. Co-create one piece of content together (webinar, guide, tool)\n4. Cross-promote to each other's lists\n\nThis approach can add 20-50 customers in 60 days with zero ad spend.\n\nWhat channels have you already tried? I'll help you optimize the one showing the most signal before you switch tactics.`,
        ]);

      // ── MVP / Validation ──────────────────────────────────────────────────────
      } else if (is(["validate", "validation", "mvp", "minimum viable", "prototype", "test", "smoke test", "landing page", "waitlist", "build first", "what to build", "where to start"])) {
        mentorResponse = pick([
          `You're asking about validation for ${venture} — the single most important thing to get right before writing any code.\n\n**The 3-week Validation Sprint:**\n\n**Week 1 — Problem validation:**\nTalk to 15 people who match ${target}. Ask: *"Walk me through the last time you dealt with [problem]."* Just listen. Don't pitch.\n\n**Week 2 — Solution validation:**\nShow a mockup (Figma, slides, or even a sketch). Ask: *"If this existed today, would you use it? Would you pay $X/month?"*\n\n**Week 3 — Demand validation:**\nBuild a single-page site with a waitlist or pre-order button. Drive 200 targeted visitors to it. If 5%+ sign up or pre-pay → you have enough signal to build.\n\n**The one signal that matters:** Someone trying to hand you money before the product exists. Everything else is noise.\n\nWhere are you in this process right now?`,

          `For ${venture}, the fastest validation approach is the **Concierge MVP** — manually deliver the service to 3 customers before building any technology.\n\nFor example: if ${venture} automates a workflow for ${target}, do that workflow manually for 3 clients. Charge them. If they pay and ask for more — *then* automate it.\n\nThis approach:\n- ⚡ Takes 2-4 weeks instead of 3-6 months\n- 💵 Generates real revenue from day 1\n- 🧠 Teaches you exactly what to build\n\n**My rule:** Don't build anything until at least 3 customers have paid for the outcome.\n\nWhat's the smallest version of ${venture} you could deliver manually to one customer this week?`,

          `Validation question — let me give you the **$0 test** you can run this week for ${venture}:\n\n1. Write one clear sentence: *"${venture} helps ${target} do [X] so they can [Y]."*\n2. Post it in 3 communities where ${target} spends time\n3. Add: *"DM me if you want early access at 50% off — I'm onboarding 10 founding members"*\n4. Count the DMs in 72 hours\n\n**How to read the results:**\n- 0 DMs → Problem or audience mismatch — rewrite the sentence, try again\n- 1-4 DMs → Weak signal — the problem is real but messaging needs work\n- 5+ DMs → Strong signal — start building immediately\n\nHave you written that one-sentence value proposition yet? Share it and I'll help you sharpen it.`,
        ]);

      // ── Investor / Funding / Pitch ─────────────────────────────────────────────
      } else if (is(["pitch", "investor", "funding", "raise", "angel", "vc", "venture capital", "seed", "series a", "deck", "valuation", "how to raise", "get investment"])) {
        mentorResponse = pick([
          `You're asking about raising money for ${venture} — let me be straight with you about what actually works.\n\n**What investors are really buying:**\nThey're not buying your product. They're buying a *story about the future* and their belief that you're the team to execute it.\n\n**Your pitch must answer 5 questions clearly:**\n1. 🎯 **Problem**: Is this pain real, widespread, and urgent?\n2. 💡 **Solution**: Is your approach defensible or differentiated?\n3. 📈 **Market**: Is there a $100M+ opportunity here?\n4. 🏃 **Traction**: What have you proven so far, even if small?\n5. 👥 **Team**: Why are *you* uniquely positioned to win?\n\n**Common mistake:** 60% of decks are about the product, 5% about traction. Flip that. Investors fund traction + team, not features.\n\nWhat traction can ${venture} show right now — even if it's just 3 paying customers or 50 waitlist signups?`,

          `Fundraising advice for ${venture} in **${industry}** — here's the counter-intuitive truth:\n\n**Don't raise until you don't need to.**\n\nThe best raise happens when you have leverage — when investors see momentum and fear missing out, not when you're desperate. Before reaching out to investors, get to:\n- ✅ 10+ paying customers\n- ✅ Clear unit economics (you know your CAC and LTV)\n- ✅ A growth rate story (even small: "We grew 20% MoM for 3 months")\n\n**Where to find ${stage}-stage investors:**\n- AngelList / Wellfound (post your raise publicly)\n- Local angel networks and startup ecosystems\n- YC alumni network and Indie Hackers community\n- Your own customers — the best angels are people who already believe in the problem\n\n**Warm introductions beat cold outreach 10:1.** Map 2nd-degree connections to target investors before cold-emailing anyone.\n\nWhat does your current traction look like?`,

          `Funding paths for ${venture} — most founders only consider VC, but there are smarter options at the **${stage}** stage:\n\n**Non-dilutive first (keep your equity):**\n- 🏆 Government startup grants (research local programs in your country)\n- 💳 Revenue-based financing (repay from future revenue — no equity)\n- 🛒 Pre-sell annual subscriptions to fund development\n- 🧑‍🤝‍🧑 Strategic angels who are also customers in ${industry}\n\n**Dilutive options, ranked by founder-friendliness:**\n1. Friends & family — fastest, fewest strings attached\n2. Angel investors — flexible terms, faster decisions\n3. Micro-VCs ($250K-$2M) — patient capital, good for niche markets\n4. Institutional VCs — high bar, long process, but the network can be transformative\n\nFor **${industry}** at **${stage}** stage, I'd start non-dilutive and raise dilutive only once you have clear product-market fit.\n\nWhat's your current runway in months?`,
        ]);

      // ── Competition / Differentiation ─────────────────────────────────────────
      } else if (is(["competit", "rival", "differenti", "unique", "moat", "advantage", "vs ", "compare", "better than", "stand out", "why us", "why you"])) {
        mentorResponse = pick([
          `Competitive differentiation for ${venture} in **${industry}** — you're asking the right question.\n\nHere's the key insight: **you don't need to be better, you need to be different in ways that matter to ${target}.**\n\n**The 3 moats that work for early-stage startups:**\n1. **Niche focus**: Go narrower than any competitor. Own *"the best [solution] for [specific segment] in [specific context]"* — incumbents can't profitably serve ultra-specific niches\n2. **Distribution advantage**: If you have access to ${target} that others don't — that's a real moat\n3. **Speed**: You can ship features in days that large competitors take quarters to release\n\n**What NOT to compete on:**\n- Price alone (race to the bottom, attracts wrong customers)\n- Feature parity with incumbents (they have more engineers)\n- Brand awareness (they have bigger budgets)\n\nWhat's the one thing about ${venture} that a competitor cannot easily copy in 6 months?`,

          `When ${target} looks at options in **${industry}**, the question they're really asking is: *"What's the switching cost, and is it worth it?"*\n\nTo make the answer "yes" for ${venture}:\n\n**Step 1:** Identify the #1 frustration ${target} has with existing solutions. This is your entire positioning.\n\n**Step 2:** Build your product, messaging, and brand around solving *that one frustration* better than anyone.\n\n**Step 3:** Create switching costs of your own:\n- Workflow integrations that become sticky\n- Historical data that lives inside your product\n- Community or network effects among users\n\n**Red Ocean vs. Blue Ocean for ${industry}:**\n- Red Ocean = compete on the same dimensions as everyone else (hard)\n- Blue Ocean = redefine what the category even means (rare, but transformative)\n\nWhat's the core frustration with current alternatives that led you to build ${venture}?`,
        ]);

      // ── Team / Hiring ─────────────────────────────────────────────────────────
      } else if (is(["team", "hire", "hiring", "cofounder", "co-founder", "employee", "culture", "remote", "who to hire", "first hire", "equity", "vesting"])) {
        mentorResponse = pick([
          `Team question for ${venture} — this matters more than most founders realize at the **${stage}** stage.\n\n**The founding team formula:**\nThe most successful early-stage startups have at least 2 of these 3 profiles covered:\n- 🧠 **The Builder** — makes the product\n- 📣 **The Seller** — acquires customers\n- 🎨 **The Designer** — shapes the experience\n\nIf you're missing one, that's your first hire or co-founder search.\n\n**Hiring principles for early stage:**\n- Hire for *learning velocity* over current skill — the landscape changes too fast\n- Run a paid 2-week trial project before making any full offer\n- Your first 3 hires will define your culture for years — be ruthlessly selective\n\n**Equity for early team members:**\n- Engineers / key early hires: 0.5-2%, 4-year vest, 1-year cliff\n- First COO/VP: 1-5% depending on stage\n- Advisors: 0.1-0.5%, 2-year vest\n\nWhat does your current team look like — and what's the critical gap?`,

          `Hiring advice for ${venture}: **the biggest mistake at the ${stage} stage is hiring too fast.**\n\nBefore your first full-time hire:\n- Document every process you want to delegate — even a Loom video works\n- Confirm you can cover their salary for 12 months even if revenue doesn't grow\n- Ask yourself: *"Can I structure this as a contractor relationship first?"*\n\n**Where to find the right people:**\n- Indie Hackers, Twitter/X, and LinkedIn for technical and marketing talent\n- Local startup events for culture-fit candidates\n- Your own user base — early power-users sometimes become the best hires\n\n**For remote teams in ${industry}:**\n- Async-first communication (Notion, Loom, Linear)\n- Weekly 30-min video sync to maintain alignment\n- Hire self-directed people — micromanagement doesn't scale\n\nWhat role are you trying to fill, and what's the blocker you're trying to solve by hiring?`,
        ]);

      // ── Revenue / Financials / Unit Economics ─────────────────────────────────
      } else if (is(["revenue", "forecast", "profit", "financial", "unit economics", "cac", "ltv", "lifetime value", "churn", "arr", "mrr", "burn rate", "runway", "break even", "cashflow"])) {
        mentorResponse = pick([
          `Financial question for ${venture} — let's get into the numbers that actually matter.\n\n**The 3 unit economics you must understand:**\n\n1. **CAC (Customer Acquisition Cost):**\n   Total sales & marketing spend ÷ new customers acquired this period\n   *Target for ${industry}: under $500 initially*\n\n2. **LTV (Lifetime Value):**\n   Avg monthly revenue per customer ÷ monthly churn rate\n   *Your LTV/CAC ratio should be >3:1 to be fundable and sustainable*\n\n3. **Churn Rate:**\n   % of customers who cancel per month\n   *Below 3-5% monthly is healthy for B2B SaaS*\n\n**Quick health check:**\n- LTV/CAC < 1 → losing money on every customer — fix before scaling\n- LTV/CAC 1-3 → margin squeeze — optimize before scaling\n- LTV/CAC > 3 → healthy — invest in growth aggressively\n\nWhat are your current estimates for CAC and LTV? Even rough numbers help — let's calculate together.`,

          `Revenue forecasting for ${venture} — model three scenarios, not one:\n\n**Conservative (plan operations around this):**\nAssume you acquire customers at 50% of your target rate. Churn stays elevated at 8-10% monthly. This is your floor.\n\n**Realistic (pitch investors on this):**\nYou hit 80% of target, churn stabilizes at 4-5%, and you land 1-2 larger accounts.\n\n**Optimistic (celebrate if this happens):**\nProduct-market fit clicks, word-of-mouth kicks in, and you exceed all targets.\n\n**Key principle:** Your team plans from conservative. Your board sees realistic. You celebrate if you hit optimistic.\n\nFor **${industry}** at **${stage}** stage, what's your MRR target for month 12? I can help you reverse-engineer the customer acquisition rate you'd need to hit it.`,
        ]);

      // ── Legal / Compliance ────────────────────────────────────────────────────
      } else if (is(["legal", "regulat", "compli", "trademark", "patent", "incorporate", "llc", "pvt", "company", "register", "contract", "privacy policy", "gdpr", "terms"])) {
        mentorResponse = `Legal setup for ${venture} — here's the lean approach so compliance doesn't block your momentum:\n\n**Do this now (before your first customer):**\n- ✅ Register your legal entity (LLC in the US, Pvt Ltd in India, Ltd in UK — consult a local CA/lawyer for 1 hour)\n- ✅ Add a Terms of Service and Privacy Policy to your site (generators like TermsFeed or Iubenda work for early stage)\n- ✅ Use a basic client agreement for every paying customer — even a 1-page email confirmation counts\n\n**Do this before fundraising:**\n- 🔲 Trademark your brand name (critical before you scale marketing)\n- 🔲 File provisional patents if you have genuinely novel IP\n- 🔲 Formalize equity splits with a cap table and vesting agreements\n\n**For ${industry} specifically:**\nCheck for sector-specific compliance (data privacy laws, industry licenses, financial regulations). A 1-hour session with a startup lawyer is worth more than 10 hours of Googling.\n\n**My rule:** Don't let perfect legal setup block day-1 execution. Ship, earn, then formalize. What jurisdiction are you operating in?`;

      // ── Tech Stack / Development ───────────────────────────────────────────────
      } else if (is(["tech", "stack", "build", "develop", "software", "platform", "app", "api", "database", "cloud", "infrastructure", "framework", "language", "react", "node", "python", "next.js"])) {
        mentorResponse = pick([
          `Tech stack for ${venture} — my honest advice: **choose boring technology that ships fast.**\n\nAt the **${stage}** stage, your biggest technical risk isn't the wrong framework — it's over-engineering before you have product-market fit.\n\n**Lean stack that works for most startups in ${industry}:**\n- **Frontend**: Next.js or React — huge ecosystem, fast iteration\n- **Backend**: Node.js/Express or Python/FastAPI — easy to hire for\n- **Database**: PostgreSQL via Supabase (managed, free tier, auth built in)\n- **Hosting**: Vercel (frontend) + Railway or Render (backend) — deploy in minutes\n- **Auth**: Supabase Auth or Clerk — don't build auth from scratch\n- **Payments**: Stripe — integrate in 2 hours, not 2 weeks\n\n**The build vs. buy filter:**\n- Build ONLY what is your core differentiator\n- Buy/integrate everything else (auth, payments, email, analytics)\n\nEvery hour not writing code is an hour you could spend talking to customers. What's the specific technical challenge you're trying to solve?`,

          `Tech decision for ${venture}: apply the **"Does this help us acquire or retain customers?"** filter to every engineering choice.\n\nIf the answer is no — deprioritize it, no matter how technically interesting.\n\n**Common over-engineering traps to avoid:**\n- 🚫 Building custom auth (use Clerk or Supabase)\n- 🚫 Microservices before 1,000 active users (start as a monolith)\n- 🚫 Optimizing database performance before you have traffic\n- 🚫 Spending 2 weeks on CI/CD before shipping v1\n\n**The right time to refactor/scale:**\nWhen real user pain from performance forces you to — not before.\n\nFor **${industry}**: look for existing APIs and SaaS tools that do 80% of what you need. The other 20% is where you build your moat.\n\nWhat's the specific technical decision you're wrestling with?`,
        ]);

      // ── Branding / Positioning / Messaging ────────────────────────────────────
      } else if (is(["brand", "branding", "logo", "identity", "position", "messaging", "tagline", "name", "story", "narrative", "how to describe", "value prop"])) {
        mentorResponse = `Branding for ${venture} — at the **${stage}** stage, positioning clarity matters more than logo design.\n\n**Start with the Positioning Formula:**\n*"${venture} is the only [category] that [unique differentiator] for [${target}] who [key context/trigger]."*\n\nWrite that sentence. If it takes more than 10 seconds to read out loud, it's too complex.\n\n**Brand personality — define 3 things:**\n1. What 3 adjectives describe how customers should *feel* when using ${venture}?\n2. If your brand were a person at a dinner party, who would they be?\n3. What do you *stand against* (not just what you stand for)? — this creates contrast and memorability\n\n**Visual identity shortcuts (for ${stage} stage):**\n- Pick 2 brand colors max — one dominant, one accent\n- Use a single modern font (Inter, Plus Jakarta Sans, or Outfit all work well)\n- Use Looka, Brandmark, or Figma community kits for fast logo iteration\n- Consistency across touchpoints matters more than the logo itself\n\nWhat's the core emotion you want ${target} to feel the first time they interact with ${venture}?`;

      // ── Partnerships / Channels / Distribution ────────────────────────────────
      } else if (is(["partner", "partnership", "distribut", "channel", "resell", "affiliate", "referral", "ecosystem", "integration", "marketplace"])) {
        mentorResponse = `Partnerships and distribution for ${venture} — one of the most underrated growth levers in **${industry}**.\n\n**4 types of partners to consider:**\n\n1. **Integration partners**: Tools ${target} already uses daily. Getting listed in their app marketplace = free distribution to your exact audience\n2. **Reseller partners**: Agencies or consultants who already serve ${target} — give them 20-30% commission to recommend ${venture}\n3. **Referral partners**: Your happiest customers — incentivize them with account credits or cash for each referral\n4. **Strategic alliances**: Larger, non-competing companies who need your capability to complete their offering\n\n**The partnership pitch that gets a "yes":**\n*"My users need your product. Your users need mine. Let's cross-promote — zero cost to either of us."*\n\nFor **${stage}** stage: focus on 2-3 deep partnerships over 20 shallow ones. One strong integration partner can deliver more customers than 6 months of outbound.\n\nWho are the 3-5 most influential companies in the **${industry}** ecosystem that already serve ${target}?`;

      // ── SWOT / Strategy ───────────────────────────────────────────────────────
      } else if (is(["swot", "strength", "weakness", "opportunit", "threat", "strategy", "strategic", "analysis", "framework"])) {
        mentorResponse = `Strategic analysis for ${venture} in **${industry}** — let me give you a practical SWOT you can act on:\n\n**Strengths to actively leverage:**\n- ⚡ Speed: you can ship in days what incumbents ship in quarters\n- 🎯 Focus: you can go narrower and deeper than large competitors\n- 💬 Customer proximity: at **${stage}** stage, you talk directly to ${target} — that's intelligence larger companies pay millions to get\n\n**Weaknesses to manage proactively:**\n- 👁️ Limited brand awareness → counter with social proof (testimonials, case studies) early\n- 💸 Capital constraints → counter with a lean, high-margin revenue model\n- 👥 Small team → counter with ruthless prioritization (1 priority at a time)\n\n**Opportunities to capture now:**\n- Underserved niches in **${industry}** where incumbents have weak footprints\n- AI and automation tools reducing cost-to-build to near-zero\n- Increasing demand for specialized solutions over generic ones\n\n**Threats to monitor:**\n- Well-funded competitors copying your model once you prove it\n- Market timing risk — is the problem urgent enough *right now*?\n\nWhich of these quadrants is most relevant to what you're working through?`;

      // ── Next steps / Roadmap / General advice ────────────────────────────────
      } else if (is(["what should", "next step", "what to do", "where do i", "how do i", "guide me", "roadmap", "plan", "what first", "getting started", "beginning", "advice"])) {
        const stageRoadmaps: Record<string, string> = {
          "Idea": `You're at the **Idea** stage — the only job right now is **validation**. Do not write code yet.\n\n**Your 30-day action plan for ${venture}:**\n1. Write the exact problem you solve in one sentence\n2. Find 20 people who match ${target} — reach out to all of them this week\n3. Ask about the problem, not your solution (listen 80%, talk 20%)\n4. If 15+ confirm the pain is real and frequent → move to solution testing\n5. Show a sketch or mockup and ask: *"Would you pay $X for this?"*\n\n**The milestone that moves you forward:** At least 3 people say *"yes, I'd pay for this right now."*\n\nWhat's the one-sentence problem ${venture} solves?`,

          "Pre-Launch": `At **Pre-Launch**, you're closing in on launch — here's what to focus on for ${venture}:\n\n1. 🎯 Lock your core MVP feature set (3-5 features max — cut everything else)\n2. 📧 Build a pre-launch waitlist — target 200-500 emails before you open the doors\n3. 💬 Create a founding community (Discord or Slack) — give early members special access\n4. 🤝 Line up 5-10 beta testers committed to giving deep, regular feedback\n5. 📝 Write your launch announcement copy *now* — day-of stress kills good copywriting\n\n**What does your waitlist look like today?**`,

          "Launch": `${venture} is at the **Launch** stage — execution velocity is your competitive advantage right now.\n\n**90-day post-launch focus:**\n- **Days 1-30**: Support every early user obsessively. Fix every bug fast. Document every piece of feedback.\n- **Days 30-60**: Identify your 3 most successful users. Understand *exactly* why they love it. Replicate that experience for everyone.\n- **Days 60-90**: Systematize your best acquisition channel — turn what worked manually into a repeatable process.\n\n**The key metric to watch:** Time-to-value (how long until a new user gets their first "aha moment"). Minimize it.\n\nWhat's your biggest blocker to growth right now?`,

          "Growth": `At the **Growth** stage, ${venture}'s goal is repeatable, scalable acquisition.\n\n**5 priorities in order:**\n1. 📊 Double down on your single highest-converting acquisition channel — don't diversify yet\n2. 🔁 Build referral mechanics directly into the product (make it easy for happy users to invite others)\n3. 💰 Optimize pricing — can you increase ACV (annual contract value) by 20-30% without hurting conversion?\n4. 🤖 Automate onboarding to reduce time-to-value for new users\n5. 📈 Hire for the one role that is the bottleneck to your next growth milestone\n\nWhat's your current MRR and month-over-month growth rate?`,
        };
        mentorResponse = stageRoadmaps[stage] || stageRoadmaps["Idea"];

      // ── Out of scope — "limited access" framing ───────────────────────────────
      } else {
        mentorResponse = pick([
          `You asked: ${quotedMsg}\n\nMy real-time data access is limited for this specific topic — I'm specialized in startup business strategy, not general information lookups.\n\nWhat I *can* give you a sharp, actionable answer on for ${venture}:\n\n- 💰 **Pricing & revenue models**\n- 📣 **Customer acquisition tactics**\n- ✅ **MVP validation approaches**\n- 🎤 **Investor pitch preparation**\n- ⚔️ **Competitive positioning**\n- 👥 **Team & hiring decisions**\n- 📊 **Unit economics & financial modeling**\n- 🛠️ **Tech stack choices**\n- ⚖️ **Legal & compliance basics**\n\nAsk me about any of these and I'll give you something concrete and specific to ${venture}.`,

          `Regarding ${quotedMsg} — my access to real-time data on this particular topic is limited within my current advisory scope.\n\nI'm built around startup business fundamentals — the things that directly determine whether ${venture} gets traction and grows.\n\nTry rephrasing as a business challenge. For example:\n- *"How do I get my first 10 customers in ${industry}?"*\n- *"What should I charge for ${venture}?"*\n- *"How do I position ${venture} against competitors?"*\n\nI'll give you a direct, actionable answer to any of those.`,

          `That question falls outside the startup advisory data I have access to right now — I can't give you an accurate answer on it without pulling in real-time information that isn't in my scope.\n\nBut here's what I can do: if there's a **business dimension** to what you're asking — whether it's about positioning, pricing, customer acquisition, or strategy for ${venture} — frame it that way and I'll go deep.\n\nWhat's the underlying business decision you're trying to make?`,
        ]);
      }

      res.json({ content: mentorResponse });
      return;
    }

    // Prepare content query containing context and actual dialog
    let systemPrompt = `You are "IQMentor", an elite elite startup mentor and business incubator director at LaunchIQ. Your style is highly insightful, practical, concise, encouraging yet direct.
    
    You have deep knowledge of business creation, fundraising, distribution, growth hacking, local marketing, regulatory barriers, and pricing structures.
    `;

    if (projectContext) {
      systemPrompt += `\nYou are currently advising on a project named "${projectContext.name}" in the "${projectContext.industry}" industry, which is at the "${projectContext.stage}" stage. Current business idea: "${projectContext.idea}". Keep this context in mind as the business of reference!`;
    }

    // Format chat messages into Part structure
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ content: response.text });
  } catch (err: any) {
    console.error("Mentor chat failed:", err);
    res.status(500).json({ error: err.message || "Failed to communicate with mentor" });
  }
});

// ─── Supabase Data Sync endpoints ───────────────────────────────────────────

// Projects Sync
app.get("/api/projects", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: "userId query parameter is required" });
      return;
    }

    if (!supabase) {
      res.json([]);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      name: p.name,
      idea: p.idea,
      industry: p.industry,
      city: p.city || "",
      state: p.state || "",
      country: p.country || "",
      budget: p.budget || "",
      targetCustomers: p.target_customers || "",
      stage: p.stage || "",
      createdAt: p.created_at,
    }));

    res.json(mapped);
  } catch (err: any) {
    console.error("Failed to fetch projects from Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const p = req.body;
    if (!p.id || !p.userId) {
      res.status(400).json({ error: "Missing required project fields (id, userId)" });
      return;
    }

    if (!supabase) {
      res.json({ success: true, localOnly: true });
      return;
    }

    const dbProj = {
      id: p.id,
      user_id: p.userId,
      name: p.name,
      idea: p.idea,
      industry: p.industry,
      city: p.city || "",
      state: p.state || "",
      country: p.country || "",
      budget: p.budget || "",
      target_customers: p.targetCustomers || "",
      stage: p.stage || "",
      created_at: p.createdAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from("projects")
      .upsert(dbProj);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to save project to Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      res.json({ success: true, localOnly: true });
      return;
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete project from Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

// Reports Sync
app.get("/api/reports", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: "userId query parameter is required" });
      return;
    }

    if (!supabase) {
      res.json([]);
      return;
    }

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      projectId: r.project_id || "",
      userId: r.user_id,
      score: r.score,
      scoreExplanation: r.score_explanation || "",
      marketAnalysis: r.market_analysis || {},
      competitorAnalysis: r.competitor_analysis || {},
      customerPersonas: r.customer_personas || {},
      swotAnalysis: r.swot_analysis || {},
      riskAssessment: r.risk_assessment || {},
      revenueForecast: r.revenue_forecast || {},
      roadmap: r.roadmap || {},
      investorSummary: r.investor_summary || "",
      createdAt: r.created_at,
    }));

    res.json(mapped);
  } catch (err: any) {
    console.error("Failed to fetch reports from Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reports", async (req, res) => {
  try {
    const r = req.body;
    if (!r.id || !r.userId) {
      res.status(400).json({ error: "Missing required report fields (id, userId)" });
      return;
    }

    if (!supabase) {
      res.json({ success: true, localOnly: true });
      return;
    }

    const dbReport = {
      id: r.id,
      project_id: r.projectId || null,
      user_id: r.userId,
      score: r.score,
      score_explanation: r.scoreExplanation || "",
      market_analysis: r.marketAnalysis || {},
      competitor_analysis: r.competitorAnalysis || {},
      customer_personas: r.customerPersonas || {},
      swot_analysis: r.swotAnalysis || {},
      risk_assessment: r.riskAssessment || {},
      revenue_forecast: r.revenueForecast || {},
      roadmap: r.roadmap || {},
      investor_summary: r.investorSummary || "",
      created_at: r.createdAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from("reports")
      .upsert(dbReport);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to save report to Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      res.json({ success: true, localOnly: true });
      return;
    }

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete report from Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

// Notifications Sync
app.get("/api/notifications", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: "userId query parameter is required" });
      return;
    }

    if (!supabase) {
      res.json([]);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.created_at,
    }));

    res.json(mapped);
  } catch (err: any) {
    console.error("Failed to fetch notifications from Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications", async (req, res) => {
  try {
    const n = req.body;
    if (!n.id || !n.userId) {
      res.status(400).json({ error: "Missing required notification fields (id, userId)" });
      return;
    }

    if (!supabase) {
      res.json({ success: true, localOnly: true });
      return;
    }

    const dbNotif = {
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read || false,
      created_at: n.createdAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from("notifications")
      .upsert(dbNotif);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to save notification to Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      res.json({ success: true, localOnly: true });
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to mark notification read in Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

// Activity Logs Sync
app.post("/api/logs", async (req, res) => {
  try {
    const log = req.body;
    if (!log.userId) {
      res.status(400).json({ error: "Missing userId for activity log" });
      return;
    }

    if (!supabase) {
      res.json({ success: true, localOnly: true });
      return;
    }

    const dbLog = {
      user_id: log.userId,
      user_email: log.userEmail || "",
      action: log.action,
      details: log.details || "",
      created_at: log.createdAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from("activity_logs")
      .insert(dbLog);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to write activity log to Supabase:", err);
    res.status(500).json({ error: err.message });
  }
});

// Server client serving & Vite config
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Development server with Vite integration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serve
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LaunchIQ full-stack server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start LaunchIQ server:", err);
});
